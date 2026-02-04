import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  planName: string;
  successUrl?: string;
  cancelUrl?: string;
}

type BillingInterval = 'monthly' | 'annual' | 'lifetime';

// Detect billing interval from plan name
function getBillingInterval(planName: string): BillingInterval {
  if (planName === 'lifetime') return 'lifetime';
  if (planName.endsWith('_annual')) return 'annual';
  return 'monthly';
}

// Get base plan name without interval suffix
function getBasePlanName(planName: string): string {
  return planName.replace('_annual', '');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');

    if (!dodoApiKey) {
      throw new Error('DODO_PAYMENTS_API_KEY not configured');
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { planName, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    if (!planName) {
      return new Response(
        JSON.stringify({ error: 'Plan name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('name', planName)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has an active subscription to this plan
    const { data: existingSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', plan.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub) {
      return new Response(
        JSON.stringify({ error: 'You already have an active subscription to this plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For lifetime plan, check availability
    if (planName === 'lifetime') {
      const { data: spots } = await supabaseAdmin
        .from('lifetime_spots')
        .select('total_spots, sold_count')
        .single();

      if (spots && spots.sold_count >= spots.total_spots) {
        return new Response(
          JSON.stringify({ error: 'Lifetime deal is sold out' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Build the return URLs
    const baseUrl = successUrl?.split('/checkout')[0] || 'https://clearlyledger.com';
    const returnUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}`;
    const cancelReturnUrl = cancelUrl || `${baseUrl}/pricing`;

    // Create Dodo checkout session
    const dodoBaseUrl = 'https://api.dodopayments.com';
    
    // Determine billing interval and base plan
    const billingInterval = getBillingInterval(planName);
    const basePlanName = getBasePlanName(planName);

    const checkoutPayload = {
      product_cart: [
        {
          product_id: plan.dodo_product_id,
          quantity: 1
        }
      ],
      customer: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      },
      return_url: returnUrl,
      metadata: {
        user_id: user.id,
        plan_name: planName,
        plan_id: plan.id,
        billing_interval: billingInterval,
        base_plan: basePlanName
      }
    };

    // Create checkout via Dodo API - unified endpoint for all payment types
    const endpoint = `${dodoBaseUrl}/checkouts`;
    
    const dodoResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dodoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!dodoResponse.ok) {
      const contentType = dodoResponse.headers.get('content-type');
      let errorMessage = 'Failed to create checkout session';
      
      if (contentType?.includes('application/json')) {
        try {
          const errorData = await dodoResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Dodo API error:', errorData);
        } catch {
          console.error('Failed to parse Dodo error response');
        }
      } else {
        const textResponse = await dodoResponse.text();
        console.error('Dodo API returned non-JSON:', textResponse.substring(0, 500));
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dodoData = await dodoResponse.json();

    // Log the checkout attempt
    await supabaseAdmin.from('payment_events').insert({
      user_id: user.id,
      event_type: 'checkout_created',
      dodo_payment_id: dodoData.session_id,
      plan_name: planName,
      amount_cents: plan.price_cents,
      currency: 'USD',
      status: 'pending',
      raw_payload: dodoData
    });

    return new Response(
      JSON.stringify({
        checkoutUrl: dodoData.checkout_url,
        sessionId: dodoData.session_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ManageRequest {
  action: 'cancel' | 'reactivate' | 'change-plan';
  newPlanName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;

    const { action, newPlanName }: ManageRequest = await req.json();
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'cancel': {
        if (!subscription) {
          return new Response(
            JSON.stringify({ error: 'No active subscription found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Call Dodo API if subscription has a provider ID
        if (dodoApiKey && subscription.provider_subscription_id && subscription.provider_name === 'dodo') {
          const dodoRes = await fetch(
            `https://live.dodopayments.com/subscriptions/${subscription.provider_subscription_id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${dodoApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'cancelled' }),
            }
          );
          if (!dodoRes.ok) {
            const errBody = await dodoRes.text();
            console.error('Dodo cancel error:', dodoRes.status, errBody);
            return new Response(
              JSON.stringify({ error: 'Failed to cancel with payment provider' }),
              { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          await dodoRes.text(); // consume body
        }

        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            cancelled_at: new Date().toISOString(),
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        await supabaseAdmin.from('payment_events').insert({
          user_id: userId,
          event_type: 'subscription_cancelled',
          provider_subscription_id: subscription.provider_subscription_id,
          provider_name: subscription.provider_name,
          plan_name: subscription.plans?.name,
          status: 'cancelled',
          raw_payload: { action: 'cancel', cancelled_at: new Date().toISOString() },
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Subscription will be cancelled at the end of the billing period',
            expiresAt: subscription.expires_at,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reactivate': {
        if (!subscription) {
          return new Response(
            JSON.stringify({ error: 'No subscription found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!subscription.cancel_at_period_end) {
          return new Response(
            JSON.stringify({ error: 'Subscription is not pending cancellation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Call Dodo API to reactivate
        if (dodoApiKey && subscription.provider_subscription_id && subscription.provider_name === 'dodo') {
          const dodoRes = await fetch(
            `https://live.dodopayments.com/subscriptions/${subscription.provider_subscription_id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${dodoApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'active' }),
            }
          );
          if (!dodoRes.ok) {
            const errBody = await dodoRes.text();
            console.error('Dodo reactivate error:', dodoRes.status, errBody);
            return new Response(
              JSON.stringify({ error: 'Failed to reactivate with payment provider' }),
              { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          await dodoRes.text(); // consume body
        }

        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            cancelled_at: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        await supabaseAdmin.from('payment_events').insert({
          user_id: userId,
          event_type: 'subscription_reactivated',
          provider_subscription_id: subscription.provider_subscription_id,
          provider_name: subscription.provider_name,
          plan_name: subscription.plans?.name,
          status: 'active',
          raw_payload: { action: 'reactivate' },
        });

        return new Response(
          JSON.stringify({ success: true, message: 'Subscription reactivated' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'change-plan': {
        if (!newPlanName) {
          return new Response(
            JSON.stringify({ error: 'New plan name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: newPlan } = await supabaseAdmin
          .from('plans')
          .select('*')
          .eq('name', newPlanName)
          .single();

        if (!newPlan) {
          return new Response(
            JSON.stringify({ error: 'Plan not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            action: 'redirect_to_checkout',
            message: 'Please complete checkout for the new plan',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Manage subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

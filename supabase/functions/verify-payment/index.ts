import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  sessionId?: string;
  planName?: string;
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
    const { sessionId, planName }: VerifyRequest = await req.json();

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has an active subscription
    let query = supabaseAdmin
      .from('user_subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // If planName provided, check for that specific plan
    if (planName) {
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('name', planName)
        .single();

      if (plan) {
        query = query.eq('plan_id', plan.id);
      }
    }

    const { data: subscription, error: subError } = await query.maybeSingle();

    if (subError) {
      console.error('Error verifying subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (subscription) {
      return new Response(
        JSON.stringify({
          verified: true,
          subscription: {
            planName: subscription.plans?.name,
            displayName: subscription.plans?.display_name,
            status: subscription.status,
            expiresAt: subscription.expires_at,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No subscription found yet - webhook might not have processed
    return new Response(
      JSON.stringify({ verified: false, message: 'Subscription not yet active' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verify payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

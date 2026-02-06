import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManageRequest {
  action: 'cancel' | 'reactivate' | 'change-plan';
  newPlanName?: string;
}

/**
 * Manage Subscription - Provider-Agnostic Implementation
 * 
 * This edge function handles subscription management operations.
 * Currently operates only on local database state.
 * 
 * When a payment provider is integrated, this should also:
 * - Call the provider's API to cancel/reactivate subscriptions
 * - Sync subscription state with the provider
 */
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
    const { action, newPlanName }: ManageRequest = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's current active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
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

        // For lifetime plans, cancellation doesn't make sense
        if (subscription.plans?.name === 'lifetime') {
          return new Response(
            JSON.stringify({ error: 'Lifetime plans cannot be cancelled' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update local subscription status
        // Note: When a payment provider is integrated, this should also call the provider's API
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            cancelled_at: new Date().toISOString(),
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        // Log the cancellation event
        await supabaseAdmin.from('payment_events').insert({
          user_id: user.id,
          event_type: 'subscription_cancelled',
          provider_subscription_id: subscription.provider_subscription_id,
          provider_name: subscription.provider_name,
          plan_name: subscription.plans?.name,
          status: 'cancelled',
          raw_payload: { action: 'cancel', cancelled_at: new Date().toISOString() }
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Subscription will be cancelled at the end of the billing period',
            expiresAt: subscription.expires_at
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

        // Update local subscription status
        // Note: When a payment provider is integrated, this should also call the provider's API
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            cancelled_at: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        // Log the reactivation event
        await supabaseAdmin.from('payment_events').insert({
          user_id: user.id,
          event_type: 'subscription_reactivated',
          provider_subscription_id: subscription.provider_subscription_id,
          provider_name: subscription.provider_name,
          plan_name: subscription.plans?.name,
          status: 'active',
          raw_payload: { action: 'reactivate' }
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

        // Get the new plan
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

        // For plan changes, redirect to checkout for the new plan
        return new Response(
          JSON.stringify({ 
            success: true, 
            action: 'redirect_to_checkout',
            message: 'Please complete checkout for the new plan'
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

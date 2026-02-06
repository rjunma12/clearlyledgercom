import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Payment Webhook Handler - Stub Implementation
 * 
 * This edge function is a placeholder for payment provider webhook handling.
 * When a payment provider is configured, this function should:
 * 1. Verify the webhook signature
 * 2. Parse the event payload
 * 3. Handle different event types (payment_success, subscription_created, etc.)
 * 4. Update the database accordingly
 * 
 * Currently acknowledges receipt but doesn't process events.
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the webhook attempt
    console.log('Payment webhook received - no provider configured');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Try to log the body for debugging (don't parse, just log raw)
    try {
      const body = await req.text();
      console.log('Body preview:', body.substring(0, 500));
    } catch {
      console.log('Could not read request body');
    }

    // Always return 200 to acknowledge receipt
    // This prevents the payment provider from retrying
    return new Response(
      JSON.stringify({ 
        received: true,
        processed: false,
        message: 'Webhook received but no payment provider is configured'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Payment webhook error:', error);
    
    // Still return 200 to prevent retries
    return new Response(
      JSON.stringify({ 
        received: true,
        processed: false,
        error: 'Internal error processing webhook'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

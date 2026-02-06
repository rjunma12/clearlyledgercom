import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Create Checkout Session - Stub Implementation
 * 
 * This edge function is a placeholder for payment provider integration.
 * When a payment provider is configured, this function should:
 * 1. Validate the request and authenticate the user
 * 2. Create a checkout session with the payment provider
 * 3. Return the checkout URL for the client to redirect to
 * 
 * Currently returns an error indicating no payment provider is configured.
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the attempt for debugging
    console.log('Checkout session requested - no payment provider configured');

    // Return a clear error message
    return new Response(
      JSON.stringify({
        error: 'Payment provider not configured',
        code: 'PAYMENT_PROVIDER_NOT_CONFIGURED',
        message: 'The payment system is not yet configured. Please contact support.',
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Create checkout session error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

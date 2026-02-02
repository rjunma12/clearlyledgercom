import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
};

type BillingInterval = 'monthly' | 'annual' | 'lifetime';

interface DodoWebhookPayload {
  type: string;
  data: {
    payment_id?: string;
    subscription_id?: string;
    customer?: {
      customer_id?: string;
      email?: string;
    };
    status?: string;
    metadata?: {
      user_id?: string;
      plan_name?: string;
      plan_id?: string;
      billing_interval?: BillingInterval;
      base_plan?: string;
    };
    product_cart?: Array<{
      product_id: string;
      quantity: number;
    }>;
    total_amount?: number;
    currency?: string;
    recurring_pre_tax_amount?: number;
  };
}

// Calculate expiry date based on billing interval
function calculateExpiryDate(billingInterval: BillingInterval): string | null {
  if (billingInterval === 'lifetime') {
    return null; // Lifetime has no expiry
  }
  const days = billingInterval === 'annual' ? 365 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Verify webhook timestamp is recent (within 5 minutes) to prevent replay attacks
function isTimestampValid(timestamp: string): boolean {
  const webhookTime = parseInt(timestamp, 10) * 1000; // Convert to milliseconds
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return Math.abs(now - webhookTime) < fiveMinutes;
}

// Verify Dodo webhook signature
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  webhookId: string,
  secret: string
): Promise<boolean> {
  try {
    // Validate timestamp to prevent replay attacks
    if (!isTimestampValid(timestamp)) {
      console.error('Webhook timestamp is too old or in the future');
      return false;
    }

    // Dodo uses format: "v1,signature"
    const signatureParts = signature.split(',');
    const signatureHash = signatureParts.find(s => s.startsWith('v1,'))?.replace('v1,', '') || signatureParts[1];
    
    if (!signatureHash) return false;

    // Construct the signed payload
    const signedPayload = `${webhookId}.${timestamp}.${payload}`;
    
    // Create HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );
    
    // Convert to base64
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
    
    // Use constant-time comparison to prevent timing attacks
    return constantTimeEqual(computedSignature, signatureHash);
  } catch (error) {
    console.error('Signature verification error');
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('DODO_PAYMENTS_WEBHOOK_KEY');

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook headers
    const webhookId = req.headers.get('webhook-id');
    const webhookSignature = req.headers.get('webhook-signature');
    const webhookTimestamp = req.headers.get('webhook-timestamp');

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      console.error('Missing webhook headers');
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify signature
    const isValid = await verifyWebhookSignature(
      rawBody,
      webhookSignature,
      webhookTimestamp,
      webhookId,
      webhookSecret
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: DodoWebhookPayload = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Webhook received:', payload.type);

    // Log all webhook events
    const userId = payload.data?.metadata?.user_id || null;
    await supabase.from('payment_events').insert({
      user_id: userId,
      event_type: payload.type,
      dodo_payment_id: payload.data?.payment_id,
      dodo_subscription_id: payload.data?.subscription_id,
      dodo_customer_id: payload.data?.customer?.customer_id,
      amount_cents: payload.data?.total_amount || payload.data?.recurring_pre_tax_amount,
      currency: payload.data?.currency || 'USD',
      status: payload.data?.status,
      plan_name: payload.data?.metadata?.plan_name,
      raw_payload: payload
    });

    // Handle different event types
    switch (payload.type) {
      case 'payment.succeeded':
      case 'payment.completed': {
        // Handle one-time payment (Lifetime plan)
        const metadata = payload.data?.metadata;
        if (!metadata?.user_id || !metadata?.plan_name) {
          console.error('Missing metadata in payment webhook');
          break;
        }

        // Get plan by name
        const { data: plan } = await supabase
          .from('plans')
          .select('*')
          .eq('name', metadata.plan_name)
          .single();

        if (!plan) {
          console.error('Plan not found');
          break;
        }

        // For lifetime plan, update spots count
        if (metadata.plan_name === 'lifetime') {
          // Check current spots before incrementing
          const { data: spots } = await supabase
            .from('lifetime_spots')
            .select('*')
            .single();

          if (spots && spots.sold_count >= spots.total_spots) {
            console.error('Lifetime spots already sold out');
            // TODO: Consider issuing refund via Dodo API
            break;
          }

          // Increment sold count
          await supabase
            .from('lifetime_spots')
            .update({ sold_count: (spots?.sold_count || 0) + 1 })
            .eq('id', spots?.id);
        }

        // Create user subscription
        await supabase.from('user_subscriptions').upsert({
          user_id: metadata.user_id,
          plan_id: plan.id,
          status: 'active',
          dodo_payment_id: payload.data.payment_id,
          dodo_customer_id: payload.data.customer?.customer_id,
          started_at: new Date().toISOString(),
          // Lifetime has no expiry, subscriptions expire in 1 month
          expires_at: plan.is_recurring 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null
        }, {
          onConflict: 'user_id,plan_id'
        });

        console.log('Payment processed for user');
        break;
      }

      case 'subscription.active':
      case 'subscription.created': {
        // Handle subscription activation
        const metadata = payload.data?.metadata;
        if (!metadata?.user_id || !metadata?.plan_name) {
          console.error('Missing metadata in subscription webhook');
          break;
        }

        const { data: plan } = await supabase
          .from('plans')
          .select('*')
          .eq('name', metadata.plan_name)
          .single();

        if (!plan) {
          console.error('Plan not found');
          break;
        }

        // Upsert subscription
        await supabase.from('user_subscriptions').upsert({
          user_id: metadata.user_id,
          plan_id: plan.id,
          status: 'active',
          dodo_subscription_id: payload.data.subscription_id,
          dodo_customer_id: payload.data.customer?.customer_id,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
          cancelled_at: null
        }, {
          onConflict: 'user_id,plan_id'
        });

        console.log('Subscription activated for user');
        break;
      }

      case 'subscription.renewed': {
        // Handle subscription renewal
        const subscriptionId = payload.data?.subscription_id;
        if (!subscriptionId) break;

        // Find subscription and extend expiry
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('dodo_subscription_id', subscriptionId)
          .single();

        if (sub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id);
        }

        console.log('Subscription renewed');
        break;
      }

      case 'subscription.cancelled': {
        // Handle cancellation (may be immediate or at period end)
        const subscriptionId = payload.data?.subscription_id;
        if (!subscriptionId) break;

        await supabase
          .from('user_subscriptions')
          .update({
            cancelled_at: new Date().toISOString(),
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('dodo_subscription_id', subscriptionId);

        console.log('Subscription cancelled');
        break;
      }

      case 'subscription.expired':
      case 'subscription.failed': {
        // Handle subscription expiry or failure
        const subscriptionId = payload.data?.subscription_id;
        if (!subscriptionId) break;

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('dodo_subscription_id', subscriptionId);

        console.log('Subscription expired/failed');
        break;
      }

      case 'payment.failed': {
        // Log payment failure - don't revoke access immediately
        // Dodo will retry and eventually send subscription.failed if all retries fail
        console.log('Payment failed');
        break;
      }

      case 'refund.succeeded':
      case 'refund.completed': {
        // Handle refund - revoke access
        const paymentId = payload.data?.payment_id;
        if (!paymentId) break;

        // Find subscription by payment ID
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*, plans(*)')
          .eq('dodo_payment_id', paymentId)
          .single();

        if (sub) {
          // Revoke access
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'refunded',
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id);

          // If lifetime plan, decrement sold count
          if (sub.plans?.name === 'lifetime') {
            const { data: spots } = await supabase
              .from('lifetime_spots')
              .select('*')
              .single();

            if (spots && spots.sold_count > 0) {
              await supabase
                .from('lifetime_spots')
                .update({ sold_count: spots.sold_count - 1 })
                .eq('id', spots.id);
            }
          }
        }

        console.log('Refund processed');
        break;
      }

      default:
        console.log('Unhandled webhook event');
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

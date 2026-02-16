import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { DodoPayments } from "https://esm.sh/dodopayments@2.4.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');
  const dodoWebhookKey = Deno.env.get('DODO_PAYMENTS_WEBHOOK_KEY');

  if (!dodoApiKey || !dodoWebhookKey) {
    console.error('Dodo Payments secrets not configured');
    return new Response(JSON.stringify({ received: true, processed: false }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const rawBody = await req.text();
    const webhookHeaders = {
      'webhook-id': req.headers.get('webhook-id') || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
    };

    // Verify signature
    const client = new DodoPayments({ bearerToken: dodoApiKey, webhookKey: dodoWebhookKey });
    let event: any;
    try {
      event = client.webhooks.unwrap(rawBody, webhookHeaders);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Idempotency check
    const webhookId = req.headers.get('webhook-id');
    if (webhookId) {
      const { data: existing } = await supabase
        .from('payment_events')
        .select('id')
        .eq('raw_payload->>webhook_id', webhookId)
        .maybeSingle();
      if (existing) {
        console.log('Duplicate webhook, skipping:', webhookId);
        return new Response(JSON.stringify({ received: true, processed: false, reason: 'duplicate' }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const eventType = event.type as string;
    const data = event.data;
    console.log('Processing webhook event:', eventType);

    switch (eventType) {
      case 'subscription.active': {
        await handleSubscriptionActive(supabase, data, webhookId);
        break;
      }
      case 'subscription.renewed': {
        await handleSubscriptionRenewed(supabase, data, webhookId);
        break;
      }
      case 'subscription.cancelled': {
        await handleSubscriptionCancelled(supabase, data, webhookId);
        break;
      }
      case 'subscription.on_hold': {
        await handleSubscriptionOnHold(supabase, data, webhookId);
        break;
      }
      case 'payment.succeeded': {
        await handlePaymentSucceeded(supabase, data, webhookId);
        break;
      }
      case 'payment.failed': {
        await handlePaymentFailed(supabase, data, webhookId);
        break;
      }
      default:
        console.log('Unhandled event type:', eventType);
    }

    return new Response(JSON.stringify({ received: true, processed: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return new Response(JSON.stringify({ received: true, processed: false, error: 'Internal error' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function resolvePlan(supabase: any, productId: string) {
  const { data: plan } = await supabase
    .from('plans')
    .select('id, name')
    .eq('provider_product_id', productId)
    .single();
  return plan;
}

async function handleSubscriptionActive(supabase: any, data: any, webhookId: string | null) {
  const userId = data.metadata?.user_id;
  const subscriptionId = data.subscription_id || data.id;
  const productId = data.product_id;
  const customerId = data.customer?.customer_id;

  if (!userId || !productId) {
    console.error('Missing user_id or product_id in subscription.active');
    return;
  }

  const plan = await resolvePlan(supabase, productId);
  if (!plan) {
    console.error('No plan found for product_id:', productId);
    return;
  }

  // Determine billing interval from plan name
  const billingInterval = plan.name?.includes('annual') ? 'annual' : 'monthly';

  // Calculate expires_at (next billing date)
  const now = new Date();
  const expiresAt = new Date(now);
  if (billingInterval === 'annual') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  // Upsert subscription - deactivate any existing active subs first
  await supabase
    .from('user_subscriptions')
    .update({ status: 'superseded', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'active');

  await supabase.from('user_subscriptions').insert({
    user_id: userId,
    plan_id: plan.id,
    status: 'active',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    provider_customer_id: customerId,
    billing_interval: billingInterval,
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  await logEvent(supabase, {
    user_id: userId,
    event_type: 'subscription_activated',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    provider_customer_id: customerId,
    plan_name: plan.name,
    status: 'active',
    webhookId,
  });
}

async function handleSubscriptionRenewed(supabase: any, data: any, webhookId: string | null) {
  const subscriptionId = data.subscription_id || data.id;

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('id, billing_interval, user_id, plan_id')
    .eq('provider_subscription_id', subscriptionId)
    .eq('status', 'active')
    .maybeSingle();

  if (!sub) {
    console.error('No active subscription found for renewal:', subscriptionId);
    return;
  }

  const newExpiry = new Date();
  if (sub.billing_interval === 'annual') {
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
  } else {
    newExpiry.setMonth(newExpiry.getMonth() + 1);
  }

  await supabase
    .from('user_subscriptions')
    .update({ expires_at: newExpiry.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', sub.id);

  // Get plan name for logging
  const { data: plan } = await supabase.from('plans').select('name').eq('id', sub.plan_id).single();

  await logEvent(supabase, {
    user_id: sub.user_id,
    event_type: 'subscription_renewed',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    plan_name: plan?.name,
    status: 'renewed',
    webhookId,
  });
}

async function handleSubscriptionCancelled(supabase: any, data: any, webhookId: string | null) {
  const subscriptionId = data.subscription_id || data.id;

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('id, user_id, plan_id')
    .eq('provider_subscription_id', subscriptionId)
    .in('status', ['active', 'past_due'])
    .maybeSingle();

  if (!sub) {
    console.error('No subscription found for cancellation:', subscriptionId);
    return;
  }

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sub.id);

  const { data: plan } = await supabase.from('plans').select('name').eq('id', sub.plan_id).single();

  await logEvent(supabase, {
    user_id: sub.user_id,
    event_type: 'subscription_cancelled',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    plan_name: plan?.name,
    status: 'cancelled',
    webhookId,
  });
}

async function handleSubscriptionOnHold(supabase: any, data: any, webhookId: string | null) {
  const subscriptionId = data.subscription_id || data.id;

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('id, user_id, plan_id')
    .eq('provider_subscription_id', subscriptionId)
    .eq('status', 'active')
    .maybeSingle();

  if (!sub) {
    console.error('No active subscription found for on_hold:', subscriptionId);
    return;
  }

  await supabase
    .from('user_subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('id', sub.id);

  const { data: plan } = await supabase.from('plans').select('name').eq('id', sub.plan_id).single();

  await logEvent(supabase, {
    user_id: sub.user_id,
    event_type: 'subscription_on_hold',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    plan_name: plan?.name,
    status: 'past_due',
    webhookId,
  });
}

async function handlePaymentSucceeded(supabase: any, data: any, webhookId: string | null) {
  const userId = data.metadata?.user_id;
  await logEvent(supabase, {
    user_id: userId,
    event_type: 'payment_succeeded',
    provider_name: 'dodo',
    provider_payment_id: data.payment_id || data.id,
    provider_subscription_id: data.subscription_id,
    amount_cents: data.amount,
    currency: data.currency || 'USD',
    status: 'succeeded',
    webhookId,
  });
}

async function handlePaymentFailed(supabase: any, data: any, webhookId: string | null) {
  const userId = data.metadata?.user_id;
  await logEvent(supabase, {
    user_id: userId,
    event_type: 'payment_failed',
    provider_name: 'dodo',
    provider_payment_id: data.payment_id || data.id,
    provider_subscription_id: data.subscription_id,
    amount_cents: data.amount,
    currency: data.currency || 'USD',
    status: 'failed',
    webhookId,
  });
}

async function logEvent(supabase: any, params: {
  user_id?: string;
  event_type: string;
  provider_name: string;
  provider_subscription_id?: string;
  provider_customer_id?: string;
  provider_payment_id?: string;
  plan_name?: string;
  status?: string;
  amount_cents?: number;
  currency?: string;
  webhookId?: string | null;
}) {
  const { webhookId, ...rest } = params;
  await supabase.from('payment_events').insert({
    ...rest,
    raw_payload: webhookId ? { webhook_id: webhookId } : null,
  });
}

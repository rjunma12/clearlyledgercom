/**
 * Dodo Payments Webhook Handler (Express)
 * Mirrors the edge function logic using native Node.js crypto for signature verification.
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();

// =============================================================================
// SIGNATURE VERIFICATION
// =============================================================================

function verifySignature(payload: string, signature: string, timestamp: string, secret: string): boolean {
  try {
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

// =============================================================================
// HELPER: LOG EVENT
// =============================================================================

async function logEvent(params: {
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

// =============================================================================
// HELPER: RESOLVE PLAN
// =============================================================================

async function resolvePlan(productId: string) {
  const { data: plan } = await supabase
    .from('plans')
    .select('id, name')
    .eq('provider_product_id', productId)
    .single();
  return plan;
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

async function handleSubscriptionActive(data: any, webhookId: string | null) {
  const userId = data.metadata?.user_id;
  const subscriptionId = data.subscription_id || data.id;
  const productId = data.product_id;
  const customerId = data.customer?.customer_id;

  if (!userId || !productId) {
    console.error('[Webhook] Missing user_id or product_id in subscription.active');
    return;
  }

  const plan = await resolvePlan(productId);
  if (!plan) {
    console.error('[Webhook] No plan found for product_id:', productId);
    return;
  }

  const billingInterval = plan.name?.includes('annual') ? 'annual' : 'monthly';
  const now = new Date();
  const expiresAt = new Date(now);
  if (billingInterval === 'annual') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  // Supersede existing active subscriptions
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

  await logEvent({
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

async function handleSubscriptionRenewed(data: any, webhookId: string | null) {
  const subscriptionId = data.subscription_id || data.id;

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('id, billing_interval, user_id, plan_id')
    .eq('provider_subscription_id', subscriptionId)
    .eq('status', 'active')
    .maybeSingle();

  if (!sub) {
    console.error('[Webhook] No active subscription found for renewal:', subscriptionId);
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

  const { data: plan } = await supabase.from('plans').select('name').eq('id', sub.plan_id).single();

  await logEvent({
    user_id: sub.user_id,
    event_type: 'subscription_renewed',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    plan_name: plan?.name,
    status: 'renewed',
    webhookId,
  });
}

async function handleSubscriptionCancelled(data: any, webhookId: string | null) {
  const subscriptionId = data.subscription_id || data.id;

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('id, user_id, plan_id')
    .eq('provider_subscription_id', subscriptionId)
    .in('status', ['active', 'past_due'])
    .maybeSingle();

  if (!sub) {
    console.error('[Webhook] No subscription found for cancellation:', subscriptionId);
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

  await logEvent({
    user_id: sub.user_id,
    event_type: 'subscription_cancelled',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    plan_name: plan?.name,
    status: 'cancelled',
    webhookId,
  });
}

async function handleSubscriptionOnHold(data: any, webhookId: string | null) {
  const subscriptionId = data.subscription_id || data.id;

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('id, user_id, plan_id')
    .eq('provider_subscription_id', subscriptionId)
    .eq('status', 'active')
    .maybeSingle();

  if (!sub) {
    console.error('[Webhook] No active subscription found for on_hold:', subscriptionId);
    return;
  }

  await supabase
    .from('user_subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('id', sub.id);

  const { data: plan } = await supabase.from('plans').select('name').eq('id', sub.plan_id).single();

  await logEvent({
    user_id: sub.user_id,
    event_type: 'subscription_on_hold',
    provider_name: 'dodo',
    provider_subscription_id: subscriptionId,
    plan_name: plan?.name,
    status: 'past_due',
    webhookId,
  });
}

async function handlePaymentSucceeded(data: any, webhookId: string | null) {
  await logEvent({
    user_id: data.metadata?.user_id,
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

async function handlePaymentFailed(data: any, webhookId: string | null) {
  await logEvent({
    user_id: data.metadata?.user_id,
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

// =============================================================================
// ROUTE HANDLER
// =============================================================================

router.post('/', async (req: Request, res: Response) => {
  const signature = req.headers['x-dodo-signature'] as string;
  const timestamp = req.headers['x-dodo-timestamp'] as string;
  const secret = process.env.DODO_WEBHOOK_SECRET;

  if (!signature || !timestamp || !secret) {
    res.status(401).json({ error: 'Missing signature, timestamp, or webhook secret' });
    return;
  }

  // Validate timestamp (reject replays older than 5 minutes)
  const timestampMs = parseInt(timestamp, 10) * 1000;
  if (isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    res.status(401).json({ error: 'Timestamp too old or invalid' });
    return;
  }

  // Raw body comes as Buffer from express.raw()
  const rawBody = (req.body as Buffer).toString('utf-8');

  if (!verifySignature(rawBody, signature, timestamp, secret)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType: string = event.type;
    const data = event.data;
    const webhookId: string | null = (req.headers['webhook-id'] as string) || null;

    // Idempotency check
    if (webhookId) {
      const { data: existing } = await supabase
        .from('payment_events')
        .select('id')
        .eq('raw_payload->>webhook_id', webhookId)
        .maybeSingle();
      if (existing) {
        console.log('[Webhook] Duplicate, skipping:', webhookId);
        res.json({ received: true, processed: false, reason: 'duplicate' });
        return;
      }
    }

    console.log('[Webhook] Processing event:', eventType);

    switch (eventType) {
      case 'subscription.active':
        await handleSubscriptionActive(data, webhookId);
        break;
      case 'subscription.renewed':
        await handleSubscriptionRenewed(data, webhookId);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data, webhookId);
        break;
      case 'subscription.on_hold':
        await handleSubscriptionOnHold(data, webhookId);
        break;
      case 'payment.succeeded':
        await handlePaymentSucceeded(data, webhookId);
        break;
      case 'payment.failed':
        await handlePaymentFailed(data, webhookId);
        break;
      default:
        console.log('[Webhook] Unhandled event type:', eventType);
    }

    res.json({ received: true, processed: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    res.status(200).json({ received: true, processed: false, error: 'Internal error' });
  }
});

export default router;

/**
 * Paddle Billing webhook handler (Railway).
 *
 * Flow:
 *   1. Verify Paddle's signature (`paddle-signature` header).
 *   2. Update Railway's own `user_plans` table (source of truth).
 *   3. Sync the plan change to Supabase `user_subscriptions` so the frontend
 *      can read it without ever calling Railway from the browser.
 *
 * Env vars required on Railway:
 *   - PADDLE_SANDBOX_WEBHOOK_SECRET    Paddle test webhook signing secret
 *   - PADDLE_LIVE_WEBHOOK_SECRET       Paddle live webhook signing secret
 *   - SUPABASE_URL                     https://<project-ref>.supabase.co
 *   - SUPABASE_SERVICE_ROLE_KEY        Supabase service role key (server-only)
 *
 * Webhook URL format (configure in Paddle dashboard / via enable_paddle):
 *   https://<your-railway-host>/webhooks/paddle?env=sandbox
 *   https://<your-railway-host>/webhooks/paddle?env=live
 */

import type { Request, Response } from 'express';
import express from 'express';
import crypto from 'node:crypto';
import { supabase } from '../lib/supabaseClient.js';

type PaddleEnv = 'sandbox' | 'live';

// =============================================================================
// SIGNATURE VERIFICATION
// =============================================================================

/**
 * Paddle Billing signs webhooks with HMAC-SHA256. The `paddle-signature`
 * header looks like: `ts=1700000000;h1=<hex_hmac>`.
 * We HMAC `${ts}:${rawBody}` with the webhook secret and compare against `h1`.
 *
 * Spec: https://developer.paddle.com/webhooks/signature-verification
 */
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const ts = parts['ts'];
  const h1 = parts['h1'];
  if (!ts || !h1) return false;

  // Reject signatures older than 5 minutes to prevent replay attacks.
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 5 * 60) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`)
    .digest('hex');

  // Constant-time compare.
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(h1, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function getWebhookSecret(env: PaddleEnv): string {
  const secret = env === 'sandbox'
    ? process.env.PADDLE_SANDBOX_WEBHOOK_SECRET
    : process.env.PADDLE_LIVE_WEBHOOK_SECRET;
  if (!secret) throw new Error(`Missing Paddle webhook secret for env=${env}`);
  return secret;
}

// =============================================================================
// PADDLE → APP PLAN MAPPING
// =============================================================================

/**
 * Paddle "external_id" of the price → our internal plan name.
 * These external_ids are set when products/prices are created via Lovable.
 */
const PRICE_ID_TO_PLAN: Record<string, string> = {
  starter_monthly: 'starter',
  starter_annual: 'starter_annual',
  pro_monthly: 'pro',
  pro_annual: 'pro_annual',
  business_monthly: 'business',
  business_annual: 'business_annual',
};

interface NormalisedSubscription {
  userId: string;
  paddleSubscriptionId: string;
  paddleCustomerId: string;
  planKey: string;            // matches plans.name
  billingInterval: 'monthly' | 'annual';
  status: string;             // active | canceled | past_due | paused | trialing
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Pull the bits we care about out of a subscription.* event payload.
 * Returns null if we can't map it (e.g. unknown price, missing userId).
 */
function normaliseSubscriptionEvent(data: any): NormalisedSubscription | null {
  const userId: string | undefined = data?.custom_data?.userId;
  if (!userId) {
    console.warn('[paddle-webhook] No userId in custom_data, skipping');
    return null;
  }

  const item = Array.isArray(data?.items) ? data.items[0] : null;
  const priceExternalId: string | undefined = item?.price?.import_meta?.external_id;
  if (!priceExternalId) {
    console.warn('[paddle-webhook] No price.import_meta.external_id, skipping');
    return null;
  }

  const planKey = PRICE_ID_TO_PLAN[priceExternalId];
  if (!planKey) {
    console.warn(`[paddle-webhook] Unknown price external_id: ${priceExternalId}`);
    return null;
  }

  const billingInterval: 'monthly' | 'annual' =
    item?.price?.billing_cycle?.interval === 'year' ? 'annual' : 'monthly';

  return {
    userId,
    paddleSubscriptionId: data.id,
    paddleCustomerId: data.customer_id,
    planKey,
    billingInterval,
    status: data.status,
    currentPeriodStart: data?.current_billing_period?.starts_at ?? null,
    currentPeriodEnd: data?.current_billing_period?.ends_at ?? null,
    cancelAtPeriodEnd: data?.scheduled_change?.action === 'cancel',
  };
}

// =============================================================================
// SUPABASE SYNC
// =============================================================================

/**
 * Upsert the subscription row in Supabase. Keyed on
 * (user_id, provider_subscription_id) so re-subscribes after cancel insert
 * a new row instead of overwriting history.
 *
 * Looks up plan_id from the `plans` table by name first.
 */
async function syncSubscriptionToSupabase(sub: NormalisedSubscription): Promise<void> {
  // 1. Resolve plan_id from plans.name
  const { data: planRow, error: planErr } = await supabase
    .from('plans')
    .select('id')
    .eq('name', sub.planKey)
    .maybeSingle();

  if (planErr || !planRow) {
    console.error(`[paddle-webhook] Plan not found in Supabase: ${sub.planKey}`, planErr);
    return;
  }

  // 2. Upsert into user_subscriptions
  // Map Paddle status → our internal status. Treat trialing/active/past_due
  // as "active" so feature gating works during dunning; canceled stays canceled.
  const internalStatus =
    sub.status === 'canceled' ? 'canceled'
    : (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due')
      ? 'active'
      : sub.status;

  const payload = {
    user_id: sub.userId,
    plan_id: planRow.id,
    status: internalStatus,
    billing_interval: sub.billingInterval,
    provider_name: 'paddle',
    provider_subscription_id: sub.paddleSubscriptionId,
    provider_customer_id: sub.paddleCustomerId,
    started_at: sub.currentPeriodStart ?? new Date().toISOString(),
    expires_at: sub.currentPeriodEnd,
    cancel_at_period_end: sub.cancelAtPeriodEnd,
    cancelled_at: sub.status === 'canceled' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  // First, mark any previously active subscription for this user as superseded.
  // We only want one "active" row per user at a time so get_user_plan picks
  // the right one.
  if (internalStatus === 'active') {
    const { error: deactivateErr } = await supabase
      .from('user_subscriptions')
      .update({ status: 'superseded', updated_at: new Date().toISOString() })
      .eq('user_id', sub.userId)
      .eq('status', 'active')
      .neq('provider_subscription_id', sub.paddleSubscriptionId);
    if (deactivateErr) {
      console.error('[paddle-webhook] Failed to supersede old subs:', deactivateErr);
    }
  }

  // Use upsert keyed on provider_subscription_id (assumes unique constraint).
  const { error: upsertErr } = await supabase
    .from('user_subscriptions')
    .upsert(payload, { onConflict: 'provider_subscription_id' });

  if (upsertErr) {
    console.error('[paddle-webhook] Supabase upsert failed:', upsertErr);
    throw upsertErr;
  }

  console.log(
    `[paddle-webhook] Synced sub ${sub.paddleSubscriptionId} for user ${sub.userId} → ${sub.planKey} (${internalStatus})`,
  );
}

// =============================================================================
// RAILWAY user_plans SYNC (placeholder)
// =============================================================================

/**
 * TODO: Replace this with your existing Railway user_plans update logic.
 * This function is called BEFORE the Supabase sync so Railway stays the
 * source of truth.
 */
async function updateRailwayUserPlan(_sub: NormalisedSubscription): Promise<void> {
  // e.g. await db.query('INSERT INTO user_plans ... ON CONFLICT ...', [...]);
  // Left as a no-op here so this file is drop-in safe; wire up to your
  // existing Railway database layer.
}

// =============================================================================
// EVENT ROUTER
// =============================================================================

async function handleEvent(event: any): Promise<void> {
  const type: string = event?.event_type;
  const data = event?.data;

  switch (type) {
    case 'subscription.created':
    case 'subscription.updated':
    case 'subscription.activated':
    case 'subscription.canceled':
    case 'subscription.past_due':
    case 'subscription.paused':
    case 'subscription.resumed': {
      const sub = normaliseSubscriptionEvent(data);
      if (!sub) return;
      await updateRailwayUserPlan(sub);
      await syncSubscriptionToSupabase(sub);
      return;
    }

    case 'transaction.completed':
    case 'transaction.payment_failed':
      // Optional: log to payment_events. Not required for plan gating.
      console.log(`[paddle-webhook] ${type} for txn ${data?.id}`);
      return;

    default:
      console.log(`[paddle-webhook] Unhandled event: ${type}`);
  }
}

// =============================================================================
// EXPRESS ROUTER
// =============================================================================

const router = express.Router();

/**
 * IMPORTANT: this route uses the *raw* body so we can verify the signature
 * byte-for-byte. The global `express.json()` parser must NOT run on this
 * path — mount this router BEFORE `app.use(express.json(...))` in index.ts,
 * or skip JSON parsing for `/webhooks/paddle`.
 */
router.post(
  '/paddle',
  express.raw({ type: 'application/json', limit: '1mb' }),
  async (req: Request, res: Response) => {
    try {
      const env = (req.query.env === 'live' ? 'live' : 'sandbox') as PaddleEnv;
      const secret = getWebhookSecret(env);

      const rawBody = req.body instanceof Buffer
        ? req.body.toString('utf8')
        : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      const signature = req.header('paddle-signature');
      if (!verifyPaddleSignature(rawBody, signature, secret)) {
        console.warn(`[paddle-webhook] Invalid signature (env=${env})`);
        return res.status(401).json({ error: 'invalid signature' });
      }

      const event = JSON.parse(rawBody);
      await handleEvent(event);

      // Always 200 quickly so Paddle doesn't retry.
      res.json({ received: true });
    } catch (err) {
      console.error('[paddle-webhook] Error:', err);
      // Return 200 so Paddle doesn't retry forever on our own bugs;
      // we have logs to recover from.
      res.status(200).json({ received: false });
    }
  },
);

export default router;

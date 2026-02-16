

## Integrate Dodo Payments into ClearlyLedger

This plan implements the full Dodo Payments integration: checkout session creation, webhook handling for subscription lifecycle, and subscription management via the Dodo API.

---

### Prerequisites: Two Secrets Needed

Before any code changes, two secrets must be added:

1. **DODO_PAYMENTS_API_KEY** -- Your API key from the Dodo Payments dashboard (Dashboard > Developers > API Keys)
2. **DODO_PAYMENTS_WEBHOOK_KEY** -- Your webhook signing secret (will be obtained after deploying the webhook function and registering the endpoint URL in Dodo's dashboard)

The webhook URL to register in Dodo Payments will be:
`https://ymybvkzjboqslyjabuac.supabase.co/functions/v1/payment-webhook`

Events to enable: `subscription.active`, `subscription.cancelled`, `subscription.renewed`, `subscription.on_hold`, `payment.succeeded`, `payment.failed`

---

### Files to Modify (4 files)

#### 1. `supabase/config.toml` -- Add JWT bypass for webhook

The payment-webhook function receives calls from Dodo's servers (no JWT). Add:

```toml
[functions.payment-webhook]
verify_jwt = false
```

#### 2. `supabase/functions/create-checkout-session/index.ts` -- Full implementation

Replace the stub with a working implementation that:

- Authenticates the user via JWT (Authorization header)
- Reads `planName`, `successUrl`, `cancelUrl` from request body
- Looks up the plan's `provider_product_id` from the `plans` table
- Calls the Dodo Payments REST API (`POST https://live.dodopayments.com/checkouts`) with:
  - `product_cart: [{ product_id, quantity: 1 }]`
  - `customer: { email }` (from auth user)
  - `return_url` (the successUrl)
  - `metadata: { user_id, plan_name }` for webhook correlation
  - `payment_method_types: ["credit", "debit"]`
- Returns `{ checkoutUrl, sessionId }` to the frontend

#### 3. `supabase/functions/payment-webhook/index.ts` -- Full implementation

Replace the stub with a working Dodo webhook handler that:

- Verifies the webhook signature using the `dodopayments` npm package (`DodoPayments.webhooks.unwrap`)
- Implements idempotency checking via `webhook-id` header against `payment_events` table
- Handles these event types:
  - **`subscription.active`**: Creates/updates `user_subscriptions` row (maps `product_id` to plan, sets status=active, billing dates), logs to `payment_events`
  - **`subscription.renewed`**: Updates `expires_at`/next billing date, logs event
  - **`subscription.cancelled`**: Sets `status=cancelled`, `cancelled_at`, logs event
  - **`subscription.on_hold`**: Sets `status=past_due`, logs event
  - **`payment.succeeded`**: Logs payment event with amount/currency
  - **`payment.failed`**: Logs payment failure event
- Uses `metadata.user_id` from the webhook payload to link subscriptions to users
- Uses `provider_product_id` on the `plans` table to resolve which plan was purchased
- Sets `provider_name = 'dodo'` on all records

#### 4. `supabase/functions/manage-subscription/index.ts` -- Add Dodo API calls

Extend the existing local-only implementation to also call the Dodo API:

- **Cancel**: If `provider_subscription_id` exists, call `PATCH https://live.dodopayments.com/subscriptions/{id}` with `{ status: "cancelled" }` before updating local DB
- **Reactivate**: Call `PATCH https://live.dodopayments.com/subscriptions/{id}` with `{ status: "active" }` before updating local DB
- Add `DODO_PAYMENTS_API_KEY` env var check at the start

---

### Technical Details

**Dodo Payments API endpoints used:**
- `POST https://live.dodopayments.com/checkouts` -- Create checkout session
- `PATCH https://live.dodopayments.com/subscriptions/{id}` -- Update subscription status

**Webhook signature verification:**
Using the official `dodopayments` package (imported via esm.sh in Deno):
```text
import { DodoPayments } from 'https://esm.sh/dodopayments@2.4.1';
const client = new DodoPayments({ bearerToken: apiKey, webhookKey: webhookKey });
client.webhooks.unwrap(rawBody, { headers: webhookHeaders });
```

**Plan mapping in webhook:**
The webhook payload includes `data.product_id`. The function queries the `plans` table matching `provider_product_id` to resolve the internal plan, then creates/updates the `user_subscriptions` row with the correct `plan_id`.

**User correlation:**
The checkout session includes `metadata: { user_id }`. The webhook payload returns this metadata, allowing the webhook to link subscriptions to the correct user.

**CORS headers updated:**
The payment-webhook function needs additional allowed headers for Dodo's webhook signature headers: `webhook-id, webhook-signature, webhook-timestamp`.

**No database migration needed** -- all required tables and columns already exist (`user_subscriptions`, `payment_events`, `plans.provider_product_id`).

**No frontend changes needed** -- the `useCheckout` hook and `CheckoutSuccess` page already handle the flow correctly (call edge function, redirect to `checkoutUrl`, poll for subscription on return).


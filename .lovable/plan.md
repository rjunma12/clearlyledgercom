

## Add Dodo Webhook Handler to the Express Server

Create a new `server/webhooks/dodo.ts` file that handles Dodo payment webhooks on the Express server, and register it as a route in `server/index.ts`. This mirrors the logic already in the edge function but runs on the Node.js/Express backend.

---

### Files to Create (1 file)

#### `server/webhooks/dodo.ts`

A standalone Express route handler that:

- **Verifies the webhook signature** using Node.js `crypto.createHmac('sha256', secret)` with HMAC-SHA256, comparing `x-dodo-signature` header against computed hash of `${timestamp}.${rawBody}` using `crypto.timingSafeEqual`
- **Validates timestamp** to reject replays older than 5 minutes
- **Checks idempotency** via `webhook-id` header against the `payment_events` table
- **Handles event types**: `payment.succeeded`, `payment.failed`, `subscription.active`, `subscription.renewed`, `subscription.cancelled`, `subscription.on_hold`
- **Uses the shared Supabase client** (`server/lib/supabaseClient.ts`) for all database operations
- **Logs events** to `payment_events` table and updates `user_subscriptions` table (same logic as the edge function)

Exports a default Express `Router` mounted at `POST /`.

#### Env var required: `DODO_WEBHOOK_SECRET` in the server's `.env` (the raw HMAC secret for the Express endpoint -- distinct from the edge function's `DODO_PAYMENTS_WEBHOOK_KEY`)

---

### Files to Modify (1 file)

#### `server/index.ts`

- Import the new webhook router: `import dodoWebhookRouter from './webhooks/dodo.js'`
- **Add raw body parsing middleware** for the webhook route only (before `express.json()`), since signature verification needs the raw request body:
  ```text
  app.use('/api/webhooks/dodo', express.raw({ type: 'application/json' }));
  ```
- Mount the route: `app.use('/api/webhooks/dodo', dodoWebhookRouter)`
- Place this **before** the general `express.json()` middleware so the raw body is preserved

---

### Technical Details

**Signature verification approach:**
The edge function uses the `dodopayments` SDK. The Express handler uses native `crypto` for HMAC-SHA256, matching the code fragments you provided:

```text
const signedPayload = `${timestamp}.${rawBody}`;
const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
```

**Raw body handling:**
Express's `express.json()` parses the body before the webhook handler can access the raw string. The route-specific `express.raw()` middleware is applied only to `/api/webhooks/dodo` and must be registered before `express.json()`.

**Shared logic with edge function:**
Both the edge function (`supabase/functions/payment-webhook/index.ts`) and this Express handler will process the same event types with the same database operations. They serve as independent endpoints -- you can register either URL in the Dodo dashboard depending on your deployment topology.

**Event handler functions** (all using the shared Supabase service-role client):
- `handlePaymentSucceeded` -- logs to `payment_events`
- `handlePaymentFailed` -- logs to `payment_events`
- `handleSubscriptionActive` -- resolves plan via `provider_product_id`, supersedes existing active subs, inserts new `user_subscriptions` row, logs event
- `handleSubscriptionRenewed` -- extends `expires_at`, logs event
- `handleSubscriptionCancelled` -- sets status to `cancelled`, logs event
- `handleSubscriptionOnHold` -- sets status to `past_due`, logs event

**No new dependencies needed** -- `crypto` is a Node.js built-in, and `@supabase/supabase-js` is already in `server/package.json`.


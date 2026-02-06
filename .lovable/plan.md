
# Complete Dodo Payments Removal and Provider-Agnostic Payment System

## Overview

This plan removes all Dodo Payments integration and creates a clean, provider-agnostic payment abstraction layer ready for future integration with any payment provider.

## Scope of Changes

### 1. Edge Functions to Delete (4 functions)
| Function | Purpose | Action |
|----------|---------|--------|
| `supabase/functions/create-checkout/` | Dodo checkout session creation | Delete entirely |
| `supabase/functions/dodo-webhook/` | Dodo webhook handler | Delete entirely |
| `supabase/functions/verify-payment/` | Payment verification via Dodo | Delete entirely |
| `supabase/functions/manage-subscription/` | Subscription management via Dodo API | Refactor to provider-agnostic |

### 2. Frontend Files to Modify

| File | Change |
|------|--------|
| `src/hooks/use-checkout.tsx` | Replace with provider-agnostic abstraction (stub implementation) |
| `src/hooks/use-subscription-management.tsx` | Refactor to use new abstraction layer |
| `src/pages/CheckoutSuccess.tsx` | Refactor to generic payment success page |
| `src/components/PricingSection.tsx` | Remove "Secure payment via Dodo" text |
| `src/components/dashboard/SubscriptionCard.tsx` | Remove any Dodo-specific logic |

### 3. Database Schema Changes

Remove Dodo-specific columns from tables:

```text
┌─────────────────────────────────────────────────────────────────┐
│ payment_events table                                            │
├─────────────────────────────────────────────────────────────────┤
│ REMOVE: dodo_payment_id, dodo_subscription_id, dodo_customer_id │
│ ADD: provider_payment_id, provider_subscription_id,             │
│      provider_customer_id, provider_name                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ user_subscriptions table                                        │
├─────────────────────────────────────────────────────────────────┤
│ REMOVE: dodo_subscription_id, dodo_payment_id, dodo_customer_id │
│ ADD: provider_subscription_id, provider_payment_id,             │
│      provider_customer_id, provider_name                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ plans table                                                     │
├─────────────────────────────────────────────────────────────────┤
│ REMOVE: dodo_product_id                                         │
│ ADD: provider_product_id, provider_price_id                     │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Secrets to Remove

| Secret | Description |
|--------|-------------|
| `DODO_PAYMENTS_API_KEY` | Dodo API key |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo webhook signing key |
| `DODO_MODE` | Dodo environment mode |

---

## New Payment Abstraction Layer

### Directory Structure

```text
src/
├── lib/
│   └── payments/
│       ├── index.ts              # Main exports
│       ├── types.ts              # Provider-agnostic type definitions
│       ├── PaymentProvider.ts    # Abstract interface
│       ├── events.ts             # Standard webhook event types
│       └── errors.ts             # Payment error types
│
supabase/functions/
├── payment-webhook/
│   └── index.ts                  # Provider-agnostic webhook handler (stub)
├── create-checkout-session/
│   └── index.ts                  # Provider-agnostic checkout (stub)
└── manage-subscription/
    └── index.ts                  # Refactored subscription management
```

### Core Interfaces

**PaymentProvider Interface:**
```typescript
interface PaymentProvider {
  name: string;
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  reactivateSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
}
```

**Standard Webhook Events:**
```typescript
type PaymentWebhookEventType =
  | 'payment_success'
  | 'payment_failed'
  | 'subscription_created'
  | 'subscription_renewed'
  | 'subscription_canceled'
  | 'subscription_expired'
  | 'refund_completed';
```

---

## Implementation Steps

### Phase 1: Database Migration
1. Create migration to add provider-agnostic columns
2. Create migration to drop Dodo-specific columns

### Phase 2: Create Payment Abstraction Layer
1. Create `src/lib/payments/types.ts` with interfaces
2. Create `src/lib/payments/PaymentProvider.ts` abstract class
3. Create `src/lib/payments/events.ts` with webhook event types
4. Create `src/lib/payments/errors.ts` for payment errors
5. Create `src/lib/payments/index.ts` to export all

### Phase 3: Delete Dodo Edge Functions
1. Delete `supabase/functions/create-checkout/`
2. Delete `supabase/functions/dodo-webhook/`
3. Delete `supabase/functions/verify-payment/`

### Phase 4: Create Stub Edge Functions
1. Create `supabase/functions/create-checkout-session/index.ts` (returns "not configured")
2. Create `supabase/functions/payment-webhook/index.ts` (stub handler)
3. Refactor `supabase/functions/manage-subscription/index.ts` to be provider-agnostic

### Phase 5: Update Frontend
1. Update `src/hooks/use-checkout.tsx` to use new abstraction
2. Update `src/hooks/use-subscription-management.tsx`
3. Update `src/pages/CheckoutSuccess.tsx` to be generic
4. Update `src/components/PricingSection.tsx` - remove Dodo mention
5. Update `src/components/dashboard/SubscriptionCard.tsx`

### Phase 6: Cleanup
1. Remove Dodo secrets (will need manual removal from dashboard)

---

## Technical Details

### New Edge Function: create-checkout-session (Stub)

```typescript
// Returns error indicating no payment provider configured
serve(async (req) => {
  return new Response(
    JSON.stringify({ 
      error: 'Payment provider not configured',
      code: 'PAYMENT_PROVIDER_NOT_CONFIGURED'
    }),
    { status: 503, headers: corsHeaders }
  );
});
```

### New Edge Function: payment-webhook (Stub)

```typescript
// Placeholder for future payment provider webhook
serve(async (req) => {
  console.log('Payment webhook received - no provider configured');
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

### Refactored manage-subscription

Removes all Dodo API calls, operates only on local database:
- Cancel: Sets `cancel_at_period_end = true`
- Reactivate: Sets `cancel_at_period_end = false`
- Logs events to `payment_events` table

### Frontend Changes

**use-checkout.tsx:**
- Returns clear error message when no provider configured
- Ready to accept provider implementation

**PricingSection.tsx line 510:**
```typescript
// FROM: "Secure payment via Dodo • Cancel anytime • No hidden fees"
// TO: "Secure payments • Cancel anytime • No hidden fees"
```

---

## Post-Removal Verification

### Zero Dodo References Checklist
- [ ] No "dodo" or "Dodo" in any `.ts`, `.tsx`, `.json`, `.toml` files
- [ ] No `DODO_*` environment variables
- [ ] No database columns containing "dodo"
- [ ] No outbound network calls to `*.dodopayments.com`

### Payment System Ready for Integration
- [ ] `PaymentProvider` interface defined
- [ ] Standard webhook event types defined
- [ ] Stub edge functions return appropriate errors
- [ ] Database schema is provider-agnostic
- [ ] Frontend shows "coming soon" or disabled state

---

## Files Summary

### Files to Delete
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/dodo-webhook/index.ts`
- `supabase/functions/verify-payment/index.ts`

### Files to Create
- `src/lib/payments/types.ts`
- `src/lib/payments/PaymentProvider.ts`
- `src/lib/payments/events.ts`
- `src/lib/payments/errors.ts`
- `src/lib/payments/index.ts`
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/payment-webhook/index.ts`

### Files to Modify
- `src/hooks/use-checkout.tsx`
- `src/hooks/use-subscription-management.tsx`
- `src/pages/CheckoutSuccess.tsx`
- `src/components/PricingSection.tsx`
- `supabase/functions/manage-subscription/index.ts`

### Database Migrations
1. Add provider-agnostic columns to `payment_events`, `user_subscriptions`, `plans`
2. Drop dodo-specific columns from all tables

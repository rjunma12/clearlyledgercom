
# Plan: Fix Dodo Payments Checkout Integration

## Issue Identified

When users sign in and press a pay button, the checkout gets stuck in a loading state. The root cause is a **DNS resolution error** when calling the Dodo Payments API:

```
error sending request for url (https://api.dodopayments.com/v1/subscriptions): 
dns error: failed to lookup address information
```

## Root Cause Analysis

The `create-checkout` edge function has three critical issues:

| Issue | Current Code | Correct API |
|-------|--------------|-------------|
| Wrong API URL | `https://api.dodopayments.com/v1` | `https://api.dodopayments.com` (live) or `https://test.dodopayments.com` (test) |
| Wrong endpoint | `/subscriptions` and `/payments` | `/checkouts` (unified for both) |
| Wrong response field | `dodoData.payment_link` | `dodoData.checkout_url` |

According to the Dodo Payments documentation, the unified checkout API:
- Uses `POST /checkouts` for both subscriptions and one-time payments
- Returns `checkout_url` (not `payment_link`)
- Returns `session_id` (not `payment_id` or `subscription_id`)

---

## Changes Required

### File: `supabase/functions/create-checkout/index.ts`

**1. Update the API base URL (lines 133-134)**

Current:
```typescript
const dodoBaseUrl = 'https://api.dodopayments.com/v1';
```

Change to:
```typescript
// Use test mode for development, live mode for production
const dodoBaseUrl = 'https://api.dodopayments.com';
```

**2. Update the endpoint to use unified /checkouts (lines 170-171)**

Current:
```typescript
const endpoint = isSubscription ? `${dodoBaseUrl}/subscriptions` : `${dodoBaseUrl}/payments`;
```

Change to:
```typescript
const endpoint = `${dodoBaseUrl}/checkouts`;
```

**3. Update the checkout payload format (lines 140-168)**

Current payload has unnecessary `billing` object. Update to match Dodo API:
```typescript
const checkoutPayload = {
  product_cart: [
    {
      product_id: plan.dodo_product_id,
      quantity: 1
    }
  ],
  customer: {
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
  },
  return_url: returnUrl,
  metadata: {
    user_id: user.id,
    plan_name: planName,
    plan_id: plan.id,
    billing_interval: billingInterval,
    base_plan: basePlanName
  }
};
```

**4. Update the response handling (lines 191-210)**

Current:
```typescript
const dodoData = await dodoResponse.json();
// ...
await supabaseAdmin.from('payment_events').insert({
  dodo_payment_id: dodoData.payment_id || dodoData.subscription_id,
  // ...
});

return new Response(
  JSON.stringify({
    checkoutUrl: dodoData.payment_link,
    sessionId: dodoData.payment_id || dodoData.subscription_id
  }),
  // ...
);
```

Change to:
```typescript
const dodoData = await dodoResponse.json();
// ...
await supabaseAdmin.from('payment_events').insert({
  dodo_payment_id: dodoData.session_id,
  // ...
});

return new Response(
  JSON.stringify({
    checkoutUrl: dodoData.checkout_url,
    sessionId: dodoData.session_id
  }),
  // ...
);
```

**5. Add better error handling with response parsing (lines 182-189)**

Add defensive parsing for non-JSON error responses:
```typescript
if (!dodoResponse.ok) {
  const contentType = dodoResponse.headers.get('content-type');
  let errorMessage = 'Failed to create checkout session';
  
  if (contentType?.includes('application/json')) {
    try {
      const errorData = await dodoResponse.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
  } else {
    const textResponse = await dodoResponse.text();
    console.error('Dodo API returned non-JSON:', textResponse.substring(0, 500));
  }
  
  console.error('Dodo API error:', errorMessage);
  return new Response(
    JSON.stringify({ error: errorMessage }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

## Complete Updated Edge Function

The key changes summarized:

```text
┌────────────────────────────────────────────────────────────────┐
│                    BEFORE (Broken)                              │
├────────────────────────────────────────────────────────────────┤
│  URL: https://api.dodopayments.com/v1/subscriptions             │
│  Response field: dodoData.payment_link                          │
│  Session ID: dodoData.payment_id || dodoData.subscription_id    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    AFTER (Fixed)                                │
├────────────────────────────────────────────────────────────────┤
│  URL: https://api.dodopayments.com/checkouts                    │
│  Response field: dodoData.checkout_url                          │
│  Session ID: dodoData.session_id                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/create-checkout/index.ts` | Fix API URL, endpoint, payload format, and response handling |

---

## Verification After Implementation

1. Sign in to the application
2. Navigate to the Pricing page
3. Click any paid plan button (Starter, Pro, Business, or Lifetime)
4. Confirm the button shows loading briefly then redirects to Dodo checkout page
5. Complete a test payment (if in test mode)
6. Confirm redirect back to success page works

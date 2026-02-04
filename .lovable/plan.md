
# Plan: Fix Dodo Payments Integration Based on Official Guidance

## Problem Analysis

The Dodo Payments team has confirmed the integration is failing due to **incorrect API endpoints and configuration**. The key issues:

| Issue | Current State | Required State |
|-------|---------------|----------------|
| API Base URL | `https://api.dodopayments.com` | `https://live.dodopayments.com` (Live) or `https://test.dodopayments.com` (Test) |
| Mode Detection | Hardcoded | Environment-based (`DODO_MODE` secret) |
| Subscription Management URL | `api.dodopayments.com/v1/...` | `live.dodopayments.com/v1/...` |

---

## Changes Required

### 1. Add DODO_MODE Secret

Add a new secret to control test vs live mode:

- **Secret Name:** `DODO_MODE`
- **Value:** `live` (for production) or `test` (for testing)

### 2. Update Create-Checkout Edge Function

**File:** `supabase/functions/create-checkout/index.ts`

**Changes:**
- Read `DODO_MODE` environment variable
- Use correct base URL based on mode:
  - Live: `https://live.dodopayments.com`
  - Test: `https://test.dodopayments.com`
- Remove the old `api.dodopayments.com` reference

```typescript
// Before (BROKEN)
const dodoBaseUrl = 'https://api.dodopayments.com';

// After (CORRECT)
const dodoMode = Deno.env.get('DODO_MODE') || 'live';
const dodoBaseUrl = dodoMode === 'test' 
  ? 'https://test.dodopayments.com'
  : 'https://live.dodopayments.com';
```

### 3. Update Manage-Subscription Edge Function

**File:** `supabase/functions/manage-subscription/index.ts`

**Changes:**
- Same base URL fix for subscription management API calls
- Apply to both cancel and reactivate endpoints

```typescript
// Before (BROKEN)
`https://api.dodopayments.com/v1/subscriptions/${id}`

// After (CORRECT)  
const dodoBaseUrl = dodoMode === 'test' 
  ? 'https://test.dodopayments.com'
  : 'https://live.dodopayments.com';
`${dodoBaseUrl}/v1/subscriptions/${id}`
```

### 4. Update Dodo Webhook Edge Function (Minor)

**File:** `supabase/functions/dodo-webhook/index.ts`

The webhook function doesn't make outbound API calls, so no URL changes needed. However, we should add better logging for debugging:

- Log the webhook event type more clearly
- Add timing information for debugging

### 5. Add API Key Validation

Add validation to check if the API key format matches the expected mode:

```typescript
// Validate key format
const isTestKey = dodoApiKey.startsWith('sk_test_');
const isLiveKey = dodoApiKey.startsWith('sk_live_');
const isLiveMode = dodoMode === 'live';

if (isLiveMode && isTestKey) {
  console.warn('WARNING: Using test API key in live mode');
}
if (!isLiveMode && isLiveKey) {
  console.warn('WARNING: Using live API key in test mode');
}
```

---

## Summary of File Changes

| File | Change |
|------|--------|
| `supabase/functions/create-checkout/index.ts` | Fix base URL to use live/test domains |
| `supabase/functions/manage-subscription/index.ts` | Fix base URL for subscription management |
| Secrets | Add `DODO_MODE=live` secret |

---

## Verification Steps

After implementation:
1. Check edge function logs for successful API calls
2. Verify checkout URL is generated correctly
3. Test a checkout flow end-to-end with a test card

---

## Technical Details

### Why `api.dodopayments.com` Fails

Dodo Payments uses separate hostnames for test and live environments:
- `test.dodopayments.com` - Test/sandbox transactions
- `live.dodopayments.com` - Real transactions

The `api.dodopayments.com` domain may redirect or fail depending on the API key used. Using the correct domain explicitly ensures proper routing.

### API Endpoint Reference

From Dodo's official documentation:

| Endpoint | Test Mode | Live Mode |
|----------|-----------|-----------|
| Create Checkout | `POST https://test.dodopayments.com/checkouts` | `POST https://live.dodopayments.com/checkouts` |
| Get Subscription | `GET https://test.dodopayments.com/v1/subscriptions/{id}` | `GET https://live.dodopayments.com/v1/subscriptions/{id}` |
| Update Subscription | `PATCH https://test.dodopayments.com/v1/subscriptions/{id}` | `PATCH https://live.dodopayments.com/v1/subscriptions/{id}` |

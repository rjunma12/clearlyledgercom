
# Plan: Complete Subscription Billing with Monthly, Annual & Lifetime Tiers

## Overview

This plan implements comprehensive subscription billing via Dodo Payments with:
- **Monthly subscriptions** for Starter ($15), Professional ($30), and Business ($50)
- **Annual subscriptions** with 2 months free discount (17% savings)
- **Lifetime tier** ($119 one-time) with limited spots

---

## Current State

### What Exists
- Plans table with monthly variants (starter, pro, business, lifetime)
- Lifetime spots tracking (350 total, 0 sold)
- `dodo-webhook` handles subscription and payment events
- `create-checkout` creates checkout sessions
- Basic PricingSection with monthly prices only
- No billing interval toggle or annual plans

### What's Missing
- Annual plan variants in database
- Billing interval column in user_subscriptions
- Annual pricing toggle in UI
- Updated webhook for annual expiry calculation
- Annual quota reset logic

---

## Database Changes

### 1. Add Annual Plan Variants

Insert 3 new rows for annual subscriptions (17% discount = 10 months for price of 12):

| Plan | Price | Monthly Equiv | Pages | Billing |
|------|-------|---------------|-------|---------|
| starter_annual | $150/yr | $12.50/mo | 4,800/yr | annual |
| pro_annual | $300/yr | $25/mo | 12,000/yr | annual |
| business_annual | $500/yr | $41.67/mo | 48,000/yr | annual |

```sql
-- Insert annual plan variants
INSERT INTO plans (name, display_name, daily_page_limit, monthly_page_limit, 
                   pii_masking, price_cents, is_recurring, allowed_formats)
VALUES 
  ('starter_annual', 'Starter Annual', NULL, 4800, 'optional', 15000, true, ARRAY['csv', 'xlsx']),
  ('pro_annual', 'Professional Annual', NULL, 12000, 'optional', 30000, true, ARRAY['csv', 'xlsx']),
  ('business_annual', 'Business Annual', NULL, 48000, 'enforced', 50000, true, ARRAY['csv', 'xlsx']);
```

### 2. Add Billing Interval to Subscriptions

```sql
-- Add billing_interval column to track monthly/annual/lifetime
ALTER TABLE user_subscriptions 
ADD COLUMN billing_interval TEXT DEFAULT 'monthly';

-- Add constraint for valid values
ALTER TABLE user_subscriptions 
ADD CONSTRAINT valid_billing_interval 
CHECK (billing_interval IN ('monthly', 'annual', 'lifetime'));
```

### 3. Extend plan_type Enum

```sql
-- Add annual variants to plan_type enum
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'starter_annual';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'pro_annual';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'business_annual';
```

### 4. Update get_remaining_pages() Function

Update to handle annual quota resets based on subscription anniversary:

```sql
CREATE OR REPLACE FUNCTION public.get_remaining_pages(
  p_user_id uuid DEFAULT NULL,
  p_session_fingerprint text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_billing_interval TEXT;
  v_started_at TIMESTAMPTZ;
  v_pages_used INTEGER;
BEGIN
  -- Get limits and billing interval
  SELECT p.daily_page_limit, p.monthly_page_limit, us.billing_interval, us.started_at
  INTO v_daily_limit, v_monthly_limit, v_billing_interval, v_started_at
  FROM get_user_plan(p_user_id) AS gup
  JOIN plans p ON p.name = gup.plan_name
  LEFT JOIN user_subscriptions us ON us.user_id = p_user_id AND us.status = 'active'
  LIMIT 1;
  
  -- Unlimited check
  IF v_daily_limit IS NULL AND v_monthly_limit IS NULL THEN
    RETURN -1;
  END IF;
  
  -- Calculate usage period based on billing interval
  IF v_billing_interval = 'annual' THEN
    -- Reset on subscription anniversary
    SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used
    FROM usage_tracking
    WHERE user_id = p_user_id
      AND usage_date >= v_started_at::DATE;
  ELSIF v_daily_limit IS NOT NULL THEN
    -- Daily reset
    SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used
    FROM usage_tracking
    WHERE usage_date = CURRENT_DATE
      AND (user_id = p_user_id OR session_fingerprint = p_session_fingerprint);
  ELSE
    -- Monthly reset
    SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used
    FROM usage_tracking
    WHERE usage_date >= date_trunc('month', CURRENT_DATE)::DATE
      AND user_id = p_user_id;
  END IF;
  
  -- Return remaining pages
  RETURN GREATEST(0, COALESCE(v_monthly_limit, v_daily_limit, 0) - v_pages_used);
END;
$$;
```

---

## Edge Function Updates

### 1. `create-checkout/index.ts`

Add billing interval detection and metadata:

```typescript
// Detect billing interval from plan name
const billingInterval = planName.endsWith('_annual') ? 'annual' : 
                        planName === 'lifetime' ? 'lifetime' : 'monthly';
const basePlanName = planName.replace('_annual', '');

// Add to checkout metadata
metadata: {
  user_id: user.id,
  plan_name: planName,
  plan_id: plan.id,
  billing_interval: billingInterval,
  base_plan: basePlanName
}
```

### 2. `dodo-webhook/index.ts`

Update expiry calculation based on billing interval:

```typescript
// In subscription.active handler:
const billingInterval = metadata?.billing_interval || 'monthly';

// Calculate correct expiry
let expiresAt: string | null = null;
if (billingInterval === 'annual') {
  expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
} else if (billingInterval === 'monthly') {
  expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}
// Lifetime has no expiry (null)

// Store with billing interval
await supabase.from('user_subscriptions').upsert({
  user_id: metadata.user_id,
  plan_id: plan.id,
  status: 'active',
  billing_interval: billingInterval,
  expires_at: expiresAt,
  // ... other fields
});
```

Update renewal handler:

```typescript
case 'subscription.renewed': {
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('*, plans(*)')
    .eq('dodo_subscription_id', subscriptionId)
    .single();

  if (sub) {
    // Extend by correct interval
    const extensionDays = sub.billing_interval === 'annual' ? 365 : 30;
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        expires_at: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', sub.id);
  }
  break;
}
```

### 3. `track-usage/index.ts`

Update to fetch billing interval for proper quota calculation:

```typescript
// Get user's plan and subscription details
const { data: planData } = await supabaseAdmin
  .rpc('get_user_plan', { p_user_id: userId });

// For annual plans, the get_remaining_pages RPC already handles
// anniversary-based reset (no changes needed in track-usage)
```

---

## Frontend Updates

### 1. Update `use-checkout.tsx`

Extend PlanName type with annual variants:

```typescript
export type PlanName = 
  | 'starter' | 'starter_annual'
  | 'pro' | 'pro_annual'
  | 'business' | 'business_annual'
  | 'lifetime';
```

### 2. Update `use-usage.tsx`

Add annual plan types:

```typescript
export type PlanType = 
  | 'anonymous' | 'registered_free' 
  | 'starter' | 'starter_annual'
  | 'pro' | 'pro_annual'
  | 'business' | 'business_annual'
  | 'lifetime';

// Update BATCH_LIMITS
const BATCH_LIMITS: Record<PlanType, number> = {
  anonymous: 1,
  registered_free: 1,
  starter: 1,
  starter_annual: 1,
  pro: 10,
  pro_annual: 10,
  business: 20,
  business_annual: 20,
  lifetime: 10,
};
```

### 3. Update `PricingSection.tsx`

Add billing toggle and dynamic pricing:

```typescript
// Add state
const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

// Add toggle UI
<div className="flex items-center justify-center gap-4 mb-8">
  <span className={cn(
    "text-sm font-medium transition-colors",
    billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
  )}>
    Monthly
  </span>
  <Switch 
    checked={billingInterval === 'annual'}
    onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
  />
  <span className={cn(
    "text-sm font-medium transition-colors",
    billingInterval === 'annual' ? 'text-foreground' : 'text-muted-foreground'
  )}>
    Annual
    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
      Save 17%
    </span>
  </span>
</div>

// Dynamic pricing display
const getPlanDetails = (basePlan: string) => {
  const plans = {
    starter: { monthly: '$15', annual: '$150', monthlyPages: 400, annualPages: 4800 },
    pro: { monthly: '$30', annual: '$300', monthlyPages: 1000, annualPages: 12000 },
    business: { monthly: '$50', annual: '$500', monthlyPages: 4000, annualPages: 48000 },
  };
  const p = plans[basePlan];
  const isAnnual = billingInterval === 'annual';
  return {
    price: isAnnual ? p.annual : p.monthly,
    period: isAnnual ? '/year' : '/month',
    pages: isAnnual ? `${p.annualPages.toLocaleString()} pages/year` : `${p.monthlyPages} pages/month`,
    planName: isAnnual ? `${basePlan}_annual` : basePlan
  };
};
```

### 4. Update `PlanCard.tsx` (Dashboard)

Show billing interval in current plan display:

```typescript
// Add billing interval display
const isAnnual = planName.includes('annual');
const billingLabel = planName === 'lifetime' 
  ? 'Lifetime Access' 
  : isAnnual 
    ? 'Annual Subscription' 
    : 'Monthly Subscription';

// Show correct usage label
const usageLabel = isAnnual ? 'Yearly Usage' : 'Monthly Usage';
const limitLabel = isAnnual ? 'pages/year' : 'pages/month';
```

---

## Dodo Payments Configuration

### Products to Create in Dodo Dashboard

| Product Name | Type | Price | Product ID |
|--------------|------|-------|------------|
| Starter Monthly | Subscription | $15/mo | (existing) |
| Starter Annual | Subscription | $150/yr | (to create) |
| Pro Monthly | Subscription | $30/mo | (existing) |
| Pro Annual | Subscription | $300/yr | (to create) |
| Business Monthly | Subscription | $50/mo | (existing) |
| Business Annual | Subscription | $500/yr | (to create) |
| Lifetime | One-time | $119 | (existing) |

After creating products in Dodo, update database:

```sql
UPDATE plans SET dodo_product_id = 'pdt_xxx' WHERE name = 'starter_annual';
UPDATE plans SET dodo_product_id = 'pdt_xxx' WHERE name = 'pro_annual';
UPDATE plans SET dodo_product_id = 'pdt_xxx' WHERE name = 'business_annual';
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `supabase/migrations/xxx_annual_plans.sql` | CREATE | Add annual plans, billing_interval column |
| `supabase/functions/create-checkout/index.ts` | MODIFY | Add billing interval detection |
| `supabase/functions/dodo-webhook/index.ts` | MODIFY | Handle annual expiry, store billing_interval |
| `supabase/functions/track-usage/index.ts` | MINOR | Already uses get_remaining_pages (no changes) |
| `src/hooks/use-checkout.tsx` | MODIFY | Extend PlanName type |
| `src/hooks/use-usage.tsx` | MODIFY | Add annual plan types, batch limits |
| `src/contexts/UsageContext.tsx` | MODIFY | Export new types |
| `src/components/PricingSection.tsx` | MODIFY | Add billing toggle, dynamic pricing |
| `src/components/dashboard/PlanCard.tsx` | MODIFY | Show billing interval info |

---

## Lifetime Tier Details

The lifetime tier is **already partially implemented**:

| Component | Status |
|-----------|--------|
| Plan in database | ✅ Exists (500 pages/mo, $119) |
| Lifetime spots tracking | ✅ Exists (350 total, 0 sold) |
| Checkout flow | ✅ Works (checks spots availability) |
| Webhook handling | ✅ Works (increments sold_count) |
| Refund handling | ✅ Works (decrements sold_count) |
| No expiry | ✅ Works (expires_at = null) |

### Enhancements for Lifetime
1. Store `billing_interval = 'lifetime'` in user_subscriptions
2. Ensure get_remaining_pages returns correct monthly limit (500/mo)
3. Show "No monthly fees" badge in dashboard

---

## Implementation Order

1. **Database Migration** - Add annual plans, billing_interval column
2. **Update Types** - Extend PlanType and PlanName in hooks
3. **Update Edge Functions** - Modify checkout and webhook
4. **Frontend UI** - Add billing toggle to PricingSection
5. **Dashboard Updates** - Show billing interval in PlanCard
6. **Create Dodo Products** - Add annual subscriptions in Dodo dashboard
7. **Update Product IDs** - Link Dodo product IDs to database
8. **End-to-End Testing** - Test checkout, renewal, cancellation

---

## Expected Behavior Summary

| Scenario | Monthly | Annual | Lifetime |
|----------|---------|--------|----------|
| Price | $15-50/mo | $150-500/yr | $119 once |
| Billing | Recurring monthly | Recurring yearly | One-time |
| Quota reset | 1st of month | Anniversary date | 1st of month |
| Expiry | 30 days | 365 days | Never |
| Renewal | Auto-renews monthly | Auto-renews yearly | N/A |
| Cancel | Access until period end | Access until period end | Permanent access |

---

## Risk Assessment

- **Low risk**: All changes are additive, existing monthly subscriptions unaffected
- **Dodo dependency**: Annual products must be created before testing
- **Database migration**: Uses safe `ADD VALUE IF NOT EXISTS` for enums
- **Backward compatible**: Existing subscriptions default to 'monthly' interval

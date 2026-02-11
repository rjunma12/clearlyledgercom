

## Remove Lifetime Tier from ClearlyLedger

This plan removes all traces of the Lifetime pricing tier across frontend components, backend functions, types, locales, and marketing copy.

---

### Files to Modify (19 files)

**Types and Hooks (foundational -- update first)**

1. **`src/hooks/use-checkout.tsx`** -- Remove `'lifetime'` from `PlanName` type union
2. **`src/hooks/use-usage.tsx`** -- Remove `'lifetime'` from `PlanType` union, remove `lifetime: 10` from `BATCH_LIMITS`, remove `'lifetime'` from `canBatchUpload` check, remove `lifetimeSpotsRemaining` state and the `get_lifetime_spots_remaining` RPC call
3. **`src/lib/payments/types.ts`** -- Change `BillingInterval` from `'monthly' | 'annual' | 'lifetime'` to `'monthly' | 'annual'`
4. **`src/contexts/UsageContext.tsx`** -- Remove `lifetimeSpotsRemaining` from the context interface and default values

**Components**

5. **`src/components/PricingSection.tsx`** -- Remove `lifetimeSpotsRemaining` usage, remove `spotsRemaining`/`isSoldOut`/`isLowStock` variables, change paid plans grid from `lg:grid-cols-4` to `lg:grid-cols-3`, delete the entire Lifetime card block (lines ~390-474), remove unused imports (`Rocket`)
6. **`src/components/pricing/LifetimeDealCard.tsx`** -- Delete this entire file (it is a standalone Lifetime component)
7. **`src/components/pricing/UsageLimitModal.tsx`** -- Remove the Lifetime Deal upgrade option block (lines ~94-115), remove `Rocket` import
8. **`src/components/dashboard/SubscriptionCard.tsx`** -- Remove `'lifetime'` from `PlanType`, remove `lifetime: '$119 one-time'` from `planPriceDisplay`, remove `isLifetime` variable and its conditional rendering (lines 119, 120, 237-242, 279)

**Pages**

9. **`src/pages/Pricing.tsx`** -- Remove the "What does Lifetime access include?" FAQ entry, remove the Lifetime `Offer` from `productSchema`, update meta descriptions to remove "Lifetime" mentions, remove "lifetime deal" keyword
10. **`src/pages/Features.tsx`** -- Remove the Lifetime entry from the plan comparison array (lines 141-144)
11. **`src/pages/Index.tsx`** -- Update FAQ answer about page limits to remove "Lifetime members ($119 one-time) get unlimited access forever", update PII masking FAQ to remove "Lifetime"
12. **`src/pages/TermsOfService.tsx`** -- Remove bullet about Lifetime plans being non-transferable (line 179), update refund bullet to remove "including Lifetime plans" (line 190)
13. **`src/pages/blog/BlogPost3.tsx`** -- Change "Pro and Lifetime plans" to "Pro and Business plans" (line 178)

**Locale Files (7 files)**

14. **`src/locales/en/home.json`** -- Remove `pricing.lifetime` block
15. **`src/locales/ar/home.json`** -- Remove `pricing.lifetime` block
16. **`src/locales/es/home.json`** -- Remove `pricing.lifetime` block
17. **`src/locales/fr/home.json`** -- Remove `pricing.lifetime` block
18. **`src/locales/hi/home.json`** -- Remove `pricing.lifetime` block
19. **`src/locales/ja/home.json`** -- Remove `pricing.lifetime` block
20. **`src/locales/ms/home.json`** -- Remove `pricing.lifetime` block

**Backend Functions**

21. **`supabase/functions/manage-subscription/index.ts`** -- Remove the lifetime cancellation guard (lines 98-104)
22. **`supabase/functions/send-feature-announcement/index.ts`** -- Repurpose to notify all paid subscribers instead of only lifetime members, or remove the function entirely. The function currently calls `get_lifetime_members_for_announcement` RPC and sends "Lifetime Member Exclusive" emails. Will update to target all paid subscribers with generic "Paid Member" messaging.

### File to Delete

- **`src/components/pricing/LifetimeDealCard.tsx`** -- Entirely lifetime-specific, unused after changes

---

### Technical Details

**Type changes summary:**
```text
PlanName:  remove 'lifetime'
PlanType:  remove 'lifetime'  
BillingInterval:  remove 'lifetime'
SubscriptionCard PlanType:  remove 'lifetime'
```

**Grid layout change in PricingSection:**
- Paid plans grid: `lg:grid-cols-4` becomes `lg:grid-cols-3`
- ~85 lines of Lifetime card JSX removed

**Backend edge function changes:**
- `manage-subscription`: Remove 6-line lifetime guard block
- `send-feature-announcement`: Update to target all paid members instead of lifetime-only (change RPC call and email template text)

**No database migrations needed** -- the `plans` table may have a lifetime row but that is data, not schema. Existing lifetime subscribers (if any) would retain their records.


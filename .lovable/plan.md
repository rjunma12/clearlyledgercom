

# Plan: Update Dodo Product IDs and Secrets

## Overview

This plan updates the Dodo Payments integration with the correct product IDs for all plans and refreshes the API credentials. It also corrects the discount display from 17% to 16%.

---

## Changes Required

### 1. Update Secrets (Backend)

Replace the existing Dodo Payments credentials with the new values:

| Secret Name | New Value |
|-------------|-----------|
| `DODO_PAYMENTS_API_KEY` | `M3vEZlVf2d2aSHV.79cOQ9guIrzws5HpQqbsYpq5czIP7pmGx6oBmvuwRTG-gC5R` |
| `DODO_PAYMENTS_WEBHOOK_KEY` | `whsec_REDWh35ppSaj2gFobfccO2gwzp9uEhTf` |

---

### 2. Update Plan Product IDs (Database)

Update the `dodo_product_id` column in the `plans` table for all plans:

| Plan Name | Current Product ID | New Product ID |
|-----------|-------------------|----------------|
| `starter` | `pdt_0NWkEkIG7CE5XmEKisfwB` | `pdt_0NXbRQzmQzNOnmObfjYOY` |
| `starter_annual` | `NULL` | `pdt_0NXbh4iiiPhfpmhLbwg4l` |
| `pro` | `pdt_0NWkEpSm1QB0c54DRtAv0` | `pdt_0NXbRMq3TvlNcCzwLPfMt` |
| `pro_annual` | `NULL` | `pdt_0NXbhPZUPLprmBLA6r6g6` |
| `business` | `pdt_0NWkEuqXtGnx60SwWp5i0` | `pdt_0NXbRHnKJtNDow3qjSRDV` |
| `business_annual` | `NULL` | `pdt_0NXbhGZNYqR0WbT4RcS6b` |
| `lifetime` | `pdt_0NWkF3F8e46ZvEX8xYcmP` | `pdt_0NXbRDX3fmwPDcg4csDU6` |

SQL migration:
```sql
UPDATE plans SET dodo_product_id = 'pdt_0NXbRQzmQzNOnmObfjYOY' WHERE name = 'starter';
UPDATE plans SET dodo_product_id = 'pdt_0NXbh4iiiPhfpmhLbwg4l' WHERE name = 'starter_annual';
UPDATE plans SET dodo_product_id = 'pdt_0NXbRMq3TvlNcCzwLPfMt' WHERE name = 'pro';
UPDATE plans SET dodo_product_id = 'pdt_0NXbhPZUPLprmBLA6r6g6' WHERE name = 'pro_annual';
UPDATE plans SET dodo_product_id = 'pdt_0NXbRHnKJtNDow3qjSRDV' WHERE name = 'business';
UPDATE plans SET dodo_product_id = 'pdt_0NXbhGZNYqR0WbT4RcS6b' WHERE name = 'business_annual';
UPDATE plans SET dodo_product_id = 'pdt_0NXbRDX3fmwPDcg4csDU6' WHERE name = 'lifetime';
```

---

### 3. Update Discount Display (Frontend)

**File: `src/components/PricingSection.tsx`**

Change line 99 from:
```tsx
Save 17%
```
To:
```tsx
Save 16%
```

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| Secrets | UPDATE | Replace DODO_PAYMENTS_API_KEY and DODO_PAYMENTS_WEBHOOK_KEY |
| Database (plans table) | UPDATE | Set dodo_product_id for all 7 plans |
| `src/components/PricingSection.tsx` | MODIFY | Change "Save 17%" to "Save 16%" |

---

## Implementation Order

1. Update the two Dodo Payments secrets
2. Run SQL migration to update all product IDs
3. Update the discount percentage in PricingSection

---

## Verification

After implementation:
- Checkout flows will use the new product IDs
- Webhooks will be verified with the new secret
- Annual pricing toggle will show "Save 16%"


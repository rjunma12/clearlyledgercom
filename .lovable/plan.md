

# Plan: Simplify Landing Page Pricing to 3 Tiers

## Overview

This plan adds a `variant` prop to `PricingSection` to control which tiers are displayed:
- **Landing page (/)**: Shows only Anonymous, Registered, and Enterprise
- **Pricing page (/pricing)**: Shows all tiers (full view with billing toggle)

The annual discount will be updated from 16% to 50% on the full pricing page.

---

## Current State

| Location | Current Display |
|----------|-----------------|
| Landing page (`/`) | All 8 tiers + billing toggle |
| Pricing page (`/pricing`) | All 8 tiers + billing toggle |

## Target State

| Location | Target Display |
|----------|----------------|
| Landing page (`/`) | Anonymous, Registered, Enterprise only (no billing toggle) |
| Pricing page (`/pricing`) | All 8 tiers + billing toggle with "Save 50%" |

---

## Changes Required

### 1. Add Variant Prop to PricingSection

**File: `src/components/PricingSection.tsx`**

Add a new prop to control display mode:

```typescript
interface PricingSectionProps {
  variant?: 'full' | 'simplified';
}
```

- `full` (default): Shows all tiers including paid plans and billing toggle
- `simplified`: Shows only Anonymous, Registered, and Enterprise

**Conditional rendering logic:**
- When `variant="simplified"`:
  - Hide billing toggle (lines 81-102)
  - Hide paid plans row (Starter, Pro, Business, Lifetime) (lines 184-465)
  - Keep Anonymous + Registered cards (lines 104-182)
  - Keep Enterprise section (lines 467-493)
  - Keep trust footer (lines 495-501)

### 2. Update Landing Page to Use Simplified Variant

**File: `src/pages/Index.tsx`**

Change line 155 from:
```tsx
<PricingSection />
```
To:
```tsx
<PricingSection variant="simplified" />
```

### 3. Keep Pricing Page Using Full Variant

**File: `src/pages/Pricing.tsx`**

No change needed - default `variant="full"` shows all tiers.

### 4. Update Annual Discount to 50%

**File: `src/components/PricingSection.tsx`**

Change line 98-99 from:
```tsx
Save 16%
```
To:
```tsx
Save 50%
```

---

## Visual Comparison

### Landing Page (Simplified)

```text
┌─────────────────────────────────────────────────────────────┐
│                    PRICING SECTION                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              "Choose Your Plan"                      │    │
│  │   Start free. Upgrade when you need more power.      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│         ❌ NO BILLING TOGGLE (hidden)                        │
│                                                              │
│  ┌───────────────────┐    ┌───────────────────┐             │
│  │    Anonymous      │    │    Registered     │             │
│  │   (No Signup)     │    │      (Free)       │             │
│  │   1 page/day      │    │   5 pages/day     │             │
│  │  [Try Once Free]  │    │ [Create Account]  │             │
│  └───────────────────┘    └───────────────────┘             │
│                                                              │
│         ❌ NO PAID PLANS (hidden)                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Enterprise - For teams, high-volume, custom needs   │    │
│  │                   [Contact Us]                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│       Secure payment via Dodo • Cancel anytime              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Pricing Page (Full - Unchanged Layout)

```text
┌─────────────────────────────────────────────────────────────┐
│                    PRICING SECTION                           │
├─────────────────────────────────────────────────────────────┤
│              "Choose Your Plan"                              │
│                                                              │
│        Monthly ○───────● Annual [Save 50%]                   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │  Anonymous  │  │ Registered  │                           │
│  └─────────────┘  └─────────────┘                           │
│                                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │Starter │ │  Pro   │ │Business│ │Lifetime│               │
│  │  $15   │ │  $30   │ │  $50   │ │  $119  │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Enterprise                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/PricingSection.tsx` | MODIFY | Add `variant` prop, conditional rendering, update "Save 50%" |
| `src/pages/Index.tsx` | MODIFY | Pass `variant="simplified"` to PricingSection |

---

## Implementation Details

### PricingSection.tsx Changes

1. **Update component signature** (line 41):
```tsx
interface PricingSectionProps {
  variant?: 'full' | 'simplified';
}

const PricingSection = forwardRef<HTMLElement, PricingSectionProps>(
  ({ variant = 'full' }, ref) => {
```

2. **Conditional billing toggle** (wrap lines 81-102):
```tsx
{variant === 'full' && (
  <div className="flex items-center justify-center gap-4 mb-12">
    {/* ... billing toggle content ... */}
  </div>
)}
```

3. **Conditional paid plans row** (wrap lines 184-465):
```tsx
{variant === 'full' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-6">
    {/* Starter, Professional, Business, Lifetime cards */}
  </div>
)}
```

4. **Update discount percentage** (line 99):
```tsx
Save 50%
```

5. **Adjust margins** for simplified view:
   - When `variant="simplified"`, the Free tier row should have `mb-6` to connect nicely to Enterprise

### Index.tsx Change

Update line 155:
```tsx
<PricingSection variant="simplified" />
```

---

## Database Verification

The database connection was verified working. All plans remain in the database for:
- Existing subscribers
- Dashboard subscription management
- Full pricing page display
- Payment processing via Dodo

No database changes required.

---

## Verification Checklist

After implementation:
1. Navigate to landing page (`/`) - confirm only Anonymous, Registered, Enterprise visible
2. Confirm no billing toggle on landing page
3. Navigate to pricing page (`/pricing`) - confirm all tiers visible
4. Confirm billing toggle shows "Save 50%" on pricing page
5. Test "Create Free Account" button navigates to signup
6. Test "Contact Us" button navigates to contact page




# Plan: Add Missing User Feedback for Error States

## Problem Identified
Several components log errors silently to the database but don't show any feedback to users. This leaves users confused when actions fail - they click buttons, see loading spinners, then nothing happens.

## Components Requiring Fixes

### 1. `src/hooks/use-subscription-management.tsx`
**Issue**: Cancel and reactivate subscription errors are logged but no toast is shown.

**Changes needed**:
- Line 39-46: Add `toast.error()` when cancel fails
- Line 52-60: Add `toast.error()` when cancel returns `success: false`
- Line 62-70: Add `toast.error()` in catch block for cancel
- Line 97-105: Add `toast.error()` when reactivate fails
- Line 111-119: Add `toast.error()` when reactivate returns `success: false`
- Line 121-129: Add `toast.error()` in catch block for reactivate

### 2. `src/hooks/use-checkout.tsx`
**Issue**: Checkout errors are logged but no toast is shown.

**Changes needed**:
- Line 44-54: Add `toast.error()` when checkout API fails
- Line 59-67: Add `toast.error()` when no checkout URL is returned
- Line 68-77: Add `toast.error()` in catch block

### 3. `src/pages/Contact.tsx`
**Issue**: Contact form submission errors are logged but no toast is shown.

**Changes needed**:
- Line 116-125: Add `toast.error("Failed to send message. Please try again.")` in catch block

### 4. `src/components/InteractiveDemo.tsx`
**Issue**: Demo export errors are logged but no toast is shown.

**Changes needed**:
- Line 172-180: Add toast for export API error
- Line 183-205: Add toast for specific export failure cases
- Line 223-230: Add toast in catch block

### 5. `src/components/dashboard/BatchProcessingSection.tsx`
**Issue**: Batch processing failures are logged but no toast is shown.

**Changes needed**:
- Line 126-133: Add `toast.error()` when batch processing fails with errors
- Line 135-142: Add `toast.error()` in catch block

### 6. `src/pages/CheckoutSuccess.tsx`
**Issue**: Verification errors set status to 'error' but don't call `logError`.

**Changes needed**:
- Line 54-58: Add `logError()` call for verification API error
- Line 71-74: Add `logError()` call for verification catch block

---

## Changes Summary

| File | Action |
|------|--------|
| `src/hooks/use-subscription-management.tsx` | Add `toast.error()` for cancel/reactivate failures |
| `src/hooks/use-checkout.tsx` | Add `toast.error()` for checkout failures |
| `src/pages/Contact.tsx` | Add `toast.error()` for contact form failures |
| `src/components/InteractiveDemo.tsx` | Add `toast.error()` for demo export failures |
| `src/components/dashboard/BatchProcessingSection.tsx` | Add `toast.error()` for batch processing failures |
| `src/pages/CheckoutSuccess.tsx` | Add `logError()` for verification failures |

---

## Expected Outcome

After these fixes:
1. Subscription cancel/reactivate failures show clear error messages
2. Checkout failures show "Failed to start checkout" toast
3. Contact form failures show "Failed to send message" toast
4. Demo export failures show appropriate error toasts
5. Batch processing failures show "Batch processing failed" toast
6. All error paths are consistently logged to the database

---

## Technical Notes

This follows the established pattern where:
- **Silent logging only**: Processing errors, validation errors, quota exceeded (handled by UI states)
- **Toast + logging**: User-initiated actions that fail (auth, subscription, checkout, contact form)


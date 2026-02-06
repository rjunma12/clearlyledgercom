

# Test Conversion Issues Analysis & Fix Plan

## Issues Identified

After thorough analysis of the code, console logs, and session data, I identified **5 critical issues** causing the confidence score drop to 60%, wrong currency, missing account holder details, and missing transaction descriptions.

---

## Issue 1: Excel Export Uses Wrong Data Sources (Critical)

**Problem:** The `handleDownloadExcel()` function in `TestConversion.tsx` is reading from WRONG property paths:

```typescript
// CURRENT CODE (lines 151-165) - BROKEN:
metadata = {
  bankName: (result.document as any)?.bankName || 'Unknown Bank',        // WRONG - should be extractedHeader.bankName
  accountHolder: (result.document as any)?.accountHolder || '',          // WRONG - should be extractedHeader.accountHolder
  accountNumberMasked: (result.document as any)?.accountNumber || '',    // WRONG - should be extractedHeader.accountNumberMasked
  statementPeriodFrom: (result.document as any)?.startDate || '',        // WRONG - should be extractedHeader.statementPeriodFrom
  statementPeriodTo: (result.document as any)?.endDate || '',            // WRONG - should be extractedHeader.statementPeriodTo
  currency: 'USD',                                                        // WRONG - hardcoded, should come from extractedHeader.currency
  ...
};
```

The `extractedHeader` is properly populated in `index.ts` (lines 482-495) but the Test Conversion page is NOT reading from it.

**Fix:** Update the metadata extraction to use the correct path:
```typescript
const extractedHeader = result.document?.extractedHeader;
metadata = {
  bankName: extractedHeader?.bankName || 'Unknown Bank',
  accountHolder: extractedHeader?.accountHolder || '',
  accountNumberMasked: extractedHeader?.accountNumberMasked || '',
  statementPeriodFrom: extractedHeader?.statementPeriodFrom || '',
  statementPeriodTo: extractedHeader?.statementPeriodTo || '',
  currency: extractedHeader?.currency || 'INR',  // Default to INR for Indian banks
  ...
};
```

---

## Issue 2: Hardcoded Currency "USD" (Critical)

**Problem:** Currency is hardcoded to 'USD' in two places:
1. Line 159: `currency: 'USD'` in metadata
2. Line 189: `currency: 'USD'` in each transaction

The system actually detects currency correctly in `statementHeaderExtractor.ts` (lines 129-134, 292-318) and stores it in `extractedHeader.currency`, but it's being ignored.

**Fix:** Use detected currency from extractedHeader:
```typescript
const detectedCurrency = result.document?.extractedHeader?.currency || 'USD';
// Use detectedCurrency in both metadata and transactions
```

---

## Issue 3: Missing Description Due to Column Fragmentation (Critical)

**Problem:** The console logs show 11 fragmented tables with inconsistent column mappings:
- Tables 0, 1, 2, 6, 7 have `description(1.00)` as first column
- Tables 3-5, 8-10 have `date(0.40)` as first column and NO description column

This inconsistency causes descriptions to be lost when reconciliation happens. The column reconciliation consensus shows:
```
[ColumnReconciliation] Consensus at x=148: date (6/11 votes, 55%)
[ColumnReconciliation] Consensus at x=406: date (5/5 votes, 100%)
```

There's NO consensus for a description column in the final reconciled boundaries!

**Root Cause:** In `tableDetector.ts`, the `reconcileColumnMappings()` function (lines 963-1026) only includes columns that have votes, but description columns from tables 0-2 are at a different X position than other tables, so they're not being merged properly.

**Fix:** Add a "required column" check after reconciliation to ensure description column is always present.

---

## Issue 4: Credit Column Still Being Lost (Regression)

**Problem:** The column reconciliation consensus shows:
```
[ColumnReconciliation] Consensus at x=512: credit (4/5 votes, 80%)
```

But earlier logs show:
```
[PostProcess] Promoted column 3 to CREDIT
[PostProcess] Reassigned column 3 to DEBIT (single column, no CR/DR suffixes)
```

The `checkForMergedColumnSuffixes()` function is failing because:
1. It requires BOTH DR and CR to be present (`drCount > 0 && crCount > 0`)
2. If the bank only uses "Dr" suffix for debits and no suffix for credits, this check fails
3. The column gets reassigned to DEBIT, losing all credits

**Fix:** Improve the merged column detection to handle asymmetric suffixes:
```typescript
// Current: return totalNumeric >= 3 && drCount > 0 && crCount > 0;
// Fixed: If only one suffix type is found, still treat as potentially merged
return totalNumeric >= 3 && (drCount > 0 || crCount > 0);
```

---

## Issue 5: Low Confidence Score (60%)

**Problem:** The overall confidence is calculated as the average of reconciled column confidences:
```typescript
const avgConfidence = reconciledBoundaries.length > 0
  ? reconciledBoundaries.reduce((sum, b) => sum + b.confidence, 0) / reconciledBoundaries.length
  : 0;
```

Current reconciled boundaries have low confidence due to:
- Fragmentation (11 tables reduces vote percentages)
- Missing required columns (no description)
- Column type conflicts (date at two positions)

The detected columns have confidences of 0.40-0.55, pulling the average down to ~0.60.

**Fix:** Weight confidence by column importance and add penalties for missing required columns.

---

## Implementation Plan

### Phase 1: Fix Excel Export Metadata (Immediate)

**File: `src/pages/TestConversion.tsx`**

1. Read from `extractedHeader` instead of non-existent document properties
2. Use detected currency instead of hardcoded 'USD'
3. Properly extract account holder, account number, and statement period

### Phase 2: Fix Column Detection Logic

**File: `src/lib/ruleEngine/tableDetector.ts`**

1. Update `checkForMergedColumnSuffixes()` to handle asymmetric suffixes
2. Add required column validation after reconciliation
3. Ensure description column is always preserved during reconciliation
4. Add fallback: if no description column found, use widest unassigned column

### Phase 3: Improve Reconciliation Logic

**File: `src/lib/ruleEngine/tableDetector.ts`**

1. Don't allow two DATE columns in final reconciliation
2. If description column is missing from consensus, add it from the highest-confidence table
3. Weight confidence by vote count AND column importance

### Phase 4: Add Debug Visibility

**File: `src/pages/TestConversion.tsx`**

1. Display extracted header info in the UI for debugging
2. Show which fields were successfully extracted vs. missing

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `src/pages/TestConversion.tsx` | Fix Excel metadata sourcing, use extractedHeader | High |
| `src/lib/ruleEngine/tableDetector.ts` | Fix merged column detection, add required column validation | High |
| `src/lib/ruleEngine/tableDetector.ts` | Improve reconciliation to prevent duplicate dates | Medium |

---

## Expected Outcomes After Fixes

| Issue | Before | After |
|-------|--------|-------|
| Currency | Hardcoded 'USD' | Detected from PDF (INR/USD/etc) |
| Account Holder | Empty | Extracted from PDF header |
| Descriptions | Missing/partial | Fully populated |
| Credit Column | Lost to DEBIT reassignment | Properly detected |
| Confidence | 60% | 75%+ (with proper column detection) |

---

## Technical Details

### Correct Data Access Path

```typescript
// CORRECT way to access statement metadata:
const extractedHeader = result.document?.extractedHeader;

// Extracted fields:
extractedHeader?.accountHolder        // "DR DEEPIKAS HEALTHPLUS PVT LTD"
extractedHeader?.accountNumberMasked  // "****6549"
extractedHeader?.bankName             // "ICICI Bank"
extractedHeader?.currency             // "INR"
extractedHeader?.statementPeriodFrom  // "2025-03-01"
extractedHeader?.statementPeriodTo    // "2025-03-31"
```

### Merged Column Detection Fix

```typescript
// Current logic (fails for asymmetric suffixes):
return totalNumeric >= 3 && drCount > 0 && crCount > 0;

// Fixed logic:
// If DR suffix is found but no CR, amounts without suffix are credits
// If CR suffix is found but no DR, amounts without suffix are debits
const hasSuffixes = drCount > 0 || crCount > 0;
const hasBothTypes = (drCount > 0 && (totalNumeric - drCount) > 0) || 
                     (crCount > 0 && (totalNumeric - crCount) > 0);
return totalNumeric >= 3 && hasSuffixes && hasBothTypes;
```

### Required Columns Validation

After reconciliation, ensure these columns exist:
1. `date` - Required
2. `description` - Required
3. At least one of: `debit`, `credit`, or `amount` - Required
4. `balance` - Required

If any are missing, attempt fallback assignment or flag as error.


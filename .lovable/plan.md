

# Remove Test Mode & Merge Improvements to Production

## Overview

This plan removes the hidden `/test-conversion` R&D lab and ensures all quality improvements are available in the production PDF conversion flow.

---

## Current Architecture

| Component | Purpose | Rule Engine Used |
|-----------|---------|------------------|
| `/test-conversion` (TestConversion.tsx) | R&D lab with no limits, debug panels | `processDocument()` |
| FileUpload.tsx (production) | Main user-facing upload | `processDocument()` |
| InteractiveDemo.tsx | Demo with sample data | Uses static mock data |

**Good News**: Both test and production already use the **same rule engine** (`src/lib/ruleEngine/`), so all the recent improvements (hybrid column matching, numeric stitching, footer detection, etc.) are already active in production.

---

## Files to DELETE

### 1. Test Conversion Page
- `src/pages/TestConversion.tsx` - The R&D lab page

### 2. Test-Only Components (entire directory)
- `src/components/test/TableMetricsPanel.tsx`
- `src/components/test/TransactionSummaryPanel.tsx`
- `src/components/test/ColumnVisualization.tsx`
- `src/components/test/RawTransactionTable.tsx`
- `src/components/test/ColumnConflictsPanel.tsx`

---

## Files to MODIFY

### 1. Remove Route from App.tsx

Remove the `/test-conversion` route:
```tsx
// DELETE this import
const TestConversion = lazy(() => import("./pages/TestConversion"));

// DELETE this route
<Route path="/test-conversion" element={<TestConversion />} />
```

### 2. Update Production Excel Generator

Update `src/lib/excelGenerator.ts` to include improvements from the simplified generator:

**Column Headers** (match bank statement terminology):
```typescript
const TRANSACTION_COLUMNS = [
  { header: 'Date', key: 'date', width: 12 },
  { header: 'Description', key: 'description', width: 50 },
  { header: 'Withdrawal Amt.', key: 'debit', width: 15 },  // Changed from "Debit"
  { header: 'Deposit Amt.', key: 'credit', width: 15 },    // Changed from "Credit"
  { header: 'Balance', key: 'balance', width: 15 },
  // ... rest unchanged
];
```

**Add Address Filtering**: Include the same address/disclaimer filtering logic from `simpleExcelGenerator.ts` to ensure non-transaction content is removed:
```typescript
const addressPatterns = [
  /toll\s*free/i,
  /customer\s*care/i,
  /office\s*:/i,
  /www\./i,
  /gstin/i,
  // ... etc
];
```

### 3. Keep or Delete simpleExcelGenerator.ts

**Option A (Recommended)**: Delete `src/lib/simpleExcelGenerator.ts` since its improvements will be merged into the main generator.

**Option B**: Keep it as a lightweight alternative for debugging or future use.

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| DELETE | `src/pages/TestConversion.tsx` | Remove R&D lab page |
| DELETE | `src/components/test/*` (5 files) | Remove debug-only components |
| MODIFY | `src/App.tsx` | Remove `/test-conversion` route |
| MODIFY | `src/lib/excelGenerator.ts` | Add "Withdrawal Amt." / "Deposit Amt." headers + address filtering |
| DELETE | `src/lib/simpleExcelGenerator.ts` | Merge into main generator (optional) |

---

## What's Already in Production

The following improvements are **already active** in the production flow (no changes needed):

- Hybrid column matching (strict for text, flexible for numbers)
- Expanded header patterns for "Withdrawal Amt." / "Deposit Amt."
- Address/footer detection via `ADDRESS_PATTERNS`
- Numeric-only continuation stitching
- Footer cutoff heuristic (3 consecutive footer lines stops processing)
- Account holder extraction with expanded patterns
- OCR fallback for page 1 header (when account holder missing)
- Opening/Closing balance extraction in document metadata

---

## Expected Results

After implementation:
- No `/test-conversion` route accessible
- Production exports use "Withdrawal Amt." and "Deposit Amt." column headers
- Address/disclaimer rows filtered from production Excel output
- Cleaner codebase with no test-only components


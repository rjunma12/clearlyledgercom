
# Test Conversion Issues Analysis & Improvement Plan

## Current State Analysis

After running your bank statement through the test conversion page, here's what we found:

### Processing Metrics
| Metric | Value | Status |
|--------|-------|--------|
| PDF Type | TEXT_BASED | Good - fast extraction |
| Text Elements | 7,080 | Good |
| Table Regions | 11 | Issue - too fragmented |
| Transactions | 40 | Needs verification |
| Confidence | 0.61 (61%) | Below 75% threshold |

### Critical Issues Found

1. **Missing Credit Column**
   The column detection promoted column 3 to CREDIT but then reassigned it to DEBIT because it detected only a single amount column. This means all credits in your statement are being missed or mis-classified as debits.

2. **Fragmented Table Detection**
   Your statement was split into 11 separate table regions. This causes:
   - Inconsistent column mappings across regions
   - Lost context between sections
   - Multiple "unknown" column assignments

3. **Column Mapping Inconsistency**
   Different regions detected different columns:
   - Region 1: `[description, reference, date, debit, balance]`
   - Regions 2-3: `[description, unknown, date, credit, balance]`
   - Other regions: mixed results

4. **Low Confidence Score (61%)**
   This is below the 75% threshold required for trusted export. Key factors:
   - Missing credit column detection
   - Multiple "unknown" column types
   - Fragmented table structure

---

## Improvement Plan

### Phase 1: Enhanced Test Page Diagnostics

Add more detailed metrics to identify exactly what's happening:

**New Test Page Features:**
- Per-table breakdown showing columns detected for each region
- Visual highlighting of problematic rows
- Column classification confidence per column
- Debit/Credit totals comparison
- Raw extracted text viewer for debugging

```text
Table Region Analysis:
  Region 1 (Page 1, lines 15-42): 
    Columns: date(0.67), description(1.00), debit(0.50), balance(0.40)
    Rows: 12
  Region 2 (Page 1, lines 50-80):
    Columns: date(1.00), description(0.97), credit(0.80), balance(0.40)
    Rows: 8
  ...
```

### Phase 2: Column Detection Improvements

Fix the core issues in the parsing engine:

**2.1 Single Amount Column Handling**
Current behavior: If only one numeric column found between date and balance, it's assigned as DEBIT only.

**Fix:** Check for CR/DR suffixes in the amount values to split into debit/credit dynamically.

**2.2 Cross-Table Column Reconciliation**
Current behavior: Each table region classifies columns independently.

**Fix:** Use the highest-confidence column mapping from the first valid table region and apply it consistently across all subsequent regions on the same page.

**2.3 Merged Debit/Credit Column Detection**
Current behavior: Looking for explicit "Debit" and "Credit" headers separately.

**Fix:** Detect merged amount columns where values contain suffixes like "1,548.00 Dr" or "500.00 Cr" and split them dynamically.

### Phase 3: Bank Profile Enhancement

**3.1 Detect Bank Format**
Add pattern matching to identify the specific bank format (likely Indian bank based on column structure) and apply appropriate column hints.

**3.2 Statement-Specific Tuning**
For this statement format:
- Expected columns: Date | Description | Withdrawal | Deposit | Balance
- OR: Date | Description | Amount (with DR/CR suffix) | Balance

### Phase 4: Validation Improvements

**4.1 Cross-Check Totals**
Add validation that compares:
- Sum of all debits
- Sum of all credits
- Opening balance + credits - debits = Closing balance

**4.2 Missing Amount Detection**
Flag rows where:
- No debit AND no credit detected
- Amount exists but couldn't be classified

---

## Implementation Steps

| Step | File | Change |
|------|------|--------|
| 1 | `TestConversion.tsx` | Add per-table metrics display |
| 2 | `TestConversion.tsx` | Add debit/credit totals verification |
| 3 | `tableDetector.ts` | Add merged amount column detection |
| 4 | `tableDetector.ts` | Add cross-table column reconciliation |
| 5 | `dynamicRowProcessor.ts` | Improve CR/DR suffix parsing |
| 6 | `ruleEngine/index.ts` | Add validation for missing credits |

---

## Expected Outcomes After Fixes

| Metric | Before | After (Expected) |
|--------|--------|------------------|
| Credit Column | Missing | Detected |
| Table Regions | 11 (fragmented) | 2-3 (consolidated) |
| Confidence | 61% | 85%+ |
| Transaction Accuracy | Unknown | Verified via balance check |

---

## Technical Details

### File Changes Summary

**TestConversion.tsx** - Enhanced diagnostics
- Add per-table region breakdown panel
- Display column confidence scores per column
- Show debit/credit totals with balance verification
- Add raw text viewer for selected rows
- Export debug data as JSON

**tableDetector.ts** - Column detection fixes
- Add merged amount column detection (DR/CR suffix)
- Implement cross-table column reconciliation
- Reduce table fragmentation threshold
- Improve column type inference for Indian bank formats

**dynamicRowProcessor.ts** - Row processing fixes
- Enhance CR/DR suffix parsing patterns
- Add fallback for unclassified amounts
- Improve reference extraction for Indian payment modes

### Testing Strategy

1. Process your statement with enhanced diagnostics
2. Verify all 40 transactions have correct debit/credit assignment
3. Validate running balance matches actual statement
4. Compare totals with statement summary section

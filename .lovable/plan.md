
# Test Lab Improvements: Rule Engine Fixes & Excel Download

## Current Issues Identified

Based on the console logs from your bank statement conversion, I identified these critical problems:

### Issue 1: Fragmented Table Detection (11 tables instead of 1-2)
The statement was split into 11 separate table regions, causing:
- Inconsistent column mappings across regions
- Loss of context between sections
- Different column classifications per table

### Issue 2: Credit Column Misclassification
```
[PostProcess] Promoted column 3 to CREDIT
[PostProcess] Reassigned column 3 to DEBIT (single column)
```
The engine promoted a column to CREDIT, then immediately reassigned it to DEBIT because it detected only a single amount column. This loses all credit transactions.

### Issue 3: Column Reconciliation Errors
```
[ColumnReconciliation] Reconciled column at x=512: debit -> credit
```
The cross-table reconciliation is changing column types incorrectly, causing debit columns to become credit columns.

### Issue 4: No Excel Download in Test Lab
Currently the test page only exports debug JSON data, not the actual Excel file that users would receive.

---

## Implementation Plan

### Phase 1: Add Excel Download to Test Lab

**File: `src/pages/TestConversion.tsx`**

Add a new "Download Excel" button that:
1. Generates the standardized 3-sheet Excel file using `generateStandardizedExcel()`
2. Downloads directly in the browser
3. Shows the same format users would receive in production

Changes:
- Import `generateStandardizedExcel` and `arrayBufferToBase64` from `src/lib/excelGenerator.ts`
- Add function to build `StatementMetadata` from processing result
- Add function to build `ValidationSummary` from processing result  
- Add function to convert parsed transactions to `StandardizedTransaction[]`
- Add "Download Excel" button next to existing "Export Debug Data" button

### Phase 2: Fix Single Amount Column Detection

**File: `src/lib/ruleEngine/tableDetector.ts`**

The current logic in `postProcessColumnTypes()` (lines 774-786) incorrectly reassigns CREDIT to DEBIT when only one amount column is found. 

Fix: Before reassigning, check if the column content contains CR/DR suffixes. If it does, keep it as `amount` type (merged column) rather than forcing it to `debit`.

```typescript
// Before reassigning to DEBIT, check if it's actually a merged amount column
if (candidateColumns.length === 1 && !hasDebit && hasCredit) {
  // Check column content for CR/DR suffixes
  const colBoundary = boundaries[candidateColumns[0].index];
  const hasMixedSuffixes = checkForMergedColumnSuffixes(lines, colBoundary);
  
  if (hasMixedSuffixes) {
    // Keep as merged amount column - will be split in row processor
    boundaries[candidateColumns[0].index] = {
      ...boundaries[candidateColumns[0].index],
      inferredType: 'amount',
      confidence: 0.7,
    };
    console.log(`[PostProcess] Column ${candidateColumns[0].index} is merged amount (CR/DR suffixes detected)`);
  } else {
    // Actually a single debit column
    boundaries[candidateColumns[0].index] = {
      ...boundaries[candidateColumns[0].index],
      inferredType: 'debit',
      confidence: 0.5,
    };
  }
}
```

### Phase 3: Improve Table Fragmentation Handling

**File: `src/lib/ruleEngine/tableDetector.ts`**

The current `VERTICAL_GAP_THRESHOLD = 50` is too aggressive. Bank statements often have section breaks that shouldn't create new tables.

Fixes:
1. Increase `VERTICAL_GAP_THRESHOLD` from 50px to 80px
2. Add page-boundary awareness: don't split tables just because of a page break
3. Merge tables that have compatible column structures

Add new function:
```typescript
function shouldMergeTables(table1: TableRegion, table2: TableRegion): boolean {
  // Merge if:
  // 1. Same page or consecutive pages
  // 2. Similar column count (within 1)
  // 3. Column X-positions align within tolerance
}

function mergeCompatibleTables(tables: TableRegion[]): TableRegion[] {
  // Reduce fragmentation by merging tables with compatible structures
}
```

### Phase 4: Fix Column Reconciliation Logic

**File: `src/lib/ruleEngine/tableDetector.ts`**

The current reconciliation (lines 906-944) uses position matching but doesn't account for column type conflicts properly.

Fix: When reconciling, prioritize:
1. Keep explicit header-detected types (confidence >= 0.9)
2. Use consensus voting across tables rather than just using the "best" table
3. Don't override a debit with credit or vice versa without strong evidence

```typescript
function reconcileColumnMappings(tables: TableRegion[]): ColumnBoundary[] {
  // For amount columns (debit/credit/balance), use voting across all tables
  // Only change a column type if >60% of tables agree
  
  // Prevent debit<->credit swaps unless there's overwhelming evidence
  if ((fromType === 'debit' && toType === 'credit') || 
      (fromType === 'credit' && toType === 'debit')) {
    // Require higher confidence threshold for this swap
    if (votePercentage < 0.8) continue;
  }
}
```

### Phase 5: Enhanced Error Display in Test Lab

**File: `src/pages/TestConversion.tsx`**

Add new panels to surface the exact issues:
1. **Column Conflicts Panel**: Show when tables have conflicting column classifications
2. **Fragmentation Warning**: Alert when >5 tables are detected
3. **Missing Column Alert**: Warn when required columns (date, debit, credit, balance) are missing

### Phase 6: Raw Transaction Preview Table

**File: `src/pages/TestConversion.tsx`**

Add a paginated table showing the first 50 extracted transactions with:
- Date, Description, Debit, Credit, Balance columns
- Row highlighting for validation errors
- Color-coded confidence grades
- Clickable rows to show raw PDF line data

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/TestConversion.tsx` | Add Excel download, error panels, transaction preview |
| `src/lib/ruleEngine/tableDetector.ts` | Fix single column logic, reduce fragmentation, improve reconciliation |
| `src/components/test/TransactionSummaryPanel.tsx` | Add missing column warnings |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/components/test/RawTransactionTable.tsx` | Paginated preview of extracted transactions |
| `src/components/test/ColumnConflictsPanel.tsx` | Display column classification conflicts across tables |

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Table Regions | 11 (fragmented) | 2-3 (consolidated) |
| Credit Detection | Missing | Correctly classified |
| Column Conflicts | Undetected | Visible in UI |
| Excel Export | Not available | Full 3-sheet download |
| Confidence Score | 61% | 75%+ |

---

## Technical Details

### Excel Generation for Test Lab

The Excel download will use the existing `generateStandardizedExcel()` function which creates:
- **Sheet 1: Transactions** - Date, Description, Debit, Credit, Balance, Currency, Reference, Grade, Confidence
- **Sheet 2: Statement_Info** - Bank name, account holder, period, opening/closing balance, PDF type
- **Sheet 3: Validation** - Balance check results, row counts, warnings, confidence summary

### Column Detection Algorithm Fix

Current problematic flow:
1. Detect columns with numeric content
2. Assign rightmost as Balance
3. Assign next as Credit
4. If only 1 remaining, reassign Credit to Debit ← **This is wrong**

Fixed flow:
1. Detect columns with numeric content
2. Check for CR/DR suffixes in numeric columns
3. If suffixes found → mark as `amount` (merged column)
4. If no suffixes → apply standard right-to-left assignment (Balance, Credit, Debit)
5. If only 1 amount column with no suffixes → assign as Debit

### Table Merging Algorithm

```text
For each pair of adjacent tables:
  If table2.pageNumber == table1.pageNumber OR 
     table2.pageNumber == table1.lastPage + 1:
    
    If abs(table1.columnCount - table2.columnCount) <= 1:
      alignedColumns = countAlignedColumns(table1, table2, tolerance=15px)
      
      If alignedColumns >= min(table1.columnCount, table2.columnCount) - 1:
        Merge table2 into table1
```

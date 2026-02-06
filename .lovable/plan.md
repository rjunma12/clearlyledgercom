
# Fix: Complete Transaction Extraction from PDF

## Problem Analysis

Based on debug logs showing **42 transactions exported** while the PDF contains more:

| Stage | Issue |
|-------|-------|
| **Table Detection** | Lines with < 3 words are excluded from tables |
| **Table Merging** | Tables with inconsistent word counts are fragmented |
| **Structure Check** | ±3 word variance may still exclude valid rows |
| **Row Extraction** | Only lines inside detected table regions are processed |

### Root Cause: Lines Outside Tables Are Lost

The current flow:
```
PDF Lines → detectTableRegions() → only 3+ word lines → tables → extractRowsFromTable()
                ↑
        Lines with 1-2 words LOST
```

When a bank statement has transactions with wrapped descriptions across multiple lines:
- Line 1: "01/04/2025" (1 word) - LOST
- Line 2: "UPI/PAYMENT" (1 word) - LOST  
- Line 3: "5000.00 45000.00" (2 words) - LOST

These lines don't reach 3 words and are excluded from table detection entirely.

---

## Solution Plan

### Phase 1: Lower Minimum Words Threshold for Table Lines

**File: `src/lib/ruleEngine/tableDetector.ts`**

Change the minimum words requirement from 3 to 2:

**Location**: `detectTableRegions()` function (line ~216)

```typescript
// CURRENT (line 216)
if (wordCount >= 3) {

// FIXED
if (wordCount >= 2) {
```

Also update the consistency threshold (line 206/226):
```typescript
// CURRENT (line 226)
if (consistentColumnCount >= 3) {

// FIXED - Allow smaller tables
if (consistentColumnCount >= 2) {
```

### Phase 2: Include All Lines in Fallback Processing

**File: `src/lib/ruleEngine/tableDetector.ts`**

When no tables are detected OR when we have lines outside detected tables, include them in a fallback table:

**Location**: `detectAndExtractTables()` function (line ~1313-1326)

```typescript
// CURRENT: Only creates fallback if tables.length === 0

// FIXED: Also capture orphan lines (lines not in any table)
const tableLineCoverage = new Set<number>();
for (const table of tables) {
  table.dataLines.forEach((_, idx) => tableLineCoverage.add(idx));
}

// Find lines not covered by any table
const orphanLines = lines.filter((_, idx) => !tableLineCoverage.has(idx));
if (orphanLines.length > 0) {
  console.log(`[TableDetector] Found ${orphanLines.length} orphan lines outside tables`);
  // Add orphan lines to tables or process separately
}
```

### Phase 3: Increase Structure Tolerance

**File: `src/lib/ruleEngine/tableDetector.ts`**

Make structure consistency check more lenient:

**Location**: `isConsistentStructure()` function (line ~260)

```typescript
// CURRENT
function isConsistentStructure(count1: number, count2: number): boolean {
  return Math.abs(count1 - count2) <= 3;
}

// FIXED - More tolerant (±50% or ±4 words, whichever is larger)
function isConsistentStructure(count1: number, count2: number): boolean {
  const maxCount = Math.max(count1, count2);
  const tolerance = Math.max(4, Math.floor(maxCount * 0.5));
  return Math.abs(count1 - count2) <= tolerance;
}
```

### Phase 4: Capture All Lines Regardless of Table Membership

**File: `src/lib/ruleEngine/tableDetector.ts`**

Add a "catch-all" mechanism to ensure no lines are lost:

**Location**: After table extraction in `detectAndExtractTables()` (line ~1377)

```typescript
// After normal table extraction, add ALL remaining lines that weren't included
const includedLineIndices = new Set<number>();
for (const table of tables) {
  for (let i = 0; i < table.dataLines.length; i++) {
    // Track which lines were included
    const lineTop = table.dataLines[i].top;
    lines.forEach((l, idx) => {
      if (Math.abs(l.top - lineTop) < 3) {
        includedLineIndices.add(idx);
      }
    });
  }
}

// Find missing lines
const missingLines = lines.filter((_, idx) => !includedLineIndices.has(idx));
if (missingLines.length > 0) {
  console.log(`[TableDetector] Capturing ${missingLines.length} lines missed by table detection`);
  
  // Create a supplementary table for these lines
  const supplementaryTable: TableRegion = {
    top: Math.min(...missingLines.map(l => l.top)),
    bottom: Math.max(...missingLines.map(l => l.bottom)),
    left: Math.min(...missingLines.map(l => l.left)),
    right: Math.max(...missingLines.map(l => l.right)),
    headerLine: null,
    dataLines: missingLines,
    columnBoundaries: reconciledBoundaries, // Use existing boundaries
    pageNumbers: [...new Set(missingLines.map(l => l.pageNumber))],
  };
  
  const supplementaryRows = extractRowsFromTable(supplementaryTable, reconciledBoundaries);
  allRows = allRows.concat(supplementaryRows);
}
```

### Phase 5: Process All Rows Without Strict Classification

**File: `src/lib/ruleEngine/dynamicRowProcessor.ts`**

Update `processExtractedRows()` to be more inclusive:

**Location**: (line ~513-518)

```typescript
// CURRENT: Filter to only classified transactions
const transactions = stitched.filter(t => 
  t.classification.isTransaction && 
  !t.classification.isOpeningBalance && 
  !t.classification.isClosingBalance
);

// FIXED: Include ALL stitched rows except explicit opening/closing balance
// Let the Excel generator filter truly empty rows
const transactions = stitched.filter(t => 
  !t.classification.isOpeningBalance && 
  !t.classification.isClosingBalance
);
```

---

## Files to Modify

| File | Priority | Changes |
|------|----------|---------|
| `src/lib/ruleEngine/tableDetector.ts` | Critical | Lower word threshold, improve structure tolerance, capture missing lines |
| `src/lib/ruleEngine/dynamicRowProcessor.ts` | High | Remove strict transaction filter |

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Lines processed | Only 3+ word lines | All 2+ word lines |
| Orphan lines | Lost | Captured in supplementary table |
| Structure tolerance | ±3 words | ±50% or ±4 words |
| Classification filter | Strict | Inclusive (filter at output) |
| Transaction count | 42 (partial) | Full PDF count |

---

## Technical Summary

The core issue is **lines being excluded before they reach classification**:

1. **Table Detection Threshold**: Lines with < 3 words don't form tables
2. **Consistency Check**: Lines with different word counts break table continuity
3. **Orphan Lines**: Lines outside detected tables are never processed

The fix ensures:
1. Lower threshold (2 words) to include sparse lines
2. More tolerant structure checking
3. Catch-all mechanism for lines missed by table detection
4. Inclusive final output (let Excel generator filter empties)

This should capture **all** transactions from the PDF regardless of formatting variations.

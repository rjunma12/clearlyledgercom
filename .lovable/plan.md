

# Comprehensive Rules-Based Engine Improvement Plan
## Target: 100% Confidence Score + Complete Metadata Extraction

---

## Current Issues Analysis

Based on the console logs and code review, I identified **7 critical issues** preventing the 100% confidence score:

### Issue 1: Table Fragmentation (11 Tables Instead of 1-2)
The PDF is being split into 11 separate table regions due to aggressive gap detection. Each table then gets classified independently, leading to:
- Inconsistent column mappings across regions
- Lost description columns in some regions
- Vote dilution during reconciliation

**Root Cause:** `VERTICAL_GAP_THRESHOLD = 80` is still too aggressive for bank statements with section separators.

### Issue 2: Credit Column Being Reassigned to Debit
Console shows:
```
[PostProcess] Promoted column 3 to CREDIT
[PostProcess] Reassigned column 3 to DEBIT (single column, no CR/DR suffixes)
```

The `checkForMergedColumnSuffixes()` function checks for CR/DR suffixes, but Indian banks often use different patterns:
- Amounts in the debit column with no suffix
- Amounts in the credit column with no suffix
- The suffix check fails, so it falls back to marking as DEBIT

### Issue 3: Description Column Missing from Reconciliation
Console shows the reconciliation only has:
```
[ColumnReconciliation] Consensus at x=148: date (6/11 votes, 55%)
[ColumnReconciliation] Consensus at x=310: unknown (4/5 votes, 80%)
[ColumnReconciliation] Consensus at x=338: debit (5/6 votes, 83%)
```

No description column in the final consensus! Tables 0-2 have description, but tables 3-10 don't, so it never reaches consensus.

### Issue 4: Download Button Not Appearing
The condition `transactions.length > 0` is failing because:
- `result?.document?.rawTransactions` returns the transactions
- But `transactions` variable might be empty if segments don't have transactions

**Root Cause:** Line 236-237:
```typescript
const transactions = result?.document?.rawTransactions || 
  result?.document?.segments?.flatMap(s => s.transactions) || [];
```
If `rawTransactions` exists but is empty, the fallback never runs.

### Issue 5: Account Details Not Being Extracted
The `extractStatementHeader()` function expects specific patterns, but the actual PDF text may not match:
- Indian bank patterns need refinement
- Bank name detection relies on bank profile detection which may fail

### Issue 6: Currency Defaulting Instead of Detection
The header extractor scans for currency symbols (₹, $, etc.) but may not find them if they're embedded in amounts rather than explicit "Currency: INR" patterns.

### Issue 7: Low Confidence Calculation
Confidence is calculated as average of all column confidences:
```typescript
const avgConfidence = reconciledBoundaries.reduce((sum, b) => sum + b.confidence, 0) / reconciledBoundaries.length
```

With 11 fragmented tables and low vote percentages, confidences are ~0.40-0.55, averaging to ~0.60.

---

## Implementation Plan

### Phase 1: Fix Table Fragmentation (Critical)

**File: `src/lib/ruleEngine/tableDetector.ts`**

1. **Increase gap threshold further**
   - Change `VERTICAL_GAP_THRESHOLD` from 80px to 120px
   - Bank statements often have large section gaps that shouldn't split tables

2. **Add table merging logic**
   - After detecting tables, merge adjacent tables on the same page that have compatible column structures
   - Merge criteria: similar column count (±1) and aligned X-positions

3. **Skip false section breaks**
   - Don't split on section headers that are part of the transaction table

```typescript
// NEW: Merge compatible adjacent tables
function mergeCompatibleTables(tables: TableRegion[]): TableRegion[] {
  if (tables.length <= 1) return tables;
  
  const merged: TableRegion[] = [];
  let current = tables[0];
  
  for (let i = 1; i < tables.length; i++) {
    const next = tables[i];
    
    // Check if tables should be merged
    const sameOrAdjacentPage = Math.abs(next.pageNumbers[0] - current.pageNumbers[current.pageNumbers.length - 1]) <= 1;
    const similarColumnCount = Math.abs((current.columnBoundaries?.length || 5) - (next.columnBoundaries?.length || 5)) <= 1;
    
    if (sameOrAdjacentPage && similarColumnCount) {
      // Merge: extend current table
      current = {
        ...current,
        bottom: next.bottom,
        dataLines: [...current.dataLines, ...next.dataLines],
        pageNumbers: [...new Set([...current.pageNumbers, ...next.pageNumbers])],
      };
      console.log(`[TableMerger] Merged table ${i} into previous (similar structure)`);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  
  return merged;
}
```

### Phase 2: Fix Credit Column Detection

**File: `src/lib/ruleEngine/tableDetector.ts`**

1. **Remove single-column debit reassignment**
   - The current logic incorrectly forces single amount columns to DEBIT
   - Keep as CREDIT if it was detected as CREDIT with good confidence

2. **Improve position-based assignment**
   - If there's only one amount column between date and balance, check header keywords first
   - If header says "Credit" or "Deposit", keep it as CREDIT

```typescript
// In postProcessColumnTypes(), REMOVE the single column reassignment:
// Before: if (candidateColumns.length === 1 && !hasDebit && hasCredit) { ... reassign to DEBIT }
// After: Keep the CREDIT assignment if it was detected with confidence > 0.5
```

### Phase 3: Ensure Description Column Survives Reconciliation

**File: `src/lib/ruleEngine/tableDetector.ts`**

1. **Add description from best table if missing**
   - After reconciliation, check if description exists
   - If not, find the table with the best description column and add it

2. **Boost description column detection**
   - Description is typically the widest column
   - Give it higher priority during consensus

```typescript
// After reconciliation, ensure required columns exist:
if (!hasDescription) {
  // Find the best description column from any table
  for (const table of tables) {
    const descCol = table.columnBoundaries.find(b => b.inferredType === 'description');
    if (descCol && descCol.confidence > 0.5) {
      consensusBoundaries.push({
        ...descCol,
        confidence: descCol.confidence * 0.9,
      });
      console.log(`[ColumnReconciliation] Added description from table with confidence ${descCol.confidence}`);
      break;
    }
  }
}
```

### Phase 4: Fix Download Button Visibility

**File: `src/pages/TestConversion.tsx`**

1. **Improve transaction extraction logic**
   - Check multiple paths for transactions
   - Ensure fallback works correctly

```typescript
// Line 236-237 - Fix transaction extraction:
const transactions = useMemo(() => {
  if (!result?.document) return [];
  
  // Try multiple paths
  const fromRaw = result.document.rawTransactions || [];
  const fromSegments = result.document.segments?.flatMap(s => s.transactions) || [];
  
  // Use whichever has more transactions
  return fromRaw.length > 0 ? fromRaw : fromSegments;
}, [result]);
```

2. **Always show download button if result exists**
   - Move button outside the `transactions.length > 0` condition
   - Disable button if no transactions

### Phase 5: Improve Header Extraction Patterns

**File: `src/lib/ruleEngine/statementHeaderExtractor.ts`**

1. **Add more Indian bank patterns**
   - Handle multi-line account holder names
   - Support more date formats

2. **Add fallback bank name detection**
   - Scan entire first page for bank name keywords

```typescript
// Add to EXTRACTION_PATTERNS.accountHolder:
/Statement\s+for\s+(.+?)(?:\s*Account|\s*A\/C)/i,
/Statement\s+of\s+Account\s+(?:for\s+)?(.+?)(?:\s*Account|\s*Period)/i,

// Add bank name fallback:
const KNOWN_BANKS = [
  { pattern: /ICICI\s*Bank/i, name: 'ICICI Bank' },
  { pattern: /HDFC\s*Bank/i, name: 'HDFC Bank' },
  { pattern: /State\s*Bank\s*of\s*India|SBI/i, name: 'State Bank of India' },
  { pattern: /Axis\s*Bank/i, name: 'Axis Bank' },
  { pattern: /Kotak\s*Mahindra/i, name: 'Kotak Mahindra Bank' },
  { pattern: /IndusInd/i, name: 'IndusInd Bank' },
  { pattern: /Yes\s*Bank/i, name: 'Yes Bank' },
  { pattern: /Punjab\s*National\s*Bank|PNB/i, name: 'Punjab National Bank' },
  { pattern: /Bank\s*of\s*Baroda|BoB/i, name: 'Bank of Baroda' },
  { pattern: /Canara\s*Bank/i, name: 'Canara Bank' },
];
```

### Phase 6: Improve Currency Detection

**File: `src/lib/ruleEngine/statementHeaderExtractor.ts`**

1. **Scan amounts for currency symbols**
   - Check balance and amount fields for ₹, Rs, INR patterns

2. **Add region-based currency inference**
   - If IFSC code detected → INR
   - If BSB detected → AUD
   - If Sort Code detected → GBP

```typescript
// Add currency inference from regional identifiers:
function inferCurrencyFromRegion(header: ExtractedStatementHeader): string | undefined {
  if (header.ifscCode) return 'INR';
  if (header.bsbNumber) return 'AUD';
  if (header.sortCode) return 'GBP';
  if (header.routingNumber) return 'USD';
  return undefined;
}

// In extractStatementHeader, add:
if (!result.currency) {
  result.currency = inferCurrencyFromRegion(result);
}
```

### Phase 7: Improve Confidence Calculation

**File: `src/lib/ruleEngine/tableDetector.ts`**

1. **Weight confidence by column importance**
   - Date and Balance are critical → higher weight
   - Description matters → medium weight
   - Debit/Credit → standard weight

2. **Boost confidence for successful required column detection**
   - If all required columns found → +0.2 bonus
   - If balance validates → +0.1 bonus

```typescript
// New confidence calculation:
function calculateFinalConfidence(
  boundaries: ColumnBoundary[],
  hasAllRequired: boolean,
  tableCount: number
): number {
  const weights: Record<string, number> = {
    date: 1.5,
    balance: 1.5,
    description: 1.2,
    debit: 1.0,
    credit: 1.0,
    amount: 1.0,
    unknown: 0.3,
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const b of boundaries) {
    const weight = weights[b.inferredType || 'unknown'] || 0.5;
    weightedSum += b.confidence * weight;
    totalWeight += weight;
  }
  
  let baseConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Bonus for having all required columns
  if (hasAllRequired) baseConfidence += 0.15;
  
  // Penalty for excessive fragmentation
  if (tableCount > 5) baseConfidence -= 0.05;
  if (tableCount > 10) baseConfidence -= 0.10;
  
  return Math.min(Math.max(baseConfidence, 0), 1);
}
```

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `src/lib/ruleEngine/tableDetector.ts` | Table merging, column detection fixes, confidence calculation | Critical |
| `src/lib/ruleEngine/statementHeaderExtractor.ts` | Indian bank patterns, bank name detection, currency inference | High |
| `src/pages/TestConversion.tsx` | Download button fix, transaction extraction | High |
| `src/lib/ruleEngine/dynamicRowProcessor.ts` | Improve amount splitting fallback | Medium |

---

## Expected Outcomes After Implementation

| Metric | Before | After (Expected) |
|--------|--------|------------------|
| Table Regions | 11 (fragmented) | 1-2 (consolidated) |
| Credit Column | Missing (reassigned to DEBIT) | Correctly detected |
| Description Column | Missing from reconciliation | Present in all rows |
| Download Button | Not visible | Always visible |
| Account Holder | Not extracted | Extracted from PDF |
| Bank Name | "Unknown Bank" | Detected from content |
| Currency | "USD" (hardcoded) | "INR" (detected) |
| Confidence Score | 60% | 90%+ |

---

## Technical Details

### Table Merging Algorithm

```text
For each pair of adjacent tables (i, i+1):
  sameOrAdjacentPage = |page(i+1) - page(i)| <= 1
  similarColumnCount = |cols(i) - cols(i+1)| <= 1
  
  if sameOrAdjacentPage AND similarColumnCount:
    Merge table i+1 into table i:
      - Extend dataLines
      - Combine pageNumbers
      - Recalculate boundaries
```

### Confidence Scoring Weights

| Column Type | Weight | Reason |
|-------------|--------|--------|
| Date | 1.5 | Essential for transaction ordering |
| Balance | 1.5 | Essential for validation |
| Description | 1.2 | Important for user understanding |
| Debit | 1.0 | Standard transaction data |
| Credit | 1.0 | Standard transaction data |
| Amount | 1.0 | Merged column type |
| Unknown | 0.3 | Unclassified columns penalized |

### Bank Name Detection Keywords

The system will scan the first 50 lines for these patterns:
- ICICI Bank, HDFC Bank, SBI, Axis Bank
- Kotak Mahindra, IndusInd, Yes Bank
- PNB, Bank of Baroda, Canara Bank
- And more regional banks

### Currency Inference Chain

1. Explicit pattern: "Currency: INR" → INR
2. Symbol in text: "₹" → INR
3. Regional identifier: IFSC code → INR, BSB → AUD, Sort Code → GBP
4. Default: Use config default (USD)


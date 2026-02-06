

# Fix: Missing Account Holder Name & Address/Non-Transaction Content Being Included

## Problem Summary

Based on my analysis:

### Issue 1: Account Holder Name Missing in Excel
The `extractStatementHeader` function searches the first 30 lines but may not find the account holder because:
- The pattern matching is too restrictive
- The account holder line may be in a different format than expected
- Need to expand search area and add more fallback patterns

### Issue 2: 198 Error Transactions (Balance Validation Failures)
The "error transactions" are rows that fail the balance equation check:
`balance[n-1] + credit[n] - debit[n] = balance[n]`

This happens because:
- Non-transaction content (address, disclaimers, footers) is being captured as transactions
- These rows don't have valid amounts but are included in the transaction list
- They break the balance chain, causing cascading validation errors

### Issue 3: Address/Disclaimer Content After Transactions
The PDF likely has content at the end (bank address, terms, disclaimers) that passes the relaxed row filters because:
- They may have date-like numbers or numeric content
- No specific patterns exist to filter out address-like content

---

## Implementation Plan

### Phase 1: Add Address/Disclaimer Skip Patterns

**File: `src/lib/ruleEngine/skipPatterns.ts`**

Add new patterns to detect and skip non-transaction content:

```typescript
/** Address and disclaimer patterns */
export const ADDRESS_PATTERNS: RegExp[] = [
  /\b(toll\s*free|helpline|customer\s*care)\b/i,
  /\b(phone|tel|fax|email)\s*[:.]?\s*[\d\-\(\)]+/i,
  /\b(registered\s+)?office\s*:/i,
  /\b(pin\s*code|postal\s*code|zip)\s*[:\-]?\s*\d+/i,
  /\b(address|location)\s*:/i,
  /\bwww\.\w+\.(com|in|org|net|co)/i,
  /\b(city|state|district)\s*:/i,
  /\bterms\s+(and|&)\s+conditions/i,
  /\bdisclaimer\b/i,
  /\b(head|corporate|main)\s+office/i,
  /\bregd\.?\s*(office|address)/i,
  /\bcin\s*[:.-]?\s*[A-Z0-9]+/i,  // Corporate ID Number
  /\b(gstin|gst\s*no\.?)\s*[:.-]?\s*\w+/i,  // GST Number
  /\bfor\s+(any|your)\s+(queries?|complaints?|assistance)/i,
  /\bthis\s+is\s+an?\s+(electronic|computer|system)\s+generated/i,
];
```

### Phase 2: Improve Account Holder Extraction

**File: `src/lib/ruleEngine/statementHeaderExtractor.ts`**

1. Increase search area from 30 to 50 lines
2. Add more flexible patterns for Indian banks:

```typescript
accountHolder: [
  // EXISTING patterns...
  
  // NEW: Line starting with customer name label
  /(?:Name|Account\s*Name)\s*[:\-]+\s*(.+)/i,
  
  // NEW: Pattern for multi-part names (e.g., "DR DEEPIKAS HEALTHPLUS PVT LTD")
  /Name\s*[:\-]+\s*([A-Z][A-Z\s]+(?:PVT|LTD|LIMITED|PRIVATE|COMPANY|CORP|INC)?[\.\s]*(?:PVT|LTD|LIMITED)?)/i,
  
  // NEW: Fallback - line containing all caps words after "Name"
  /Name\s*[:\-]+\s*([A-Z]{2,}(?:\s+[A-Z]{2,})*)/i,
]
```

3. Add fallback extraction: If no account holder found, scan for lines with company/person name patterns

### Phase 3: Filter Non-Transaction Rows Before Export

**File: `src/lib/ruleEngine/dynamicRowProcessor.ts`**

Update `classifyRow()` to check for skip patterns:

```typescript
export function classifyRow(row: ExtractedRow): RowClassification {
  // ... existing code ...
  
  // NEW: Check if row contains address/disclaimer content
  const isAddressContent = ADDRESS_PATTERNS.some(p => p.test(fullText));
  if (isAddressContent) {
    return {
      isTransaction: false,
      isContinuation: false,
      isHeader: false,
      isFooter: true,  // Mark as footer to skip
      isOpeningBalance: false,
      isClosingBalance: false,
      recoveredDate: null,
      // ... other fields
    };
  }
  
  // ... rest of existing logic
}
```

### Phase 4: Add Transaction Content Validation

**File: `src/lib/simpleExcelGenerator.ts`**

Add smarter filtering that checks for valid transaction content:

```typescript
// Enhanced filtering - skip rows that look like address/footer content
const transactions = rawTransactions.filter(tx => {
  // Skip completely empty rows
  if (!tx.date && !tx.description && !tx.debit && !tx.credit && !tx.balance) {
    return false;
  }
  
  // Skip rows that look like address/disclaimer content
  const descLower = (tx.description || '').toLowerCase();
  const addressPatterns = [
    /toll\s*free/i,
    /customer\s*care/i,
    /phone|tel|fax/i,
    /office\s*:/i,
    /www\./i,
    /disclaimer/i,
    /terms\s+and/i,
    /regd\.?\s*office/i,
    /cin\s*:/i,
    /gstin/i,
  ];
  
  if (addressPatterns.some(p => p.test(descLower))) {
    console.log('[SimpleExcelGenerator] Skipping address/footer row:', tx.description?.substring(0, 50));
    return false;
  }
  
  return true;
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/ruleEngine/skipPatterns.ts` | Add ADDRESS_PATTERNS array and `isAddressContent()` function |
| `src/lib/ruleEngine/statementHeaderExtractor.ts` | Expand search area, add flexible name patterns |
| `src/lib/ruleEngine/dynamicRowProcessor.ts` | Import and use address pattern checking in `classifyRow()` |
| `src/lib/simpleExcelGenerator.ts` | Add address content filtering before Excel generation |

---

## Expected Results

| Issue | Before | After |
|-------|--------|-------|
| Account Holder | Not extracted | Extracted from header area |
| Address rows | Included as transactions | Filtered out as footer content |
| Error count | 198 errors | Significantly reduced (only valid transaction balance errors) |
| Excel output | Contains address/disclaimer rows | Clean transaction list only |

---

## Technical Details

### Why Address Content Causes Balance Errors

When address content is treated as a transaction:
1. It has no valid debit/credit/balance amounts (or garbage values)
2. The balance chain is broken: `prev_balance + credit - debit ≠ current_balance`
3. All subsequent transactions inherit the error, causing a cascade

### Account Holder Pattern Matching

The current patterns may miss the format in this PDF. Adding patterns like:
- `Name :- DR DEEPIKAS HEALTHPLUS PVT LTD` (colon-dash separator)
- `Name: COMPANY NAME PVT LTD` (with company suffixes)
- Scanning for all-caps lines that look like business names


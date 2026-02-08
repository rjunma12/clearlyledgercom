

# PDF to Excel Conversion Fix Plan

## Current Issue Analysis

Based on the uploaded files (HDFC Bank statement `Acct_Statement_XX5055_04072025_1-2.pdf` and the resulting Excel output `Acct_Statement_XX5055_04072025_1_5.xlsx`) and extensive codebase review, the following conversion issues have been identified:

---

## Root Cause Analysis

### 1. Column Detection Issues for HDFC Bank Statements

The HDFC Bank profile (`src/lib/ruleEngine/bankProfiles/profiles/hdfc-india.ts`) has column hints, but the dynamic table detector may be failing due to:

**Problem Areas:**
- Column boundaries are detected using vertical gutter analysis with thresholds that may not match HDFC's specific layout
- HDFC statements often have merged cells and multi-line transaction descriptions that can confuse the geometry-based detector
- The `columnHints` in the profile (lines 24-29) specify percentage-based positions, but the actual PDF layout may differ

### 2. Indian Number Format Parsing Issues

The number parser (`src/lib/ruleEngine/numberParser.ts`) has Indian lakh/crore support, but issues may occur when:
- Amounts like "1,50,000.00" (Indian format) are not consistently detected
- The pattern `^\d{1,2}(,\d{2})*(,\d{3})?\.\d{1,2}$` may fail on edge cases (amounts without decimals, spaces before amounts)

### 3. Date Parsing Issues for Indian Formats

HDFC uses date formats like `DD/MM/YYYY` or `DD-MM-YYYY`. The parser may:
- Incorrectly interpret ambiguous dates (is `04/07/2025` April 7 or July 4?)
- Fail to parse dates with embedded spaces or OCR artifacts

### 4. Multi-Line Description Stitching Failures

The dynamic row processor (`src/lib/ruleEngine/dynamicRowProcessor.ts`) stitches continuation rows, but:
- HDFC statements often have 3-4 line transaction descriptions with UTR/IMPS references
- If numeric values (amounts/balance) appear on continuation lines, they may be incorrectly classified

### 5. Footer/Address Content Leaking Into Transactions

The address filter patterns in `excelGenerator.ts` (lines 39-63) may not catch all HDFC-specific footer content like:
- Toll-free numbers
- "This is a system generated statement" disclaimers
- Branch address details

---

## Proposed Fixes

### Fix 1: Enhanced HDFC Bank Profile Column Detection

**File:** `src/lib/ruleEngine/bankProfiles/profiles/hdfc-india.ts`

**Changes:**
- Add more precise `columnHints` with pixel-based ranges matching actual HDFC PDF layouts
- Add additional `skipPatterns` for HDFC-specific footer content
- Add `continuationPatterns` for multi-line transaction stitching
- Add specific patterns for HDFC's UTR/NEFT/IMPS reference formats

### Fix 2: Improve Indian Number Format Detection

**File:** `src/lib/ruleEngine/numberParser.ts`

**Changes:**
- Add pattern for amounts without decimals: `1,50,000` (no `.00`)
- Handle amounts with trailing `Dr`/`Cr` suffix common in Indian statements
- Handle amounts with spaces: `1,50, 000.00`
- Handle amounts with currency prefix without space: `₹1,50,000.00`

### Fix 3: Strengthen Multi-Line Stitching for Indian Banks

**File:** `src/lib/ruleEngine/dynamicRowProcessor.ts`

**Changes:**
- Add HDFC-specific continuation patterns (UTR, IMPS, NEFT references)
- Improve numeric continuation detection to prevent false stitching
- Add validation to prevent stitching footer content into transactions

### Fix 4: Enhanced Footer/Disclaimer Detection

**Files:** 
- `src/lib/excelGenerator.ts`
- `src/lib/ruleEngine/skipPatterns.ts`

**Changes:**
- Add HDFC-specific disclaimer patterns
- Add patterns for Indian bank footer content:
  - "does not require a signature"
  - "computer generated statement"
  - "CIN:" and "GSTIN:" patterns
  - "Toll Free: 1800" patterns

### Fix 5: Improve Date Parsing with Locale Context

**File:** `src/lib/ruleEngine/numberParser.ts`

**Changes:**
- When bank profile is detected as Indian (`region: 'IN'`), force DD/MM/YYYY interpretation
- Add statement period extraction to help infer year for short dates

---

## Implementation Details

### HDFC Profile Enhancement (Fix 1)

```typescript
// Enhanced columnHints with actual HDFC PDF measurements
columnHints: {
  date: [0, 10],           // First 10% of page width
  description: [10, 50],   // 10-50% for description
  debit: [50, 62],         // Withdrawal column
  credit: [62, 74],        // Deposit column  
  balance: [74, 100],      // Balance column
},

// Additional HDFC-specific skip patterns
skipPatterns: [
  /^this\s+is\s+a\s+computer/i,
  /^does\s+not\s+require/i,
  /^toll\s*free/i,
  /^customer\s+care/i,
  /^regd\.?\s*office/i,
  /^cin\s*[:.-]/i,
  /^gstin/i,
  // ... existing patterns
],

// HDFC continuation patterns for multi-line stitching
continuationPatterns: [
  /^utr\s*:?\s*\d+/i,
  /^imps\s*:?\s*\d+/i,
  /^neft\s*:?\s*[A-Z0-9]+/i,
  /^ref\s*no\s*:?\s*\d+/i,
  /^trans\s*id\s*:?\s*\d+/i,
],
```

### Indian Number Format Enhancement (Fix 2)

```typescript
// Enhanced Indian number patterns
const INDIAN_NUMBER_PATTERNS = [
  /^\d{1,2}(,\d{2})*(,\d{3})?\.\d{1,2}$/,     // Standard: 1,50,000.00
  /^\d{1,2}(,\d{2})*(,\d{3})?$/,               // No decimals: 1,50,000
  /^₹?\s*\d{1,2}(,\d{2})*(,\d{3})?\.\d{1,2}$/, // With ₹ prefix
  /^\d{1,2}(,\s*\d{2})*(,\s*\d{3})?\.\d{1,2}$/, // With spaces: 1, 50, 000.00
];

// Handle Dr/Cr suffix
const DR_CR_SUFFIX = /\s*(Dr\.?|Cr\.?|D|C)\s*$/i;
```

### Enhanced Continuation Detection (Fix 3)

```typescript
// In dynamicRowProcessor.ts
const INDIAN_BANK_CONTINUATION_PATTERNS = [
  /^UTR[\s:]*[A-Z0-9]+/i,
  /^IMPS[\s:]*\d+/i,
  /^NEFT[\s:]*[A-Z0-9]+/i,
  /^RTGS[\s:]*[A-Z0-9]+/i,
  /^CHQ\s*NO[\s:]*\d+/i,
  /^Ref[\s:]*\d+/i,
  /^TXN[\s:]*ID[\s:]*[A-Z0-9]+/i,
];
```

### Footer Pattern Enhancement (Fix 4)

```typescript
// Add to ADDRESS_FILTER_PATTERNS
const INDIAN_FOOTER_PATTERNS = [
  /^this\s+is\s+a\s+(computer|system)\s+generated/i,
  /^does\s+not\s+require\s+(a\s+)?(signature|stamp)/i,
  /^toll\s*free[\s:]*1800/i,
  /^cin[\s:]+[LU]\d+/i,
  /^gstin[\s:]+\d+/i,
  /^registered\s+office/i,
  /^branch[\s:]+\w+/i,
  /^ifsc[\s:]+[A-Z]{4}0/i,
  /^customer\s+care/i,
  /^helpline[\s:]+/i,
  /^for\s+any\s+queries/i,
];
```

---

## Files to Modify

1. **`src/lib/ruleEngine/bankProfiles/profiles/hdfc-india.ts`** - Enhanced column hints, skip patterns, continuation patterns
2. **`src/lib/ruleEngine/numberParser.ts`** - Better Indian number format handling
3. **`src/lib/ruleEngine/dynamicRowProcessor.ts`** - Indian bank continuation patterns
4. **`src/lib/ruleEngine/skipPatterns.ts`** - Add Indian footer patterns
5. **`src/lib/excelGenerator.ts`** - Add HDFC-specific address filter patterns

---

## Expected Improvements

| Issue | Before | After |
|-------|--------|-------|
| Missing transactions | Footer content mixed in | Clean transaction extraction |
| Wrong amounts | Indian format parsing failures | Correct lakh/crore handling |
| Jumbled data | Column misalignment | Accurate column detection |
| Missing dates | Date parsing failures | Correct DD/MM/YYYY parsing |
| Multi-line descriptions | Incomplete stitching | Full description recovery |

---

## Testing Approach

After implementation:
1. Re-process the original PDF (`Acct_Statement_XX5055_04072025_1-2.pdf`)
2. Compare transaction counts with original statement
3. Verify amounts match exactly (including decimal precision)
4. Check balance chain validation passes
5. Confirm no footer/disclaimer content in output




# Plan: Comprehensive Conversion Improvements

## Overview

This plan implements 5 major enhancements to the PDF-to-Excel conversion pipeline to improve accuracy, particularly for Indian bank statements and scanned documents.

---

## Improvement 1: Indian Lakh/Crore Number Format Support

### Problem
Indian banks use a unique number grouping system: `1,00,000.00` (one lakh) instead of the Western `100,000.00`. The current parser fails to recognize this pattern.

### Solution
Update `src/lib/ruleEngine/numberParser.ts` to detect and parse Indian number format.

### Technical Changes

**File: `src/lib/ruleEngine/numberParser.ts`**

Add Indian number format detection:
```typescript
// New pattern for Indian numbering (1,00,000.00)
const INDIAN_NUMBER_PATTERN = /^\d{1,2}(,\d{2})*(,\d{3})?\.\d{2}$/;

// In detectNumberFormat():
// Check for Indian format: 1,00,000.00
if (/^\d{1,2}(,\d{2})+,\d{3}\.\d{2}$/.test(sample)) {
  indianFormatCount++;
}
```

Add Indian format parsing in `parseNumber()`:
```typescript
// Handle Indian format: 1,00,000.00 -> remove all commas
else if (isIndianFormat(cleaned)) {
  cleaned = cleaned.replace(/,/g, '');
}
```

Add new type to `NumberFormat`:
```typescript
export interface NumberFormat {
  thousandsSeparator: ',' | '.' | ' ' | "'" | 'indian';
  // ...
}
```

---

## Improvement 2: OCR Error Correction for Dates

### Problem
OCR commonly misreads digits in dates: `O1/O2/2025` instead of `01/02/2025`, `l5/O1/2024` instead of `15/01/2024`.

### Solution
Add date-specific OCR correction before parsing in `numberParser.ts` and `ocrCorrection.ts`.

### Technical Changes

**File: `src/lib/ruleEngine/ocrCorrection.ts`**

Add new date correction function:
```typescript
// Date-specific OCR corrections (more restrictive than numeric)
const DATE_OCR_CORRECTIONS: Record<string, string> = {
  'O': '0',
  'o': '0',
  'l': '1',
  'I': '1',
  '|': '1',
  'Z': '2',
  'S': '5',
  'B': '8',
};

export function correctOCRDate(raw: string): string {
  // Only apply corrections to date-like patterns
  if (!isLikelyDate(raw)) return raw;
  
  let result = raw;
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (DATE_OCR_CORRECTIONS[char]) {
      result = result.slice(0, i) + DATE_OCR_CORRECTIONS[char] + result.slice(i + 1);
    }
  }
  return result;
}

function isLikelyDate(str: string): boolean {
  // Has date separators and appropriate length
  return /[\/\-\.]/.test(str) && str.length >= 6 && str.length <= 12;
}
```

**File: `src/lib/ruleEngine/numberParser.ts`**

Import and apply date correction before parsing:
```typescript
import { correctOCRDate } from './ocrCorrection';

export function parseDate(dateStr: string, locale: Locale = 'auto'): string | null {
  // NEW: Apply OCR correction first
  const corrected = correctOCRDate(dateStr.trim());
  
  for (const { pattern, format } of DATE_PATTERNS) {
    const match = corrected.match(pattern);
    // ... rest of parsing
  }
}
```

---

## Improvement 3: Extract Reference/Cheque Numbers as Separate Field

### Problem
Reference numbers, UTR codes, and cheque numbers are currently merged into the description field, making them hard to search and filter.

### Solution
Extract reference identifiers to a dedicated `reference` field in the transaction schema.

### Technical Changes

**File: `src/lib/ruleEngine/types.ts`**

Update `ParsedTransaction` interface:
```typescript
export interface ParsedTransaction {
  // ... existing fields
  reference?: string;              // NEW: Extracted reference/UTR/Cheque number
  referenceType?: 'UTR' | 'IMPS' | 'NEFT' | 'RTGS' | 'Cheque' | 'RefNo' | 'Other';
}
```

**File: `src/lib/ruleEngine/dynamicRowProcessor.ts`**

Add reference extraction logic:
```typescript
// Reference extraction patterns
const REFERENCE_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /\bUTR\s*[:\-]?\s*([A-Z0-9]{16,22})\b/i, type: 'UTR' },
  { pattern: /\bIMPS\s*[:\-]?\s*(\d{12,16})\b/i, type: 'IMPS' },
  { pattern: /\bNEFT\s*[:\-]?\s*([A-Z0-9]{16,22})\b/i, type: 'NEFT' },
  { pattern: /\bRTGS\s*[:\-]?\s*([A-Z0-9]{16,22})\b/i, type: 'RTGS' },
  { pattern: /\bCHQ\s*(?:NO)?\.?\s*[:\-]?\s*(\d{6,8})\b/i, type: 'Cheque' },
  { pattern: /\bCHEQUE\s*(?:NO)?\.?\s*[:\-]?\s*(\d{6,8})\b/i, type: 'Cheque' },
  { pattern: /\bREF\s*(?:NO)?\.?\s*[:\-]?\s*([A-Z0-9]{6,20})\b/i, type: 'RefNo' },
  { pattern: /\bTXN\s*(?:ID)?\.?\s*[:\-]?\s*([A-Z0-9]{10,20})\b/i, type: 'RefNo' },
];

export function extractReference(description: string): { 
  reference: string | null; 
  referenceType: string | null;
  cleanedDescription: string;
} {
  for (const { pattern, type } of REFERENCE_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      return {
        reference: match[1],
        referenceType: type,
        cleanedDescription: description.replace(match[0], '').trim(),
      };
    }
  }
  return { reference: null, referenceType: null, cleanedDescription: description };
}
```

Update `convertToRawTransactions()` to extract references:
```typescript
export function convertToRawTransactions(stitched: StitchedTransaction[]): RawTransaction[] {
  return stitched.map((tx, index) => {
    const { reference, referenceType, cleanedDescription } = extractReference(tx.fullDescription);
    
    return {
      // ... existing fields
      rawDescription: cleanedDescription,
      rawReference: reference,        // NEW
      referenceType: referenceType,   // NEW
    };
  });
}
```

---

## Improvement 4: Adaptive Balance Tolerance Based on Currency

### Problem
Fixed 0.05 tolerance is too tight for currencies with no decimals (JPY, KRW) and potentially too loose for others. Japanese Yen transactions using 1.0 tolerance prevents false positives.

### Solution
Implement currency-aware tolerance in `balanceValidator.ts`.

### Technical Changes

**File: `src/lib/ruleEngine/balanceValidator.ts`**

Add currency tolerance lookup:
```typescript
// Currency-specific balance tolerances
const CURRENCY_TOLERANCES: Record<string, number> = {
  // No-decimal currencies (allow rounding to nearest unit)
  JPY: 1.0,
  KRW: 1.0,
  IDR: 1.0,
  
  // Standard 2-decimal currencies
  USD: 0.01,
  EUR: 0.01,
  GBP: 0.01,
  AUD: 0.01,
  CAD: 0.01,
  
  // INR - some banks round to nearest rupee
  INR: 0.50,
  
  // Default fallback
  DEFAULT: 0.05,
};

export function getToleranceForCurrency(currency?: string): number {
  if (!currency) return CURRENCY_TOLERANCES.DEFAULT;
  return CURRENCY_TOLERANCES[currency] ?? CURRENCY_TOLERANCES.DEFAULT;
}
```

Update `validateBalanceEquation()` to accept currency:
```typescript
export function validateBalanceEquation(
  previousBalance: number,
  credit: number | null,
  debit: number | null,
  currentBalance: number,
  currency?: string  // NEW parameter
): ValidationResult {
  const tolerance = getToleranceForCurrency(currency);
  // ... rest of validation
}
```

Update `validateTransactionChain()` to pass currency:
```typescript
export function validateTransactionChain(
  transactions: ParsedTransaction[],
  openingBalance: number,
  currency?: string  // NEW parameter
): ParsedTransaction[] {
  // Pass currency to each validation call
  const validation = validateBalanceEquation(
    runningBalance,
    transaction.credit,
    transaction.debit,
    transaction.balance,
    currency
  );
  // ...
}
```

---

## Improvement 5: Per-Transaction Confidence Scoring

### Problem
Current confidence scoring is document-level only. Users can't see which specific transactions might have parsing issues.

### Solution
Add per-row confidence scoring based on multiple factors.

### Technical Changes

**File: `src/lib/ruleEngine/types.ts`**

Update `ParsedTransaction`:
```typescript
export interface ParsedTransaction {
  // ... existing fields
  
  // Per-transaction confidence scoring
  confidence?: TransactionConfidence;
}

export interface TransactionConfidence {
  overall: number;           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    dateConfidence: number;      // Was date parsed cleanly?
    amountConfidence: number;    // Were amounts numeric?
    balanceConfidence: number;   // Did balance validate?
    ocrConfidence?: number;      // OCR quality if applicable
    descriptionConfidence: number; // Description completeness
  };
  flags: string[];           // Specific concerns
}
```

**New File: `src/lib/ruleEngine/transactionConfidence.ts`**

```typescript
export interface TransactionConfidence {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    dateConfidence: number;
    amountConfidence: number;
    balanceConfidence: number;
    ocrConfidence?: number;
    descriptionConfidence: number;
  };
  flags: string[];
}

export function calculateTransactionConfidence(
  transaction: ParsedTransaction,
  rawTransaction: RawTransaction
): TransactionConfidence {
  const flags: string[] = [];
  
  // Date confidence
  let dateConfidence = 100;
  if (!transaction.date || transaction.date.length === 0) {
    dateConfidence = 0;
    flags.push('Missing date');
  } else if (transaction.date.includes('NaN')) {
    dateConfidence = 20;
    flags.push('Invalid date format');
  }
  
  // Amount confidence
  let amountConfidence = 100;
  if (transaction.debit === null && transaction.credit === null) {
    amountConfidence = 50;
    flags.push('No amount detected');
  }
  
  // Balance confidence (based on validation status)
  let balanceConfidence = 100;
  if (transaction.validationStatus === 'error') {
    balanceConfidence = 20;
    flags.push('Balance mismatch');
  } else if (transaction.validationStatus === 'warning') {
    balanceConfidence = 60;
    flags.push('Balance warning');
  }
  
  // Description confidence
  let descriptionConfidence = 100;
  if (!transaction.description || transaction.description.length < 3) {
    descriptionConfidence = 40;
    flags.push('Short/missing description');
  } else if (transaction.isStitchedRow) {
    descriptionConfidence = 90; // Slight penalty for stitched rows
  }
  
  // OCR confidence (if available)
  const ocrConfidence = rawTransaction.elements
    .filter(e => e.source === 'ocr' && e.confidence !== undefined)
    .reduce((sum, e) => sum + (e.confidence || 0), 0) / 
    Math.max(1, rawTransaction.elements.filter(e => e.source === 'ocr').length) * 100;
  
  // Weighted overall score
  const weights = { date: 0.20, amount: 0.30, balance: 0.30, description: 0.20 };
  const overall = 
    dateConfidence * weights.date +
    amountConfidence * weights.amount +
    balanceConfidence * weights.balance +
    descriptionConfidence * weights.description;
  
  // Grade
  const grade = overall >= 95 ? 'A' : overall >= 85 ? 'B' : overall >= 70 ? 'C' : overall >= 50 ? 'D' : 'F';
  
  return {
    overall: Math.round(overall),
    grade,
    factors: {
      dateConfidence,
      amountConfidence,
      balanceConfidence,
      ocrConfidence: ocrConfidence > 0 ? ocrConfidence : undefined,
      descriptionConfidence,
    },
    flags,
  };
}

export function aggregateConfidenceScores(
  confidences: TransactionConfidence[]
): { average: number; grade: string; lowConfidenceCount: number } {
  if (confidences.length === 0) return { average: 0, grade: 'F', lowConfidenceCount: 0 };
  
  const average = confidences.reduce((sum, c) => sum + c.overall, 0) / confidences.length;
  const lowConfidenceCount = confidences.filter(c => c.overall < 70).length;
  const grade = average >= 95 ? 'A' : average >= 85 ? 'B' : average >= 70 ? 'C' : average >= 50 ? 'D' : 'F';
  
  return { average: Math.round(average), grade, lowConfidenceCount };
}
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/lib/ruleEngine/numberParser.ts` | Modify | Add Indian number format detection, import OCR date correction |
| `src/lib/ruleEngine/ocrCorrection.ts` | Modify | Add `correctOCRDate()` function |
| `src/lib/ruleEngine/types.ts` | Modify | Add `reference`, `referenceType`, `TransactionConfidence` fields |
| `src/lib/ruleEngine/dynamicRowProcessor.ts` | Modify | Add `extractReference()` function, update conversion |
| `src/lib/ruleEngine/balanceValidator.ts` | Modify | Add currency-aware tolerance, update validation signatures |
| `src/lib/ruleEngine/transactionConfidence.ts` | Create | New module for per-transaction confidence scoring |

---

## Integration Points

1. **Main Pipeline** (`pdfProcessor.ts`): Call `calculateTransactionConfidence()` after parsing each transaction
2. **Excel Export** (`excelGenerator.ts`): Include confidence grade in output, optionally add to Validation sheet
3. **UI Display**: Show confidence badges per transaction (future enhancement)

---

## Expected Improvements

| Feature | Before | After |
|---------|--------|-------|
| Indian amounts (₹1,00,000.00) | Parse fails | Correctly parsed |
| OCR dates (O1/O2/2025) | Invalid date | Corrected to 01/02/2025 |
| Reference extraction | Buried in description | Separate searchable field |
| JPY validation | False positives | 1.0 tolerance eliminates noise |
| Transaction quality | Unknown | Per-row A-F grade |

---

## Risk Assessment

- **Low risk**: All changes are additive and backward-compatible
- **Fallback preserved**: Existing parsing continues to work if new detection fails
- **No breaking changes**: New fields are optional (`?`) in interfaces
- **Performance impact**: Minimal - simple regex and arithmetic operations


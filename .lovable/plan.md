# COMPLETED: Extract Account Details from PDF Headers for Statement_Info Sheet

## Status: ✅ IMPLEMENTED

The Statement Header Extractor has been implemented and integrated into the processing pipeline.

---

## Implementation Summary

### Created Files:
- `src/lib/ruleEngine/statementHeaderExtractor.ts` - New extraction module with regex patterns for global bank formats
```typescript
const metadata = {
  bankName: '',           // Empty - needs extraction
  accountHolder: '',      // Empty - needs extraction
  accountNumberMasked: '',// Empty - needs extraction
  statementPeriodFrom: doc.segments[0]?.statementPeriod?.from || '',  // Sometimes empty
  statementPeriodTo: doc.segments[0]?.statementPeriod?.to || '',      // Sometimes empty
  // ...
};
```

---

## Data to Extract

| Field | Example Pattern | Extraction Strategy |
|-------|-----------------|---------------------|
| Account Holder | `Name :- DR DEEPIKAS HEALTHPLUS PVT LTD` | Pattern: `Name\s*:[-]?\s*(.+)` |
| Account Number | `Account Number : 131010200026549` | Pattern: `Account\s*(Number|No\.?)\s*:?\s*(\d+)` → mask to last 4 digits |
| Statement Period | `From : 01-03-2025 To : 31-03-2025` | Pattern: `From\s*:?\s*(\d{2}[-/]\d{2}[-/]\d{4}).*To\s*:?\s*(\d{2}[-/]\d{2}[-/]\d{4})` |
| Bank Name | Auto-detected from bank profiles | Use `detectBank()` from bankProfiles |
| IFSC Code | `IFSC : HDFC0001234` | Pattern: `IFSC\s*:?\s*([A-Z]{4}\d{7})` |
| Customer ID | `Customer ID : 12345678` | Pattern: `Customer\s*ID\s*:?\s*(\w+)` |
| Branch | `Branch : Mumbai Main` | Pattern: `Branch\s*(Name)?\s*:?\s*(.+)` |

---

## Implementation Steps

### Step 1: Create Statement Header Extractor Module
**File:** `src/lib/ruleEngine/statementHeaderExtractor.ts` (NEW)

```typescript
export interface ExtractedStatementHeader {
  accountHolder?: string;
  accountNumber?: string;           // Full number (will be masked later)
  accountNumberMasked?: string;     // Last 4 digits only
  statementPeriodFrom?: string;     // DD-MM-YYYY format
  statementPeriodTo?: string;
  bankName?: string;
  ifscCode?: string;
  branchName?: string;
  customerId?: string;
  currency?: string;
}

// Region-aware extraction patterns
const EXTRACTION_PATTERNS = {
  accountHolder: [
    /Name\s*:[-]?\s*(.+)/i,
    /Account\s*Holder\s*:?\s*(.+)/i,
    /Customer\s*Name\s*:?\s*(.+)/i,
    /A\/C\s*Name\s*:?\s*(.+)/i,
  ],
  accountNumber: [
    /Account\s*(?:Number|No\.?)\s*:?\s*(\d{8,17})/i,
    /A\/C\s*(?:Number|No\.?)\s*:?\s*(\d{8,17})/i,
    /Account\s*:?\s*(\d{8,17})/i,
  ],
  statementPeriod: [
    /(?:From|For\s+the\s+period)\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*(?:To|[-–])\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /Period\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*(?:to|[-–])\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /Statement\s+from\s+(\d{1,2}\s+\w+\s+\d{4})\s+to\s+(\d{1,2}\s+\w+\s+\d{4})/i,
  ],
  ifscCode: [
    /IFSC\s*(?:Code)?\s*:?\s*([A-Z]{4}0[A-Z0-9]{6})/i,
  ],
  branchName: [
    /Branch\s*(?:Name)?\s*:?\s*(.+)/i,
  ],
  customerId: [
    /Customer\s*ID\s*:?\s*(\w+)/i,
    /CIF\s*(?:No\.?)?\s*:?\s*(\w+)/i,
  ],
};

export function extractStatementHeader(
  lines: PdfLine[],
  bankProfile?: BankProfile
): ExtractedStatementHeader;

export function maskAccountNumber(accountNumber: string): string;
```

**Key Features:**
- Searches first 20 lines only (header area)
- Region-aware patterns (India, UK, US, AU formats)
- Handles multi-format dates
- Masks account numbers to last 4 digits for security

### Step 2: Add Indian Bank-Specific Patterns
**File:** `src/lib/ruleEngine/statementHeaderExtractor.ts`

Indian banks have specific formats:
```typescript
const INDIAN_PATTERNS = {
  // HDFC: "Account Number : 50200012345678"
  // SBI: "Account No.: 12345678901"
  // ICICI: "Account Number : 123456789012"
  accountNumber: /Account\s*(?:Number|No\.?)\s*:?\s*(\d{10,17})/i,
  
  // "Name :- DR DEEPIKAS HEALTHPLUS PVT LTD"
  accountHolder: /Name\s*:[-]?\s*(.+)/i,
  
  // "for the period (From : 01-03-2025 To : 31-03-2025)"
  statementPeriod: /\(?From\s*:?\s*(\d{2}[-/]\d{2}[-/]\d{4})\s*To\s*:?\s*(\d{2}[-/]\d{2}[-/]\d{4})\)?/i,
  
  // "IFSC : HDFC0001234"
  ifsc: /IFSC\s*(?:Code)?\s*:?\s*([A-Z]{4}0[A-Z0-9]{6})/i,
};
```

### Step 3: Integrate with Processing Pipeline
**File:** `src/lib/ruleEngine/index.ts`

Add header extraction to `processDocument()`:

```typescript
import { extractStatementHeader } from './statementHeaderExtractor';
import { detectBank } from './bankProfiles';

// In processDocument(), after table detection:

// Extract statement header metadata
const headerLines = tableResult.allRows.slice(0, 20);
const bankDetection = detectBank(textElements.map(e => e.text), fileName);
const headerInfo = extractStatementHeader(headerLines, bankDetection.profile);

// Add to document
document.metadata = {
  bankName: bankDetection.profile?.name || headerInfo.bankName,
  accountHolder: headerInfo.accountHolder,
  accountNumberMasked: headerInfo.accountNumberMasked,
  statementPeriodFrom: headerInfo.statementPeriodFrom,
  statementPeriodTo: headerInfo.statementPeriodTo,
  ifscCode: headerInfo.ifscCode,
  branchName: headerInfo.branchName,
  currency: document.localCurrency,
  // ... other fields
};
```

### Step 4: Update ParsedDocument Type
**File:** `src/lib/ruleEngine/types.ts`

Add extracted header fields to the document:

```typescript
export interface ParsedDocument {
  // ... existing fields ...
  
  // Statement header metadata (NEW)
  extractedHeader?: ExtractedStatementHeader;
}

export interface ExtractedStatementHeader {
  accountHolder?: string;
  accountNumberMasked?: string;
  statementPeriodFrom?: string;
  statementPeriodTo?: string;
  bankName?: string;
  ifscCode?: string;
  branchName?: string;
  customerId?: string;
}
```

### Step 5: Update FileUpload to Use Extracted Data
**File:** `src/components/FileUpload.tsx`

Update `buildExportMetadata`:

```typescript
const buildExportMetadata = useCallback((file: UploadedFile) => {
  const doc = file.result?.document;
  if (!doc) return { metadata: undefined, validationSummary: undefined };

  const header = doc.extractedHeader;
  
  const metadata = {
    bankName: header?.bankName || '',
    accountHolder: header?.accountHolder || '',
    accountNumberMasked: header?.accountNumberMasked || '',
    statementPeriodFrom: header?.statementPeriodFrom || doc.segments[0]?.statementPeriod?.from || '',
    statementPeriodTo: header?.statementPeriodTo || doc.segments[0]?.statementPeriod?.to || '',
    // ... rest
  };
  // ...
}, []);
```

### Step 6: Update Edge Function to Include New Fields
**File:** `supabase/functions/generate-export/index.ts`

Add new fields to Statement_Info sheet:

```typescript
// Statement_Info sheet now includes:
['IFSC_Code', metadata.ifscCode || ''],
['Branch_Name', metadata.branchName || ''],
['Customer_ID', metadata.customerId || ''],
```

---

## Extraction Flow

```text
PDF Upload
    │
    ▼
┌─────────────────────────────┐
│  groupWordsIntoLines()      │  ← Existing
│  (First 20 lines = header)  │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  detectBank()               │  ← Existing (bank profiles)
│  → Get region-specific      │
│    patterns                 │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  extractStatementHeader()   │  ← NEW
│  → Account Holder           │
│  → Account Number (masked)  │
│  → Statement Period         │
│  → IFSC/Branch/Customer ID  │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Add to ParsedDocument      │
│  → doc.extractedHeader      │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  buildExportMetadata()      │  ← Updated
│  → Populate Statement_Info  │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  generate-export            │  ← Updated
│  → Sheet 2: Statement_Info  │
│    with extracted values    │
└─────────────────────────────┘
```

---

## Security Considerations

1. **Account Number Masking**: Always mask to last 4 digits
   ```typescript
   function maskAccountNumber(num: string): string {
     if (!num || num.length < 4) return '';
     return '****' + num.slice(-4);
   }
   ```

2. **No PII in Logs**: Never log full account numbers or names
3. **Export Type "masked"**: Hide account holder name when masked export selected

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/ruleEngine/statementHeaderExtractor.ts` | **CREATE** - New extraction module |
| `src/lib/ruleEngine/types.ts` | **MODIFY** - Add ExtractedStatementHeader type |
| `src/lib/ruleEngine/index.ts` | **MODIFY** - Integrate header extraction |
| `src/components/FileUpload.tsx` | **MODIFY** - Use extracted header data |
| `supabase/functions/generate-export/index.ts` | **MODIFY** - Add new fields to Statement_Info |

---

## Testing Checklist

- [ ] Upload Indian bank statement (HDFC/SBI/ICICI) → verify account holder, number, period extracted
- [ ] Upload UK bank statement → verify UK-format dates work
- [ ] Upload Australian bank statement → verify BSB/account format
- [ ] Verify account number masked to last 4 digits in Excel
- [ ] Verify Statement_Info sheet populates correctly
- [ ] Verify no full account numbers appear in console logs


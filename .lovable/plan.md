
# Plan: Comprehensive Conversion Pipeline Improvements (10 Enhancements)

## Overview

This plan implements 10 major enhancements to the PDF-to-Excel conversion pipeline to maximize accuracy, handle edge cases, and improve user experience. The improvements are ordered by priority and impact.

---

## Improvement 1: Cross-Page Transaction Stitching

### Problem
Transactions with long descriptions may be split across PDF page boundaries. Currently, the pipeline treats each page independently, causing description fragments to be missed or orphaned.

### Solution
Implement page-aware continuation detection in `pdfProcessor.ts` and `dynamicRowProcessor.ts`.

### Technical Changes

**File: `src/lib/ruleEngine/pageBreakHandler.ts`** (NEW FILE)

```typescript
// Detect if a transaction spans page boundary
// Look for:
// 1. Page ends with incomplete transaction (has date but no balance)
// 2. Next page starts with continuation line (no date, no amounts)

interface PageBoundaryContext {
  previousPageLastRow: ExtractedRow | null;
  currentPageFirstRow: ExtractedRow | null;
  shouldStitch: boolean;
}

function detectPageBreakContinuation(
  previousPageRows: ExtractedRow[],
  currentPageRows: ExtractedRow[]
): PageBoundaryContext
```

**File: `src/lib/ruleEngine/dynamicRowProcessor.ts`**

Add cross-page stitching logic:
```typescript
// NEW: Check if first row of new page continues previous transaction
function shouldMergeAcrossPageBreak(
  lastRow: StitchedTransaction,
  firstRow: ExtractedRow
): boolean {
  // First row has no date AND no amounts = likely continuation
  return !hasValidDate(firstRow) && !hasMonetaryAmount(firstRow);
}
```

---

## Improvement 2: Gibberish Detection & OCR Fallback

### Problem
Some PDFs have corrupted text layers where extraction returns garbage characters. Currently, the pipeline fails silently or produces unusable output.

### Solution
Add text quality scoring with automatic OCR fallback trigger.

### Technical Changes

**File: `src/lib/ruleEngine/textQualityAnalyzer.ts`** (NEW FILE)

```typescript
// Text quality heuristics
const GIBBERISH_INDICATORS = {
  tooManySpecialChars: (text: string) => {
    const special = text.replace(/[a-zA-Z0-9\s.,\-\/]/g, '').length;
    return special / text.length > 0.4;
  },
  noValidWords: (text: string) => {
    const words = text.split(/\s+/);
    const validWords = words.filter(w => /^[a-zA-Z]{2,}$/.test(w));
    return validWords.length < words.length * 0.2;
  },
  noDatePatterns: (text: string) => {
    return !DATE_PATTERNS.some(p => p.test(text));
  },
  noNumericPatterns: (text: string) => {
    return !/\d+[.,]\d{2}/.test(text);
  },
};

function calculateTextQualityScore(elements: TextElement[]): number {
  // Returns 0-100 score
  // Below 40 = trigger OCR fallback
}
```

**File: `src/lib/pdfProcessor.ts`**

Add quality check after text extraction:
```typescript
// After extractTextBasedPDF():
const qualityScore = calculateTextQualityScore(allTextElements);
console.log(`[PDF Processor] Text quality score: ${qualityScore}`);

if (qualityScore < 40 && pagesToProcess <= MAX_OCR_PAGES) {
  console.log('[PDF Processor] Low text quality, triggering OCR fallback...');
  // Fall through to OCR extraction
}
```

---

## Improvement 3: Enhanced Date Format Support

### Problem
Current date parsing misses regional formats like `15th Jan 2025`, Japanese dates, and non-English month names.

### Solution
Expand date patterns in `numberParser.ts` with ordinal handling and multilingual month names.

### Technical Changes

**File: `src/lib/ruleEngine/numberParser.ts`**

Add new date patterns:
```typescript
const DATE_PATTERNS = [
  // Existing patterns...
  
  // NEW: Ordinal dates (15th Jan 2025, 1st February 2024)
  { pattern: /^(\d{1,2})(?:st|nd|rd|th)\s+([A-Za-z]{3,9})\s+(\d{4})$/, format: 'DD_ORD MMM YYYY' },
  { pattern: /^([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th),?\s+(\d{4})$/, format: 'MMM DD_ORD YYYY' },
  
  // NEW: Japanese format (2025年1月15日)
  { pattern: /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, format: 'YYYY年MM月DD日' },
  
  // NEW: Arabic format (١٥/٠١/٢٠٢٥) - normalized
  { pattern: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/, format: 'DD/MM/YYYY' },
  
  // NEW: German written (15. Januar 2025)
  { pattern: /^(\d{1,2})\.\s*([A-Za-zäöü]+)\s+(\d{4})$/, format: 'DD. MMMM YYYY' },
];

// Expanded month names
const MONTH_NAMES: Record<string, number> = {
  // English
  jan: 1, january: 1, feb: 2, february: 2, ...
  
  // German
  januar: 1, februar: 2, märz: 3, april: 4, mai: 5, juni: 6,
  juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12,
  
  // Japanese romanized
  ichigatsu: 1, nigatsu: 2, sangatsu: 3, shigatsu: 4, gogatsu: 5,
  rokugatsu: 6, shichigatsu: 7, hachigatsu: 8, kugatsu: 9, juugatsu: 10,
  juuichigatsu: 11, juunigatsu: 12,
  
  // Arabic romanized
  yanayir: 1, fibrayir: 2, maris: 3, abril: 4, mayu: 5, yunyu: 6,
  yulyu: 7, aghustus: 8, sibtambir: 9, uktubar: 10, nufimbir: 11, disambir: 12,
};
```

---

## Improvement 4: Excel Export with Confidence Grades

### Problem
The newly added per-transaction confidence scores aren't displayed in Excel exports, limiting their usefulness for auditors.

### Solution
Update `excelGenerator.ts` to add confidence columns and summary to the Validation sheet.

### Technical Changes

**File: `src/lib/excelGenerator.ts`**

Update transaction columns:
```typescript
const TRANSACTION_COLUMNS = [
  { header: 'Date', key: 'date', width: 12 },
  { header: 'Description', key: 'description', width: 50 },
  { header: 'Debit', key: 'debit', width: 15 },
  { header: 'Credit', key: 'credit', width: 15 },
  { header: 'Balance', key: 'balance', width: 15 },
  { header: 'Currency', key: 'currency', width: 10 },
  { header: 'Reference', key: 'reference', width: 20 },
  { header: 'Grade', key: 'grade', width: 8 },           // NEW
  { header: 'Confidence', key: 'confidence', width: 12 }, // NEW (0-100)
];
```

Add confidence summary to Validation sheet:
```typescript
// In generateValidationSheet():
const validationRows: [string, string][] = [
  // Existing rows...
  ['Average_Confidence', `${validationSummary.averageConfidence}%`],     // NEW
  ['Grade_Distribution', validationSummary.gradeDistribution],           // NEW
  ['Low_Confidence_Rows', String(validationSummary.lowConfidenceCount)], // NEW
];
```

Update `ValidationSummary` type:
```typescript
export interface ValidationSummary {
  // Existing fields...
  averageConfidence?: number;        // NEW
  gradeDistribution?: string;        // NEW: "A:15, B:8, C:2, D:0, F:1"
  lowConfidenceCount?: number;       // NEW: Rows with confidence < 70
}
```

---

## Improvement 5: Multi-Table Detection on Single Page

### Problem
Some statements have multiple table sections (e.g., Savings + Fixed Deposits) on the same page. Current detection merges them incorrectly.

### Solution
Enhance `tableDetector.ts` to detect and separate distinct table regions by vertical gaps.

### Technical Changes

**File: `src/lib/ruleEngine/tableDetector.ts`**

Update `detectTableRegions()`:
```typescript
function detectTableRegions(lines: PdfLine[]): TableRegion[] {
  // NEW: Also split on large vertical gaps (>50px)
  const GAP_THRESHOLD = 50;
  
  for (let i = 1; i < lines.length; i++) {
    const gap = lines[i].top - lines[i-1].bottom;
    
    if (gap > GAP_THRESHOLD) {
      // This is a table break - create separate region
      if (consistentColumnCount >= 3) {
        tables.push(createTableRegion(lines, tableStartIndex, i - 1));
      }
      tableStartIndex = i;
      consistentColumnCount = 1;
    }
    // Existing column count logic...
  }
}
```

Add section header detection:
```typescript
const SECTION_HEADER_PATTERNS = [
  /^(savings|current|fixed\s*deposit|credit\s*card|loan)\s+(account|statement)/i,
  /^account\s+summary/i,
  /^transaction\s+history/i,
];

function isTableSectionHeader(line: PdfLine): boolean {
  const text = line.words.map(w => w.text).join(' ');
  return SECTION_HEADER_PATTERNS.some(p => p.test(text));
}
```

---

## Improvement 6: Overdraft/Negative Balance Handling

### Problem
Current balance validation assumes all balances are positive. Overdraft accounts with legitimate negative balances trigger false errors.

### Solution
Update `balanceValidator.ts` to detect and handle overdraft accounts.

### Technical Changes

**File: `src/lib/ruleEngine/balanceValidator.ts`**

Add overdraft detection:
```typescript
// Detect if statement has overdraft (negative balances)
function detectOverdraftAccount(transactions: ParsedTransaction[]): boolean {
  return transactions.some(tx => tx.balance < 0);
}

// Update validateBalanceEquation to handle negative balances
export function validateBalanceEquation(
  previousBalance: number,
  credit: number | null,
  debit: number | null,
  currentBalance: number,
  currency?: string,
  allowNegative: boolean = false  // NEW parameter
): ValidationResult {
  // Skip false-positive check for negative balances if overdraft detected
  // ...
}
```

Update chain validation:
```typescript
export function validateTransactionChain(
  transactions: ParsedTransaction[],
  openingBalance: number,
  currency?: string
): ParsedTransaction[] {
  // NEW: Detect overdraft at start
  const isOverdraftAccount = detectOverdraftAccount(transactions);
  
  if (isOverdraftAccount) {
    console.log('[BalanceValidator] Overdraft account detected - allowing negative balances');
  }
  // ...
}
```

---

## Improvement 7: Font Metadata for Header Detection

### Problem
Header detection relies solely on text patterns. PDFs with bold/larger headers could be detected more reliably using font metadata.

### Solution
Extract font information from pdf.js and use it to boost header detection confidence.

### Technical Changes

**File: `src/lib/ruleEngine/types.ts`**

Extend TextElement:
```typescript
export interface TextElement {
  text: string;
  boundingBox: BoundingBox;
  pageNumber: number;
  confidence?: number;
  source?: 'text-layer' | 'ocr';
  fontInfo?: {             // NEW
    fontName?: string;
    fontSize?: number;
    isBold?: boolean;
    isItalic?: boolean;
  };
}
```

**File: `src/lib/pdfUtils.ts`**

Extract font info:
```typescript
export async function extractTextFromPage(
  page: PDFPageProxy,
  pageNumber: number
): Promise<TextElement[]> {
  // ...
  for (const item of textContent.items) {
    const textItem = item as TextItem;
    
    textElements.push({
      text: textItem.str,
      boundingBox: { ... },
      pageNumber,
      fontInfo: {
        fontName: textItem.fontName,
        fontSize: Math.abs(transform[0]),
        isBold: textItem.fontName?.toLowerCase().includes('bold'),
      },
    });
  }
}
```

**File: `src/lib/ruleEngine/headerAnchors.ts`**

Use font info for header detection:
```typescript
function isLikelyHeaderRow(line: PdfLine, elements: TextElement[]): boolean {
  // Existing text-based detection...
  
  // NEW: Boost confidence if row has bold/larger text
  const rowElements = elements.filter(e => 
    e.boundingBox.y >= line.top - 5 && 
    e.boundingBox.y <= line.bottom + 5
  );
  
  const hasBoldText = rowElements.some(e => e.fontInfo?.isBold);
  const hasLargerText = rowElements.some(e => 
    e.fontInfo?.fontSize && e.fontInfo.fontSize > 10
  );
  
  if (hasBoldText || hasLargerText) {
    confidence += 0.2;
  }
  
  return confidence > 0.6;
}
```

---

## Improvement 8: Partial Statement Detection

### Problem
Users may upload mid-month statement snapshots that don't have opening/closing balance rows. Validation fails unnecessarily.

### Solution
Detect partial statements and adjust validation expectations.

### Technical Changes

**File: `src/lib/ruleEngine/partialStatementDetector.ts`** (NEW FILE)

```typescript
interface StatementCompleteness {
  hasOpeningBalance: boolean;
  hasClosingBalance: boolean;
  isPartialStatement: boolean;
  detectedPeriod?: { from: string; to: string };
}

function detectStatementCompleteness(
  transactions: ParsedTransaction[],
  extractedHeader: ExtractedStatementHeader
): StatementCompleteness {
  // Check for opening/closing balance keywords in descriptions
  const hasOpening = transactions.some(tx => 
    isOpeningBalanceRow(tx.description)
  );
  const hasClosing = transactions.some(tx => 
    isClosingBalanceRow(tx.description)
  );
  
  return {
    hasOpeningBalance: hasOpening,
    hasClosingBalance: hasClosing,
    isPartialStatement: !hasOpening || !hasClosing,
    detectedPeriod: extractedHeader?.statementPeriodFrom 
      ? { from: extractedHeader.statementPeriodFrom, to: extractedHeader.statementPeriodTo || '' }
      : undefined,
  };
}
```

**File: `src/lib/ruleEngine/balanceValidator.ts`**

Adjust validation for partial statements:
```typescript
export function validateTransactionChain(
  transactions: ParsedTransaction[],
  openingBalance: number,
  currency?: string,
  isPartialStatement: boolean = false  // NEW
): ParsedTransaction[] {
  if (isPartialStatement) {
    // Use first transaction's calculated opening balance
    // Don't fail if no explicit opening balance row found
    console.log('[BalanceValidator] Partial statement - using derived opening balance');
  }
  // ...
}
```

---

## Improvement 9: Accounting Code Mapping

### Problem
Exported transactions have categories but no standardized accounting codes for import into accounting software.

### Solution
Add optional accounting code mapping for QuickBooks/Xero/MYOB compatibility.

### Technical Changes

**File: `src/lib/ruleEngine/accountingCodeMapper.ts`** (NEW FILE)

```typescript
// Standard Chart of Accounts mapping
const ACCOUNTING_CODES: Record<string, { code: string; name: string }> = {
  // Income
  'Salary': { code: '4000', name: 'Salary Income' },
  'Interest': { code: '4100', name: 'Interest Income' },
  'Dividends': { code: '4200', name: 'Dividend Income' },
  
  // Expenses
  'Groceries': { code: '5100', name: 'Food & Groceries' },
  'Utilities': { code: '5200', name: 'Utilities' },
  'Transport': { code: '5300', name: 'Transportation' },
  'Entertainment': { code: '5400', name: 'Entertainment' },
  
  // Transfers
  'Transfer': { code: '6000', name: 'Inter-Account Transfer' },
  'ATM': { code: '6100', name: 'Cash Withdrawal' },
};

function mapCategoryToAccountingCode(category: string): {
  code: string;
  accountName: string;
} | null {
  const mapping = ACCOUNTING_CODES[category];
  return mapping ? { code: mapping.code, accountName: mapping.name } : null;
}
```

Update `StandardizedTransaction` type:
```typescript
export interface StandardizedTransaction {
  // Existing fields...
  accountingCode?: string;    // NEW: QuickBooks/Xero compatible code
  accountName?: string;       // NEW: Account name for mapping
}
```

---

## Improvement 10: Bank Profile Auto-Learning Suggestions

### Problem
When parsing fails or produces poor results, users have no way to help improve future parsing.

### Solution
Implement pattern learning suggestions that log unmatched patterns for future profile updates.

### Technical Changes

**File: `src/lib/ruleEngine/patternLearner.ts`** (NEW FILE)

```typescript
interface UnmatchedPattern {
  type: 'date' | 'amount' | 'header' | 'reference';
  rawText: string;
  context: string;  // Surrounding text
  frequency: number;
  suggestedPattern?: string;
}

class PatternLearner {
  private unmatchedPatterns: Map<string, UnmatchedPattern> = new Map();
  
  recordUnmatchedDate(text: string, context: string): void {
    // Log date-like strings that failed to parse
  }
  
  recordUnmatchedAmount(text: string, context: string): void {
    // Log numeric-like strings that failed to parse
  }
  
  getSuggestions(): UnmatchedPattern[] {
    // Return patterns that appear frequently (>3 times)
    return Array.from(this.unmatchedPatterns.values())
      .filter(p => p.frequency >= 3)
      .sort((a, b) => b.frequency - a.frequency);
  }
}
```

**File: `src/lib/ruleEngine/index.ts`**

Add learning hooks:
```typescript
// At end of processDocument():
const patternSuggestions = patternLearner.getSuggestions();
if (patternSuggestions.length > 0) {
  console.log('[PatternLearner] Unmatched patterns found:', patternSuggestions);
  warnings.push(`${patternSuggestions.length} unrecognized patterns detected - results may be incomplete`);
}
```

---

## Files to Create/Modify Summary

| File | Action | Changes |
|------|--------|---------|
| `src/lib/ruleEngine/pageBreakHandler.ts` | CREATE | Cross-page transaction stitching |
| `src/lib/ruleEngine/textQualityAnalyzer.ts` | CREATE | Gibberish detection & OCR fallback trigger |
| `src/lib/ruleEngine/partialStatementDetector.ts` | CREATE | Partial statement detection |
| `src/lib/ruleEngine/accountingCodeMapper.ts` | CREATE | QuickBooks/Xero code mapping |
| `src/lib/ruleEngine/patternLearner.ts` | CREATE | Auto-learning pattern suggestions |
| `src/lib/ruleEngine/numberParser.ts` | MODIFY | Add 10+ new date patterns, multilingual months |
| `src/lib/ruleEngine/tableDetector.ts` | MODIFY | Multi-table detection, vertical gap splitting |
| `src/lib/ruleEngine/balanceValidator.ts` | MODIFY | Overdraft handling, partial statement support |
| `src/lib/ruleEngine/dynamicRowProcessor.ts` | MODIFY | Cross-page stitching integration |
| `src/lib/ruleEngine/headerAnchors.ts` | MODIFY | Font-based header detection |
| `src/lib/ruleEngine/types.ts` | MODIFY | Add fontInfo, accountingCode fields |
| `src/lib/pdfProcessor.ts` | MODIFY | Quality score check, OCR fallback trigger |
| `src/lib/pdfUtils.ts` | MODIFY | Extract font metadata from pdf.js |
| `src/lib/excelGenerator.ts` | MODIFY | Add confidence columns, grade distribution |

---

## Implementation Priority Order

1. **High Priority** (Core accuracy improvements):
   - Gibberish Detection & OCR Fallback (Improvement 2)
   - Enhanced Date Formats (Improvement 3)
   - Cross-Page Transaction Stitching (Improvement 1)

2. **Medium Priority** (Edge case handling):
   - Multi-Table Detection (Improvement 5)
   - Overdraft/Negative Balance (Improvement 6)
   - Partial Statement Detection (Improvement 8)

3. **Lower Priority** (User experience & exports):
   - Excel Export with Confidence (Improvement 4)
   - Font Metadata for Headers (Improvement 7)
   - Accounting Code Mapping (Improvement 9)
   - Pattern Auto-Learning (Improvement 10)

---

## Expected Improvements

| Feature | Before | After |
|---------|--------|-------|
| Page-break descriptions | Truncated/orphaned | Properly stitched |
| Corrupted text layer | Silent failure | Auto OCR fallback |
| Ordinal dates (15th Jan) | Not parsed | Correctly parsed |
| Confidence visibility | Hidden | Visible in Excel |
| Multiple tables/page | Merged incorrectly | Separated correctly |
| Overdraft accounts | False errors | Properly validated |
| Bold headers | Missed sometimes | Higher detection rate |
| Partial statements | Validation fails | Graceful handling |
| Accounting import | Manual mapping | Auto code assignment |
| Unrecognized patterns | Silent ignore | Logged for learning |

---

## Risk Assessment

- **Low risk**: All changes are additive and backward-compatible
- **Fallback preserved**: Existing parsing continues to work if new detection fails
- **No breaking changes**: New fields are optional in all interfaces
- **Performance impact**: Minimal - most changes are O(n) operations
- **Testing required**: Each improvement should be tested with relevant edge case PDFs


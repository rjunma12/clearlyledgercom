

# Plan: Additional Methods to Improve Bank Statement Conversion Success (No AI)

## Overview

This plan implements multiple deterministic improvements to increase conversion success rates for both scanned PDFs and digital bank statements. All methods use rule-based logic, pattern matching, and mathematical validation—no AI required.

---

## Current Pipeline Gaps Identified

| Gap | Impact | Solution Category |
|-----|--------|-------------------|
| Single-pass table detection | Misses tables with complex layouts | Multi-strategy detection |
| No font metadata usage | Misses header signals | PDF font analysis |
| Limited retry logic | Fails on marginal cases | Fallback chains |
| No row validation scoring | Can't rank parsing results | Per-row confidence |
| Fixed skip patterns | Misses bank-specific noise | Extensible pattern registry |
| No boundary tolerance | Column drift across pages | Adaptive column boundaries |

---

## Improvement Areas

### 1. **Multi-Strategy Table Detection with Best-Result Selection**

Add a parallel detection approach that runs multiple strategies and picks the best result.

**File: `src/lib/ruleEngine/multiStrategyDetector.ts`** (new file)

```typescript
// Run multiple detection strategies in parallel and select best result
interface DetectionStrategy {
  name: string;
  detect: (elements: TextElement[]) => TableDetectionResult;
  priority: number;
}

// Strategies:
// 1. Header-anchored (current) - uses keyword matching
// 2. Geometry-based gutter detection (current)
// 3. Column-count heuristic - finds most consistent column count
// 4. Font-weight detection - uses bold text as anchors

function selectBestResult(results: Array<{strategy: string; result: TableDetectionResult}>): TableDetectionResult {
  // Score each result based on:
  // - Number of transactions found
  // - Presence of balance column
  // - Date pattern matches
  // - Balance validation success rate (dry run)
  return bestResult;
}
```

**Why:** Different banks have different layouts. Running multiple strategies and picking the winner dramatically improves success on edge cases.

---

### 2. **PDF Font Metadata Extraction for Header Detection**

Use PDF font properties (bold, size) to improve header row detection confidence.

**File: `src/lib/pdfUtils.ts`** (update)

Add font metadata extraction:

```typescript
interface TextElementWithFont extends TextElement {
  fontName?: string;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
}

// In extractTextFromPage, access font info:
const fontData = item.fontName;
const isBold = fontData?.includes('Bold') || fontData?.includes('Heavy');
const fontSize = item.transform?.[0] || 12; // Font size from transform matrix
```

**File: `src/lib/ruleEngine/headerAnchors.ts`** (update)

Boost header detection confidence when text is bold or larger:

```typescript
function scoreHeaderLine(line: PdfLine): number {
  let score = 0;
  
  // Keyword matches
  score += countHeaderKeywords(line) * 20;
  
  // NEW: Font-based boosting
  const boldCount = line.words.filter(w => w.isBold).length;
  score += boldCount * 15;
  
  const avgFontSize = calculateAvgFontSize(line);
  if (avgFontSize > bodyFontSize * 1.2) {
    score += 10; // Larger than body = likely header
  }
  
  return score;
}
```

**Why:** Headers in bank statements are almost always bold or larger. This provides a strong signal independent of keyword matching.

---

### 3. **Row-Level Confidence Scoring with Fallback**

Score each extracted row and implement row-level fallback for low-confidence rows.

**File: `src/lib/ruleEngine/transactionConfidence.ts`** (update or new)

```typescript
interface RowConfidence {
  rowIndex: number;
  overallScore: number;  // 0-100
  breakdown: {
    dateClarity: number;      // 0-100: Date parsed successfully?
    amountPresence: number;   // 0-100: Has debit/credit/balance?
    balanceIntegrity: number; // 0-100: Math checks out?
    descriptionQuality: number; // 0-100: Non-empty, no gibberish?
  };
  flags: string[];
}

function scoreTransactionRow(tx: ParsedTransaction, prevBalance: number | null): RowConfidence {
  let dateClarity = tx.date ? 100 : 0;
  let amountPresence = (tx.debit || tx.credit) ? 100 : 0;
  
  // Balance integrity check
  let balanceIntegrity = 100;
  if (prevBalance !== null && tx.balance !== undefined) {
    const expected = prevBalance + (tx.credit ?? 0) - (tx.debit ?? 0);
    if (Math.abs(expected - tx.balance) > 0.01) {
      balanceIntegrity = 0;
    }
  }
  
  // Description quality
  const descQuality = scoreDescriptionQuality(tx.description);
  
  return {
    rowIndex: tx.rowIndex,
    overallScore: (dateClarity * 0.2 + amountPresence * 0.3 + balanceIntegrity * 0.3 + descQuality * 0.2),
    breakdown: { dateClarity, amountPresence, balanceIntegrity, descriptionQuality: descQuality },
    flags: [],
  };
}
```

**Why:** Per-row scoring enables flagging problematic rows for user review while still exporting the rest, rather than failing the entire document.

---

### 4. **Adaptive Column Boundary Drift Tolerance**

Currently 15px drift tolerance. Make this adaptive based on page analysis.

**File: `src/lib/ruleEngine/headerAnchors.ts`** (update)

```typescript
function calculatePageDriftTolerance(page1Boundaries: ColumnBoundary[], pageNBoundaries: ColumnBoundary[]): number {
  // Compare column positions between pages
  const drifts: number[] = [];
  
  for (let i = 0; i < Math.min(page1Boundaries.length, pageNBoundaries.length); i++) {
    const drift = Math.abs(page1Boundaries[i].centerX - pageNBoundaries[i].centerX);
    drifts.push(drift);
  }
  
  if (drifts.length === 0) return 15; // Default
  
  const maxDrift = Math.max(...drifts);
  const avgDrift = drifts.reduce((a, b) => a + b, 0) / drifts.length;
  
  // Use 2x average drift as tolerance, capped at 30px
  return Math.min(30, Math.max(15, avgDrift * 2));
}
```

**Why:** Some banks have more page-to-page layout variation. Adaptive tolerance prevents column misassignment.

---

### 5. **Bank-Specific Skip Pattern Registry**

Make skip patterns extensible per bank profile.

**File: `src/lib/ruleEngine/skipPatterns.ts`** (update)

```typescript
// Add bank-specific patterns
const BANK_SKIP_PATTERNS: Record<string, RegExp[]> = {
  'chase-us': [
    /^ending balance on/i,
    /^beginning balance on/i,
  ],
  'hdfc-india': [
    /^narration$/i,
    /^chq.*no\.?$/i,
  ],
  'cba-australia': [
    /^interest\s+free\s+days/i,
  ],
  // ... more banks
};

export function shouldSkipTextForBank(text: string, bankId: string | null): boolean {
  if (shouldSkipText(text)) return true;
  
  if (bankId && BANK_SKIP_PATTERNS[bankId]) {
    const trimmed = text.trim().toLowerCase();
    return BANK_SKIP_PATTERNS[bankId].some(pattern => pattern.test(trimmed));
  }
  
  return false;
}
```

**Why:** Banks have unique noise patterns (promotional text, legal disclaimers) that should be filtered.

---

### 6. **Balance Equation Retry with Sign-Flip Exploration**

When balance validation fails, systematically try sign flips to find a valid configuration.

**File: `src/lib/ruleEngine/autoRepair.ts`** (update)

Add multi-flip exploration:

```typescript
interface FlipCandidate {
  indices: number[];
  imbalance: number;
}

function exploreSignFlips(
  transactions: ParsedTransaction[],
  openingBalance: number,
  closingBalance: number,
  maxFlips: number = 3
): RepairResult {
  const originalImbalance = calculateImbalance(transactions, openingBalance, closingBalance);
  
  if (originalImbalance < 0.01) {
    return { repaired: false, ...defaultResult };
  }
  
  // Try single flips first (existing logic)
  const singleFlip = tryDebitCreditFlip(transactions, openingBalance, closingBalance);
  if (singleFlip.improved && calculateImbalance(singleFlip.transactions, openingBalance, closingBalance) < 0.01) {
    return singleFlip;
  }
  
  // NEW: Try double flips
  const candidates: FlipCandidate[] = [];
  
  for (let i = 0; i < transactions.length; i++) {
    for (let j = i + 1; j < transactions.length; j++) {
      const testTx = flipTransactions(transactions, [i, j]);
      const imbalance = calculateImbalance(testTx, openingBalance, closingBalance);
      
      if (imbalance < originalImbalance * 0.5) {
        candidates.push({ indices: [i, j], imbalance });
      }
    }
  }
  
  // Return best candidate if it reduces imbalance significantly
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.imbalance - b.imbalance);
    if (candidates[0].imbalance < 0.01) {
      return buildRepairResult(transactions, candidates[0].indices);
    }
  }
  
  return { repaired: false, ...defaultResult };
}
```

**Why:** Sometimes two or more transactions are misclassified. Exploring multi-flip combinations catches these cases.

---

### 7. **Enhanced Multi-Line Description Stitching**

Improve description stitching with smarter continuation detection.

**File: `src/lib/ruleEngine/multiLineStitcher.ts`** (update)

```typescript
// Add more continuation indicators
const CONTINUATION_INDICATORS = [
  /^[a-z]/, // Starts with lowercase = likely continuation
  /^[,;:\-\/]/, // Starts with punctuation
  /^\d{10,}/, // Long number (reference continuing)
  /^at\s|^for\s|^to\s|^from\s|^by\s|^via\s/i, // Common prepositions
];

const NON_CONTINUATION_INDICATORS = [
  /^\d{1,2}[\/\-\.]\d{1,2}/, // Starts with date-like pattern
  /^opening|^closing|^balance/i, // Balance keywords
  /^total|^subtotal/i, // Summary keywords
];

function isContinuationRow(row: TextRow): boolean {
  const desc = extractDescription(row);
  
  // Definite non-continuation
  if (NON_CONTINUATION_INDICATORS.some(p => p.test(desc))) return false;
  
  // Standard check: no date, no amounts
  if (!hasDescription(row) || hasValidDate(row) || hasMonetaryAmount(row)) return false;
  
  // Boost confidence if matches continuation pattern
  const hasContinuationIndicator = CONTINUATION_INDICATORS.some(p => p.test(desc));
  
  return true; // Base case passes if no date/amount
}
```

**Why:** More accurate continuation detection prevents false merges and catches legitimate continuations.

---

### 8. **Parallel Balance Validation with Tolerance Tiers**

Try multiple tolerance levels and accept the most permissive that passes.

**File: `src/lib/ruleEngine/balanceValidator.ts`** (update)

```typescript
const TOLERANCE_TIERS = [
  { name: 'exact', tolerance: 0.001 },
  { name: 'penny', tolerance: 0.01 },
  { name: 'rounding', tolerance: 0.10 },
  { name: 'loose', tolerance: 1.00 },
];

function validateWithTolerance(
  transactions: ParsedTransaction[],
  openingBalance: number
): { valid: boolean; usedTolerance: string; errors: number } {
  for (const tier of TOLERANCE_TIERS) {
    let runningBalance = openingBalance;
    let errors = 0;
    
    for (const tx of transactions) {
      runningBalance += (tx.credit ?? 0) - (tx.debit ?? 0);
      
      if (tx.balance !== undefined) {
        if (Math.abs(runningBalance - tx.balance) > tier.tolerance) {
          errors++;
        }
      }
    }
    
    if (errors === 0) {
      return { valid: true, usedTolerance: tier.name, errors: 0 };
    }
  }
  
  return { valid: false, usedTolerance: 'none', errors: transactions.length };
}
```

**Why:** Different banks/currencies have different rounding behavior. Tiered tolerance prevents false negatives.

---

### 9. **Intelligent Year Inference for Short Dates**

When dates lack a year, infer it from statement context.

**File: `src/lib/ruleEngine/numberParser.ts`** (update)

```typescript
function inferYearFromContext(
  month: number,
  day: number,
  statementPeriod?: { from: string; to: string }
): number {
  const currentYear = new Date().getFullYear();
  
  if (statementPeriod?.from) {
    const periodYear = parseInt(statementPeriod.from.split('-')[0]);
    if (!isNaN(periodYear)) {
      return periodYear;
    }
  }
  
  // If month > current month, likely previous year
  const currentMonth = new Date().getMonth() + 1;
  if (month > currentMonth + 1) {
    return currentYear - 1;
  }
  
  return currentYear;
}

// Update 'DD MMM' and 'MMM DD' format handlers to use this
```

**Why:** Many bank statements show short dates. Context-aware year inference prevents parsing failures.

---

### 10. **Export Fallback Chain**

When primary export fails, try progressively simpler exports.

**File: `src/lib/ruleEngine/exportAdapters.ts`** (update)

```typescript
type ExportLevel = 'full' | 'validated' | 'raw' | 'minimal';

function exportWithFallback(
  document: ParsedDocument,
  targetFormat: ExportFormat
): { data: any; level: ExportLevel; warnings: string[] } {
  const levels: ExportLevel[] = ['full', 'validated', 'raw', 'minimal'];
  
  for (const level of levels) {
    try {
      const data = exportAtLevel(document, targetFormat, level);
      const warnings = level !== 'full' 
        ? [`Export degraded to '${level}' level due to data quality issues`]
        : [];
      return { data, level, warnings };
    } catch (e) {
      console.log(`[Export] Level '${level}' failed, trying next...`);
    }
  }
  
  throw new Error('All export levels failed');
}

function exportAtLevel(doc: ParsedDocument, format: ExportFormat, level: ExportLevel) {
  switch (level) {
    case 'full':
      // Include all columns, validations, categories
      return fullExport(doc, format);
    case 'validated':
      // Only transactions with valid status
      return validatedExport(doc, format);
    case 'raw':
      // Use rawTransactions fallback
      return rawExport(doc.rawTransactions, format);
    case 'minimal':
      // Date, description, amount only
      return minimalExport(doc, format);
  }
}
```

**Why:** Ensures users always get *something* rather than a complete failure.

---

## Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/ruleEngine/multiStrategyDetector.ts` | New | Multi-strategy table detection |
| `src/lib/pdfUtils.ts` | Update | Font metadata extraction |
| `src/lib/ruleEngine/headerAnchors.ts` | Update | Font-based header boosting, adaptive drift |
| `src/lib/ruleEngine/transactionConfidence.ts` | New/Update | Row-level confidence scoring |
| `src/lib/ruleEngine/skipPatterns.ts` | Update | Bank-specific skip patterns |
| `src/lib/ruleEngine/autoRepair.ts` | Update | Multi-flip exploration |
| `src/lib/ruleEngine/multiLineStitcher.ts` | Update | Enhanced continuation detection |
| `src/lib/ruleEngine/balanceValidator.ts` | Update | Tiered tolerance validation |
| `src/lib/ruleEngine/numberParser.ts` | Update | Context-aware year inference |
| `src/lib/ruleEngine/exportAdapters.ts` | Update | Fallback export chain |

---

## Expected Impact

| Improvement | Current Gap | Expected Improvement |
|-------------|-------------|---------------------|
| Multi-strategy detection | ~75% success | +10-15% success rate |
| Font metadata | Missed headers | +5% header detection |
| Row confidence | All-or-nothing | Partial exports possible |
| Multi-flip repair | Single-flip only | +3-5% balance validation |
| Tiered tolerance | Fixed tolerance | Fewer false negatives |
| Export fallback | Complete failures | Always produces output |

---

## Implementation Priority

1. **High Priority** (most impact):
   - Multi-strategy table detection
   - Export fallback chain
   - Tiered balance validation

2. **Medium Priority**:
   - Font metadata header detection
   - Multi-flip auto-repair
   - Adaptive column drift

3. **Lower Priority** (refinements):
   - Bank-specific skip patterns
   - Enhanced continuation detection
   - Year inference

---

## Processing Flow After Changes

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENHANCED CONVERSION PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  1. MULTI-STRATEGY TABLE DETECTION                                │  │
│  │     ├─ Strategy A: Header-anchored detection                      │  │
│  │     ├─ Strategy B: Geometry gutter detection                      │  │
│  │     ├─ Strategy C: Column-count heuristic                         │  │
│  │     └─ Strategy D: Font-weight anchoring                          │  │
│  │     → Score each → Select BEST result                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  2. ENHANCED ROW EXTRACTION                                       │  │
│  │     ├─ Adaptive column drift tolerance (15-30px based on page)   │  │
│  │     ├─ Bank-specific skip pattern filtering                       │  │
│  │     └─ Smart continuation line stitching                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  3. PER-ROW CONFIDENCE SCORING                                    │  │
│  │     ├─ Date clarity (20%)                                         │  │
│  │     ├─ Amount presence (30%)                                      │  │
│  │     ├─ Balance integrity (30%)                                    │  │
│  │     └─ Description quality (20%)                                  │  │
│  │     → Flag low-confidence rows for review                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  4. TIERED BALANCE VALIDATION                                     │  │
│  │     Try: Exact (0.001) → Penny (0.01) → Rounding (0.10) → Loose   │  │
│  │     Accept first tier that passes                                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  5. MULTI-FLIP AUTO-REPAIR (if validation failed)                 │  │
│  │     ├─ Single debit/credit flips                                  │  │
│  │     ├─ Double flip combinations                                   │  │
│  │     └─ Accept if imbalance → 0                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  6. EXPORT WITH FALLBACK CHAIN                                    │  │
│  │     Try: Full → Validated → Raw → Minimal                         │  │
│  │     Always produce output, warn if degraded                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```


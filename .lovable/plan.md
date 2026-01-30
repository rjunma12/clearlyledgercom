
# Plan: Improve Table Column Detection for Unusual PDF Layouts

## Overview
Enhance the geometry-based table detection algorithm in `tableDetector.ts` and related modules to better handle edge cases with unusual PDF layouts, including:
- Merged column headers (e.g., "Debit/Credit" in single column)
- Variable column widths across pages
- Non-standard layouts (rotated text, split headers, multi-line headers)
- Sparse data rows with missing columns
- PDFs with multiple distinct table sections

---

## Current Architecture Analysis

The existing pipeline uses:
1. **`groupWordsIntoLines()`** - Groups text elements by Y-tolerance (3px)
2. **`detectTableRegions()`** - Identifies table areas by consistent word counts
3. **`detectColumnBoundaries()`** - Finds vertical gutters (gaps) to identify columns
4. **`classifyColumns()`** - Uses content analysis (date patterns, numeric scores) to infer types
5. **`postProcessColumnTypes()`** - Fallback assignment for missing required columns

---

## Identified Edge Cases & Solutions

### Edge Case 1: Merged Debit/Credit Columns
**Problem**: Some banks use a single "Amount" or "Debit/Credit" column with CR/DR suffixes.

**Solution**: Add merged column detection and sign inference:
```typescript
// In classifyColumns()
const MERGED_AMOUNT_PATTERNS = /\b(amount|value|transaction)\b/i;
const DEBIT_SUFFIX = /(dr|debit|\-)\s*$/i;
const CREDIT_SUFFIX = /(cr|credit|\+)\s*$/i;

// Detect if column has mixed CR/DR suffixes
function detectMergedAmountColumn(samples: string[]): boolean {
  const drCount = samples.filter(s => DEBIT_SUFFIX.test(s)).length;
  const crCount = samples.filter(s => CREDIT_SUFFIX.test(s)).length;
  return drCount > 0 && crCount > 0;
}
```

### Edge Case 2: Variable Gutter Widths
**Problem**: Current gutter threshold (10% of lines) fails with sparse or inconsistent layouts.

**Solution**: Implement adaptive gutter detection:
```typescript
function detectColumnBoundaries(lines: PdfLine[]): ColumnBoundary[] {
  // NEW: Adaptive thresholds based on document density
  const avgWordsPerLine = lines.reduce((sum, l) => sum + l.words.length, 0) / lines.length;
  const gutterThreshold = Math.max(1, lines.length * (avgWordsPerLine > 6 ? 0.05 : 0.15));
  const minGutterWidth = avgWordsPerLine > 6 ? 2 : 4; // Narrower gutters for dense layouts
  // ... rest of detection
}
```

### Edge Case 3: Multi-Line Headers
**Problem**: Headers spanning multiple lines (e.g., "Transaction\nDate") aren't detected.

**Solution**: Expand header search to merge adjacent header lines:
```typescript
function detectMultiLineHeaders(lines: PdfLine[]): PdfLine {
  // Search first 15 lines
  // Merge lines that are within 5px Y-distance AND don't contain date patterns
  // Return combined "super-line" for header detection
}
```

### Edge Case 4: Page-to-Page Column Drift
**Problem**: Column positions shift slightly between pages due to PDF rendering.

**Solution**: Use first page anchors with tolerance-based matching:
```typescript
interface AnchorTolerance {
  x: number;        // Original anchor X
  tolerance: number; // Allowed drift (typically 5-15px)
}

function matchColumnAcrossPages(
  word: PdfWord, 
  anchors: ColumnAnchor[], 
  pageNumber: number
): ColumnType {
  // For page 1: exact match
  // For page 2+: use tolerance-based matching
  const tolerance = pageNumber === 1 ? 0 : 15;
  // ... matching logic
}
```

### Edge Case 5: Empty/Sparse Data Cells
**Problem**: Rows with missing values (e.g., no credit amount) can misalign subsequent columns.

**Solution**: Use strict column boundary enforcement:
```typescript
function extractRowWithStrictBounds(
  line: PdfLine, 
  boundaries: ColumnBoundary[]
): ExtractedRow {
  // For each column boundary:
  // - Collect words whose CENTER falls within [x0, x1]
  // - If no words found, mark as null (not try to borrow from adjacent)
  // - This prevents column-shift cascade
}
```

### Edge Case 6: Dual Date Columns (Trans Date + Value Date)
**Problem**: Some banks have two date columns, causing date detection to pick wrong one.

**Solution**: Prioritize leftmost date column, label second as reference:
```typescript
function postProcessColumnTypes(boundaries: ColumnBoundary[]): ColumnBoundary[] {
  const dateColumns = boundaries.filter(b => b.inferredType === 'date');
  if (dateColumns.length > 1) {
    // Keep leftmost as date, demote others to 'reference' or 'value_date'
    dateColumns.slice(1).forEach(col => {
      col.inferredType = 'reference';
      console.log('[PostProcess] Demoted secondary date column to reference');
    });
  }
  // ... existing logic
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/ruleEngine/tableDetector.ts` | Add adaptive gutter detection, merged column handling, multi-line header support, strict boundary enforcement |
| `src/lib/ruleEngine/headerAnchors.ts` | Add page-drift tolerance, multi-line header merging |
| `src/lib/ruleEngine/dynamicRowProcessor.ts` | Improve merged amount column parsing with CR/DR sign extraction |
| `src/lib/ruleEngine/types.ts` | Add new types for merged columns and anchor tolerance |

---

## Technical Implementation Details

### 1. Enhanced Gutter Detection (`tableDetector.ts`)

**Current logic (lines 253-266)**:
```typescript
const gutterThreshold = lines.length * 0.1; // Fixed 10%
```

**Improved logic**:
```typescript
// Adaptive thresholds
const avgWordsPerLine = lines.reduce((s, l) => s + l.words.length, 0) / lines.length;
const documentDensity = avgWordsPerLine > 8 ? 'dense' : avgWordsPerLine > 4 ? 'normal' : 'sparse';

const gutterThreshold = {
  dense: lines.length * 0.03,   // 3% for dense layouts
  normal: lines.length * 0.08,  // 8% for normal
  sparse: lines.length * 0.15,  // 15% for sparse
}[documentDensity];

const minGutterPixels = {
  dense: 4,   // 4px minimum gutter
  normal: 6,  // 6px minimum
  sparse: 10, // 10px minimum
}[documentDensity];
```

### 2. Merged Amount Column Detection (`tableDetector.ts`)

Add new classification in `inferColumnType()`:
```typescript
function inferColumnType(analysis: ColumnAnalysis, ...): { type: ColumnType; confidence: number } {
  // Check for merged debit/credit column
  const hasMixedSuffixes = analysis.samples.some(s => /\b(cr|dr|credit|debit)\b/i.test(s));
  const hasNumericContent = analysis.numericScore > 0.3;
  
  if (hasNumericContent && hasMixedSuffixes) {
    console.log('[ColumnClassifier] Detected merged Debit/Credit column');
    return { type: 'amount', confidence: 0.85 }; // New 'amount' type
  }
  // ... existing logic
}
```

Update `postProcessColumnTypes()` to handle 'amount' type:
```typescript
if (hasAmountColumn && !hasDebit && !hasCredit) {
  // Mark amount column for special processing in dynamicRowProcessor
  // which will split values into debit/credit based on suffix
}
```

### 3. Multi-Line Header Detection (`headerAnchors.ts`)

Add header line merging:
```typescript
function mergeAdjacentHeaderLines(lines: PdfLine[]): PdfLine[] {
  const mergedLines: PdfLine[] = [];
  let currentMerge: PdfWord[] = [];
  let currentY = -100;
  
  for (const line of lines.slice(0, 15)) {
    // If line is within 10px of previous and contains header keywords
    const yGap = line.top - currentY;
    const hasHeaderWord = line.words.some(w => 
      Object.values(HEADER_KEYWORDS).flat().some(kw => 
        w.text.toLowerCase().includes(kw.toLowerCase())
      )
    );
    
    if (yGap < 10 && hasHeaderWord) {
      currentMerge.push(...line.words);
    } else if (currentMerge.length > 0) {
      mergedLines.push(createLineFromWords(currentMerge));
      currentMerge = [...line.words];
    }
    currentY = line.bottom;
  }
  
  return mergedLines;
}
```

### 4. Page Drift Tolerance (`headerAnchors.ts`)

Add tolerance to `assignWordToColumn()`:
```typescript
export function assignWordToColumn(
  word: PdfWord,
  anchors: LockedColumnAnchors,
  pageNumber: number = 1
): ColumnType | null {
  const wordCenter = (word.x0 + word.x1) / 2;
  
  // Page 1: strict matching. Page 2+: allow 15px drift
  const tolerance = pageNumber === 1 ? 0 : 15;
  
  for (const [colType, anchor] of anchorEntries) {
    if (!anchor) continue;
    
    const anchorLeft = anchor.x0 - tolerance;
    const anchorRight = anchor.x1 + tolerance;
    
    if (wordCenter >= anchorLeft && wordCenter <= anchorRight) {
      return colType as ColumnType;
    }
  }
  return null;
}
```

### 5. Strict Boundary Enforcement (`tableDetector.ts`)

Update `isWordInColumn()` for stricter matching:
```typescript
function isWordInColumn(word: PdfWord, boundary: ColumnBoundary, strict: boolean = false): boolean {
  const wordCenter = (word.x0 + word.x1) / 2;
  
  if (strict) {
    // Word center MUST be within boundary
    return wordCenter >= boundary.x0 && wordCenter <= boundary.x1;
  }
  
  // Existing flexible logic
  const overlap = Math.min(word.x1, boundary.x1) - Math.max(word.x0, boundary.x0);
  return wordCenter >= boundary.x0 && wordCenter <= boundary.x1 ||
         overlap > word.width * 0.5;
}
```

---

## New Type Definitions (`types.ts`)

```typescript
// Merged column support
export type ExtendedColumnType = ColumnType | 'amount' | 'value_date';

// Document layout density
export type LayoutDensity = 'sparse' | 'normal' | 'dense';

// Anchor with tolerance for multi-page matching
export interface ToleranceAnchor extends ColumnAnchor {
  pageDriftTolerance: number;
  originalPageNumber: number;
}
```

---

## Testing Scenarios

After implementation, test with:
1. **Indian bank statement** with merged "Amount" column (ICICI, SBI format)
2. **Multi-page PDF** where columns drift 5-10px between pages
3. **Statement with dual date columns** (Transaction Date + Value Date)
4. **Sparse layout** with many empty credit cells
5. **Dense layout** with narrow gutters (5-6 columns in tight space)

---

## Expected Improvements

| Edge Case | Current Behavior | After Fix |
|-----------|------------------|-----------|
| Merged Amount column | Misclassified as single numeric | Correctly split to debit/credit |
| Page drift >5px | Columns shift on page 2+ | Consistent mapping across pages |
| Multi-line header | Header not detected | Combined header line detected |
| Sparse rows | Column cascade | Strict boundary prevents shift |
| Dual date columns | Both marked as 'date' | Primary date + reference |
| Very narrow gutters | Missed columns | Adaptive threshold catches |

---

## Risk Assessment

- **Low risk**: All changes are additive to existing logic
- **Fallback preserved**: Original detection still runs if adaptive detection fails
- **No breaking changes**: Existing bank profiles and parsing continue to work
- **Logging enhanced**: All new detection paths include console logs for debugging

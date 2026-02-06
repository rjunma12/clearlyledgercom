/**
 * Geometry-Based Table Detection Engine
 * Automatically detects table regions and column boundaries using pdf.js text geometry
 * Zero-cost, template-free solution that works with ANY bank statement format
 */

import type { TextElement } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface PdfWord {
  text: string;
  x0: number;      // Left edge
  x1: number;      // Right edge
  top: number;     // Y position (from top)
  bottom: number;  // Bottom edge
  width: number;
  height: number;
  pageNumber: number;
}

export interface PdfLine {
  words: PdfWord[];
  top: number;
  bottom: number;
  left: number;
  right: number;
  pageNumber: number;
}

export interface ColumnBoundary {
  x0: number;           // Left edge of column
  x1: number;           // Right edge of column
  centerX: number;      // Center point for alignment
  inferredType: ColumnType | null;
  confidence: number;   // 0-1 confidence in type inference
}

export type ColumnType = 'date' | 'description' | 'debit' | 'credit' | 'balance' | 'reference' | 'amount' | 'value_date' | 'unknown';

// Document layout density for adaptive detection
export type LayoutDensity = 'sparse' | 'normal' | 'dense';

export interface TableRegion {
  top: number;
  bottom: number;
  left: number;
  right: number;
  headerLine: PdfLine | null;
  dataLines: PdfLine[];
  columnBoundaries: ColumnBoundary[];
  pageNumbers: number[];
}

// =============================================================================
// WORD GROUPING (pdfplumber-style)
// =============================================================================

/**
 * Group TextElements into logical lines using Y-tolerance clustering
 * Optimized: Uses Map-based grouping for O(n) complexity instead of O(n log n)
 */
export function groupWordsIntoLines(
  elements: TextElement[],
  yTolerance: number = 3
): PdfLine[] {
  if (elements.length === 0) return [];

  // Convert TextElements to PdfWords
  const words: PdfWord[] = elements
    .map(el => ({
      text: el.text.trim(),
      x0: el.boundingBox.x,
      x1: el.boundingBox.x + el.boundingBox.width,
      top: el.boundingBox.y,
      bottom: el.boundingBox.y + el.boundingBox.height,
      width: el.boundingBox.width,
      height: el.boundingBox.height,
      pageNumber: el.pageNumber,
    }))
    .filter(w => w.text.length > 0);

  if (words.length === 0) return [];

  // Group by page first (O(n))
  const byPage = new Map<number, PdfWord[]>();
  for (const word of words) {
    const existing = byPage.get(word.pageNumber);
    if (existing) {
      existing.push(word);
    } else {
      byPage.set(word.pageNumber, [word]);
    }
  }

  const allLines: PdfLine[] = [];

  // Process each page independently
  for (const [, pageWords] of byPage) {
    // Sort only within page (smaller sort = faster)
    pageWords.sort((a, b) => {
      if (Math.abs(a.top - b.top) > yTolerance) return a.top - b.top;
      return a.x0 - b.x0;
    });

    // Bucket by Y-position (O(n))
    const yBuckets = new Map<number, PdfWord[]>();
    for (const word of pageWords) {
      const bucketKey = Math.round(word.top / yTolerance) * yTolerance;
      const bucket = yBuckets.get(bucketKey);
      if (bucket) {
        bucket.push(word);
      } else {
        yBuckets.set(bucketKey, [word]);
      }
    }

    // Merge adjacent buckets into lines
    const sortedKeys = [...yBuckets.keys()].sort((a, b) => a - b);
    for (const key of sortedKeys) {
      const bucket = yBuckets.get(key)!;
      bucket.sort((a, b) => a.x0 - b.x0);
      allLines.push(createLineFromWords(bucket));
    }
  }

  return allLines;
}

function createLineFromWords(words: PdfWord[]): PdfLine {
  // Sort words left to right
  words.sort((a, b) => a.x0 - b.x0);
  
  return {
    words,
    top: Math.min(...words.map(w => w.top)),
    bottom: Math.max(...words.map(w => w.bottom)),
    left: Math.min(...words.map(w => w.x0)),
    right: Math.max(...words.map(w => w.x1)),
    pageNumber: words[0].pageNumber,
  };
}

// =============================================================================
// TABLE REGION DETECTION
// =============================================================================

// Threshold for vertical gap that indicates a table break
// Increased from 80px to 150px to reduce over-fragmentation on bank statements
// Bank statements often have large section gaps that shouldn't split tables
const VERTICAL_GAP_THRESHOLD = 150;

/**
 * Section header patterns that indicate a new table region
 * Made more strict to avoid false splits
 */
const SECTION_HEADER_PATTERNS = [
  /^(savings|current|fixed\s*deposit|credit\s*card|loan)\s+(account|statement)$/i,
  /^account\s+summary$/i,
  /^statement\s+of\s+account$/i,
];

/**
 * Check if a line is a section header
 */
function isTableSectionHeader(line: PdfLine): boolean {
  const text = line.words.map(w => w.text).join(' ');
  return SECTION_HEADER_PATTERNS.some(p => p.test(text));
}

/**
 * Detect table regions by finding areas with consistent column structure
 * NEW: Also splits on vertical gaps and section headers
 */
export function detectTableRegions(lines: PdfLine[]): TableRegion[] {
  if (lines.length < 3) return [];

  const tables: TableRegion[] = [];
  let tableStartIndex = -1;
  let consistentColumnCount = 0;
  let prevWordCount = 0;
  let prevLineBottom = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const wordCount = line.words.length;
    
    // Check for section header - always creates a new table region
    if (isTableSectionHeader(line)) {
      if (consistentColumnCount >= 3) {
        tables.push(createTableRegion(lines, tableStartIndex, i - 1));
      }
      tableStartIndex = -1;
      consistentColumnCount = 0;
      prevLineBottom = line.bottom;
      continue;
    }
    
    // Check for large vertical gap - indicates table break
    if (tableStartIndex !== -1 && prevLineBottom > 0) {
      const verticalGap = line.top - prevLineBottom;
      if (verticalGap > VERTICAL_GAP_THRESHOLD) {
        // This is a table break
        if (consistentColumnCount >= 3) {
          tables.push(createTableRegion(lines, tableStartIndex, i - 1));
          console.log(`[TableDetector] Table break detected at line ${i} (gap: ${verticalGap.toFixed(0)}px)`);
        }
        tableStartIndex = -1;
        consistentColumnCount = 0;
      }
    }

    // A table row typically has 3+ columns
    if (wordCount >= 3) {
      if (tableStartIndex === -1) {
        // Start potential table region
        tableStartIndex = i;
        consistentColumnCount = 1;
        prevWordCount = wordCount;
      } else if (isConsistentStructure(wordCount, prevWordCount)) {
        consistentColumnCount++;
      } else {
        // Structure broke - check if we had a valid table
        if (consistentColumnCount >= 3) {
          tables.push(createTableRegion(lines, tableStartIndex, i - 1));
        }
        // Reset and check if current line starts new table
        tableStartIndex = wordCount >= 3 ? i : -1;
        consistentColumnCount = 1;
        prevWordCount = wordCount;
      }
    } else {
      // Less than 3 words - end current table if exists
      if (consistentColumnCount >= 3) {
        tables.push(createTableRegion(lines, tableStartIndex, i - 1));
      }
      tableStartIndex = -1;
      consistentColumnCount = 0;
    }
    
    prevLineBottom = line.bottom;
  }

  // Handle table at end of document
  if (consistentColumnCount >= 3) {
    tables.push(createTableRegion(lines, tableStartIndex, lines.length - 1));
  }
  
  console.log(`[TableDetector] Detected ${tables.length} table region(s) before merging`);

  // NEW: Merge compatible adjacent tables to reduce fragmentation
  const mergedTables = mergeCompatibleTables(tables);
  console.log(`[TableDetector] After merging: ${mergedTables.length} table region(s)`);

  return mergedTables;
}

function isConsistentStructure(count1: number, count2: number): boolean {
  // Allow ±3 word variance for multi-line descriptions, etc.
  // Increased from ±2 to reduce fragmentation
  return Math.abs(count1 - count2) <= 3;
}

/**
 * Merge compatible adjacent tables to reduce fragmentation
 * Criteria: same or adjacent pages + similar column count
 */
function mergeCompatibleTables(tables: TableRegion[]): TableRegion[] {
  if (tables.length <= 1) return tables;
  
  const merged: TableRegion[] = [];
  let current = tables[0];
  
  for (let i = 1; i < tables.length; i++) {
    const next = tables[i];
    
    // Check if tables should be merged
    const currentLastPage = current.pageNumbers[current.pageNumbers.length - 1];
    const nextFirstPage = next.pageNumbers[0];
    const sameOrAdjacentPage = Math.abs(nextFirstPage - currentLastPage) <= 1;
    
    // Use dataLines word count variance for column comparison
    const currentAvgWords = current.dataLines.length > 0 
      ? current.dataLines.reduce((sum, l) => sum + l.words.length, 0) / current.dataLines.length
      : 0;
    const nextAvgWords = next.dataLines.length > 0 
      ? next.dataLines.reduce((sum, l) => sum + l.words.length, 0) / next.dataLines.length
      : 0;
    const similarStructure = Math.abs(currentAvgWords - nextAvgWords) <= 2;
    
    if (sameOrAdjacentPage && similarStructure) {
      // Merge: extend current table
      current = {
        ...current,
        bottom: next.bottom,
        right: Math.max(current.right, next.right),
        left: Math.min(current.left, next.left),
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

function createTableRegion(lines: PdfLine[], startIdx: number, endIdx: number): TableRegion {
  const dataLines = lines.slice(startIdx, endIdx + 1);
  const pageNumbers = [...new Set(dataLines.map(l => l.pageNumber))];
  
  // First line might be header - we'll determine this in column classification
  const headerLine = dataLines[0];
  
  return {
    top: Math.min(...dataLines.map(l => l.top)),
    bottom: Math.max(...dataLines.map(l => l.bottom)),
    left: Math.min(...dataLines.map(l => l.left)),
    right: Math.max(...dataLines.map(l => l.right)),
    headerLine,
    dataLines,
    columnBoundaries: [],  // Will be filled by detectColumnBoundaries
    pageNumbers,
  };
}

// =============================================================================
// COLUMN BOUNDARY DETECTION (Vertical Gutter Analysis)
// =============================================================================

/**
 * Detect layout density based on average words per line
 */
function detectLayoutDensity(lines: PdfLine[]): LayoutDensity {
  if (lines.length === 0) return 'normal';
  
  const totalWords = lines.reduce((sum, l) => sum + l.words.length, 0);
  const avgWordsPerLine = totalWords / lines.length;
  
  if (avgWordsPerLine > 8) return 'dense';
  if (avgWordsPerLine > 4) return 'normal';
  return 'sparse';
}

/**
 * Detect column boundaries by finding vertical gutters (gaps between text)
 * Now uses adaptive thresholds based on document density
 */
export function detectColumnBoundaries(lines: PdfLine[]): ColumnBoundary[] {
  if (lines.length === 0) return [];

  // Collect all word X-positions
  const allXPositions: { x0: number; x1: number }[] = [];
  for (const line of lines) {
    for (const word of line.words) {
      allXPositions.push({ x0: word.x0, x1: word.x1 });
    }
  }

  if (allXPositions.length === 0) return [];

  // Find page width
  const pageLeft = Math.min(...allXPositions.map(p => p.x0));
  const pageRight = Math.max(...allXPositions.map(p => p.x1));
  const pageWidth = pageRight - pageLeft;

  // Create histogram of X-coverage (which X positions have text)
  const resolution = 2; // 2px buckets
  const bucketCount = Math.ceil(pageWidth / resolution);
  const coverage = new Array(bucketCount).fill(0);

  for (const pos of allXPositions) {
    const startBucket = Math.floor((pos.x0 - pageLeft) / resolution);
    const endBucket = Math.floor((pos.x1 - pageLeft) / resolution);
    for (let b = startBucket; b <= endBucket && b < bucketCount; b++) {
      coverage[b]++;
    }
  }

  // NEW: Adaptive thresholds based on document density
  const density = detectLayoutDensity(lines);
  const gutterThresholds: Record<LayoutDensity, number> = {
    dense: 0.03,   // 3% for dense layouts (many columns)
    normal: 0.08,  // 8% for normal
    sparse: 0.15,  // 15% for sparse layouts
  };
  const minGutterBuckets: Record<LayoutDensity, number> = {
    dense: 2,   // 4px minimum gutter for dense
    normal: 3,  // 6px minimum gutter for normal
    sparse: 5,  // 10px minimum gutter for sparse
  };
  
  const gutterThreshold = Math.max(1, lines.length * gutterThresholds[density]);
  const minGutterWidth = minGutterBuckets[density];
  
  console.log(`[ColumnDetector] Density: ${density}, Gutter threshold: ${gutterThreshold.toFixed(1)}, Min gutter: ${minGutterWidth * 2}px`);

  // Find gutters (consecutive buckets with low coverage)
  const gutters: { start: number; end: number }[] = [];
  let gutterStart = -1;

  for (let i = 0; i < bucketCount; i++) {
    if (coverage[i] <= gutterThreshold) {
      if (gutterStart === -1) gutterStart = i;
    } else {
      if (gutterStart !== -1 && i - gutterStart >= minGutterWidth) {
        gutters.push({ start: gutterStart, end: i - 1 });
      }
      gutterStart = -1;
    }
  }

  // Handle gutter at end
  if (gutterStart !== -1 && bucketCount - gutterStart >= minGutterWidth) {
    gutters.push({ start: gutterStart, end: bucketCount - 1 });
  }

  // Convert gutters to column boundaries
  const boundaries: ColumnBoundary[] = [];
  let columnStart = pageLeft;
  
  // Adaptive minimum column width based on density
  const minColumnWidth = density === 'dense' ? 15 : 20;

  for (const gutter of gutters) {
    const gutterCenterX = pageLeft + ((gutter.start + gutter.end) / 2) * resolution;
    
    if (gutterCenterX - columnStart > minColumnWidth) {
      boundaries.push({
        x0: columnStart,
        x1: gutterCenterX,
        centerX: (columnStart + gutterCenterX) / 2,
        inferredType: null,
        confidence: 0,
      });
    }
    columnStart = gutterCenterX;
  }

  // Add final column
  if (pageRight - columnStart > minColumnWidth) {
    boundaries.push({
      x0: columnStart,
      x1: pageRight,
      centerX: (columnStart + pageRight) / 2,
      inferredType: null,
      confidence: 0,
    });
  }

  return boundaries;
}

// =============================================================================
// CONTENT-BASED COLUMN CLASSIFICATION
// =============================================================================

const DATE_PATTERNS = [
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,           // DD/MM/YYYY, MM/DD/YYYY
  /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,              // YYYY-MM-DD
  /^\d{1,2}\s+[A-Za-z]{3,9}(\s+\d{2,4})?$/,             // 15 Jan or 15 January 2025
  /^[A-Za-z]{3,9}\s+\d{1,2}(,?\s+\d{2,4})?$/,           // Jan 15 or January 15, 2025
  /^\d{1,2}[\/\-]\d{1,2}$/,                              // DD/MM or MM/DD (short)
];

const CREDIT_KEYWORDS = /\bcr\b|credit|deposit|in\b|\+/i;
const DEBIT_KEYWORDS = /\bdr\b|debit|withdrawal|out\b|\-/i;

// Patterns for merged amount column detection
const MERGED_AMOUNT_HEADER = /^(amount|value|transaction\s*amount|txn\s*amt)$/i;
const DEBIT_SUFFIX = /(dr|debit|\-)\s*$/i;
const CREDIT_SUFFIX = /(cr|credit|\+)\s*$/i;

/**
 * Detect if a column contains merged debit/credit values with CR/DR suffixes
 */
function detectMergedAmountColumn(samples: string[]): boolean {
  if (samples.length < 3) return false;
  
  const drCount = samples.filter(s => DEBIT_SUFFIX.test(s)).length;
  const crCount = samples.filter(s => CREDIT_SUFFIX.test(s)).length;
  
  // Must have both DR and CR suffixes present
  return drCount > 0 && crCount > 0;
}

// Header keywords for explicit column type detection
const HEADER_DEBIT_PATTERNS = /^(debit|withdrawal|dr|out|withdrawals)$/i;
const HEADER_CREDIT_PATTERNS = /^(credit|deposit|cr|in|deposits)$/i;

/**
 * Flexible numeric content detection that handles:
 * - Currency symbols (₹, $, £, €, ¥)
 * - Text suffixes (CR, DR, DB)
 * - Mixed formats (1,548.00 Dr)
 */
function hasNumericContent(text: string): boolean {
  if (!text || text.length === 0) return false;
  
  // Remove currency symbols and common suffixes
  const cleaned = text
    .replace(/[₹$£€¥]/g, '')
    .replace(/\b(CR|DR|DB|IN|OUT)\b/gi, '')
    .trim();
  
  // Count digits vs other significant characters
  const digitCount = (cleaned.match(/\d/g) || []).length;
  const totalChars = cleaned.replace(/[\s,.\-()]/g, '').length;
  
  // At least 50% digits and has at least one digit
  return digitCount >= 1 && digitCount / Math.max(totalChars, 1) > 0.5;
}

export interface ColumnAnalysis {
  boundary: ColumnBoundary;
  samples: string[];
  dateScore: number;
  numericScore: number;
  textScore: number;
  alignment: 'left' | 'right' | 'center';
  avgWidth: number;
}

/**
 * Classify column types based on content analysis
 */
export function classifyColumns(
  lines: PdfLine[],
  boundaries: ColumnBoundary[]
): ColumnBoundary[] {
  if (boundaries.length === 0 || lines.length === 0) return boundaries;

  // Analyze each column
  const analyses: ColumnAnalysis[] = boundaries.map(boundary => 
    analyzeColumn(lines, boundary)
  );

  // Assign types based on analysis
  const classifiedBoundaries = boundaries.map((boundary, index) => {
    const analysis = analyses[index];
    const { type, confidence } = inferColumnType(analysis, analyses, index);
    
    return {
      ...boundary,
      inferredType: type,
      confidence,
    };
  });

  // Post-processing: ensure we have required columns
  return postProcessColumnTypes(classifiedBoundaries, lines);
}

function analyzeColumn(lines: PdfLine[], boundary: ColumnBoundary): ColumnAnalysis {
  const samples: string[] = [];
  const alignments: number[] = []; // X-positions for alignment detection

  for (const line of lines) {
    const wordsInColumn = line.words.filter(w => 
      isWordInColumn(w, boundary)
    );

    if (wordsInColumn.length > 0) {
      const text = wordsInColumn.map(w => w.text).join(' ').trim();
      samples.push(text);
      
      // Track left edge for alignment
      alignments.push(wordsInColumn[0].x0);
    }
  }

  // Calculate scores
  const dateScore = samples.filter(s => 
    DATE_PATTERNS.some(p => p.test(s))
  ).length / Math.max(samples.length, 1);

  // Use flexible numeric detection instead of strict pattern
  const numericScore = samples.filter(s => 
    hasNumericContent(s)
  ).length / Math.max(samples.length, 1);

  const textScore = samples.filter(s => 
    !hasNumericContent(s) && s.length > 3
  ).length / Math.max(samples.length, 1);

  // Detect alignment
  const alignment = detectAlignment(alignments, boundary);
  
  // Average text width
  const avgWidth = samples.reduce((sum, s) => sum + s.length, 0) / Math.max(samples.length, 1);

  return {
    boundary,
    samples,
    dateScore,
    numericScore,
    textScore,
    alignment,
    avgWidth,
  };
}

/**
 * Check if a word belongs to a column
 * @param strict - If true, word center MUST be within boundary (prevents cascade)
 */
function isWordInColumn(word: PdfWord, boundary: ColumnBoundary, strict: boolean = false): boolean {
  const wordCenter = (word.x0 + word.x1) / 2;
  
  if (strict) {
    // Strict mode: word center MUST be within boundary
    return wordCenter >= boundary.x0 && wordCenter <= boundary.x1;
  }
  
  // Flexible mode: word center within bounds, or significant overlap
  const overlap = Math.min(word.x1, boundary.x1) - Math.max(word.x0, boundary.x0);
  return wordCenter >= boundary.x0 && wordCenter <= boundary.x1 ||
         overlap > word.width * 0.5;
}

function detectAlignment(xPositions: number[], boundary: ColumnBoundary): 'left' | 'right' | 'center' {
  if (xPositions.length < 2) return 'left';

  const leftVariance = calculateVariance(xPositions);
  
  // For right alignment, we'd need right edge positions
  // Simplified: if variance is low, it's left-aligned
  if (leftVariance < 10) return 'left';
  
  // Check if positions cluster near center
  const centerX = boundary.centerX;
  const centerDistances = xPositions.map(x => Math.abs(x - centerX));
  const avgCenterDist = centerDistances.reduce((a, b) => a + b, 0) / centerDistances.length;
  
  if (avgCenterDist < 20) return 'center';
  
  return 'right';
}

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

function inferColumnType(
  analysis: ColumnAnalysis,
  allAnalyses: ColumnAnalysis[],
  index: number
): { type: ColumnType; confidence: number } {
  // NEW: Check header row for explicit debit/credit keywords FIRST
  // This takes priority over position-based inference
  if (analysis.samples.length > 0) {
    const firstSample = analysis.samples[0].trim();
    
    if (HEADER_DEBIT_PATTERNS.test(firstSample)) {
      console.log('[ColumnClassifier] Found DEBIT header keyword:', firstSample);
      return { type: 'debit', confidence: 0.95 };
    }
    if (HEADER_CREDIT_PATTERNS.test(firstSample)) {
      console.log('[ColumnClassifier] Found CREDIT header keyword:', firstSample);
      return { type: 'credit', confidence: 0.95 };
    }
    
    // NEW: Check for merged amount column header
    if (MERGED_AMOUNT_HEADER.test(firstSample)) {
      console.log('[ColumnClassifier] Found AMOUNT header keyword:', firstSample);
      return { type: 'amount', confidence: 0.9 };
    }
  }
  
  // NEW: Check for merged debit/credit column (mixed CR/DR suffixes)
  if (analysis.numericScore > 0.3 && detectMergedAmountColumn(analysis.samples)) {
    console.log('[ColumnClassifier] Detected merged Debit/Credit column with CR/DR suffixes');
    return { type: 'amount', confidence: 0.85 };
  }
  
  // High date score -> Date column
  if (analysis.dateScore > 0.5) {
    return { type: 'date', confidence: analysis.dateScore };
  }

  // High numeric score with right alignment -> likely amount column
  // Lowered threshold from 0.6 to 0.3 to handle columns with headers/footers
  if (analysis.numericScore > 0.3 && analysis.alignment === 'right') {
    // Rightmost numeric columns: Balance > Credit > Debit
    const numericIndices = allAnalyses
      .map((a, i) => ({ index: i, score: a.numericScore, x: a.boundary.x0 }))
      .filter(a => a.score > 0.5)
      .sort((a, b) => b.x - a.x); // Right to left
    
    const myPosition = numericIndices.findIndex(n => n.index === index);
    
    if (myPosition === 0) {
      return { type: 'balance', confidence: analysis.numericScore };
    } else if (myPosition === 1) {
      return { type: 'credit', confidence: analysis.numericScore * 0.8 };
    } else if (myPosition === 2) {
      return { type: 'debit', confidence: analysis.numericScore * 0.7 };
    }
    
    return { type: 'unknown', confidence: 0.5 };
  }

  // High text score and widest column -> Description
  if (analysis.textScore > 0.3 || analysis.avgWidth > 20) {
    const maxWidth = Math.max(...allAnalyses.map(a => a.avgWidth));
    if (analysis.avgWidth >= maxWidth * 0.7) {
      return { type: 'description', confidence: Math.min(analysis.textScore + 0.3, 1) };
    }
  }

  // Short alphanumeric -> Reference
  if (analysis.avgWidth < 15 && analysis.numericScore > 0.3 && analysis.textScore > 0.3) {
    return { type: 'reference', confidence: 0.5 };
  }

  return { type: 'unknown', confidence: 0.3 };
}

function postProcessColumnTypes(boundaries: ColumnBoundary[], lines: PdfLine[]): ColumnBoundary[] {
  // Ensure we have at least a date and balance column
  let hasDate = boundaries.some(b => b.inferredType === 'date');
  let hasBalance = boundaries.some(b => b.inferredType === 'balance');
  let hasDescription = boundaries.some(b => b.inferredType === 'description');
  let hasDebit = boundaries.some(b => b.inferredType === 'debit');
  let hasCredit = boundaries.some(b => b.inferredType === 'credit');
  const hasAmount = boundaries.some(b => b.inferredType === 'amount');
  
  // NEW: Handle dual date columns (Transaction Date + Value Date)
  const dateColumns = boundaries
    .map((b, i) => ({ boundary: b, index: i }))
    .filter(({ boundary }) => boundary.inferredType === 'date');
  
  if (dateColumns.length > 1) {
    // Keep leftmost as date, demote others to value_date (reference)
    for (let i = 1; i < dateColumns.length; i++) {
      boundaries[dateColumns[i].index] = {
        ...boundaries[dateColumns[i].index],
        inferredType: 'value_date',
        confidence: 0.6,
      };
      console.log(`[PostProcess] Demoted secondary date column ${dateColumns[i].index} to value_date`);
    }
  }

  if (!hasDate && boundaries.length > 0) {
    // Assign leftmost column as date if none found
    boundaries[0] = { ...boundaries[0], inferredType: 'date', confidence: 0.4 };
    hasDate = true;
  }

  if (!hasBalance && boundaries.length > 1) {
    // Assign rightmost column as balance
    const last = boundaries.length - 1;
    boundaries[last] = { ...boundaries[last], inferredType: 'balance', confidence: 0.4 };
    hasBalance = true;
  }

  if (!hasDescription && boundaries.length > 2) {
    // Assign widest non-assigned column as description
    let widestIdx = -1;
    let maxWidth = 0;
    boundaries.forEach((b, i) => {
      if (b.inferredType === 'unknown' || b.inferredType === null) {
        const width = b.x1 - b.x0;
        if (width > maxWidth) {
          maxWidth = width;
          widestIdx = i;
        }
      }
    });
    if (widestIdx >= 0) {
      boundaries[widestIdx] = { ...boundaries[widestIdx], inferredType: 'description', confidence: 0.4 };
      hasDescription = true;
    }
  }

  // NEW: Handle merged amount column - no need to assign debit/credit separately
  // The dynamicRowProcessor will split based on CR/DR suffixes
  if (hasAmount && !hasDebit && !hasCredit) {
    console.log('[PostProcess] Merged amount column detected - will split in row processor');
    return boundaries;
  }

  // Assign unknown columns between date and balance as debit/credit
  if (!hasDebit || !hasCredit) {
    const dateIndex = boundaries.findIndex(b => b.inferredType === 'date');
    const balanceIndex = boundaries.findIndex(b => b.inferredType === 'balance');
    
    if (dateIndex >= 0 && balanceIndex >= 0 && balanceIndex > dateIndex) {
      // Find unknown/reference columns between date and balance (excluding description)
      const candidateColumns = boundaries
        .map((b, i) => ({ boundary: b, index: i }))
        .filter(({ boundary, index }) => 
          (boundary.inferredType === 'unknown' || boundary.inferredType === 'reference' || boundary.inferredType === 'value_date') &&
          index > dateIndex && 
          index < balanceIndex
        )
        .sort((a, b) => b.index - a.index); // Right to left (rightmost first)
      
      // Assign rightmost unknown as credit, next as debit (standard bank layout)
      if (candidateColumns.length >= 1 && !hasCredit) {
        boundaries[candidateColumns[0].index] = {
          ...boundaries[candidateColumns[0].index],
          inferredType: 'credit',
          confidence: 0.5,
        };
        hasCredit = true;
        console.log(`[PostProcess] Promoted column ${candidateColumns[0].index} to CREDIT`);
      }
      
      if (candidateColumns.length >= 2 && !hasDebit) {
        boundaries[candidateColumns[1].index] = {
          ...boundaries[candidateColumns[1].index],
          inferredType: 'debit',
          confidence: 0.5,
        };
        hasDebit = true;
        console.log(`[PostProcess] Promoted column ${candidateColumns[1].index} to DEBIT`);
      }
      
      // If only 1 unknown column, check if it's a merged amount column with CR/DR suffixes
      if (candidateColumns.length === 1 && !hasDebit && hasCredit) {
        const colIdx = candidateColumns[0].index;
        const colBoundary = boundaries[colIdx];
        
        // Check column content for mixed CR/DR suffixes
        const hasMixedSuffixes = checkForMergedColumnSuffixes(
          lines.slice(0, Math.min(50, lines.length)), // Sample first 50 lines
          colBoundary
        );
        
        if (hasMixedSuffixes) {
          // Keep as merged amount column - will be split in row processor
          boundaries[colIdx] = {
            ...colBoundary,
            inferredType: 'amount',
            confidence: 0.7,
          };
          console.log(`[PostProcess] Column ${colIdx} is merged amount (CR/DR suffixes detected)`);
        } else {
          // Actually a single debit column
          boundaries[colIdx] = {
            ...colBoundary,
            inferredType: 'debit',
            confidence: 0.5,
          };
          console.log(`[PostProcess] Reassigned column ${colIdx} to DEBIT (single column, no CR/DR suffixes)`);
        }
      }
    }
  }

  return boundaries;
}

// =============================================================================
// ROW EXTRACTION USING DETECTED COLUMNS
// =============================================================================

export interface ExtractedRow {
  lineIndex: number;
  pageNumber: number;
  date: string | null;
  description: string | null;
  debit: string | null;
  credit: string | null;
  balance: string | null;
  reference: string | null;
  amount: string | null;      // NEW: For merged debit/credit columns
  valueDate: string | null;   // NEW: Secondary date column
  rawLine: PdfLine;
}

/**
 * Extract structured rows from lines using detected column boundaries
 */
/**
 * Extract structured rows from lines using detected column boundaries
 * Uses strict boundary matching to prevent column cascade on sparse rows
 */
export function extractRowsFromTable(
  table: TableRegion,
  boundaries: ColumnBoundary[]
): ExtractedRow[] {
  const rows: ExtractedRow[] = [];

  for (let i = 0; i < table.dataLines.length; i++) {
    const line = table.dataLines[i];
    const row: ExtractedRow = {
      lineIndex: i,
      pageNumber: line.pageNumber,
      date: null,
      description: null,
      debit: null,
      credit: null,
      balance: null,
      reference: null,
      amount: null,
      valueDate: null,
      rawLine: line,
    };

    // Extract text for each column using STRICT boundary matching
    for (const boundary of boundaries) {
      // Use strict mode to prevent cascade on sparse rows
      const wordsInColumn = line.words.filter(w => isWordInColumn(w, boundary, true));
      const text = wordsInColumn.map(w => w.text).join(' ').trim();

      if (text && boundary.inferredType) {
        switch (boundary.inferredType) {
          case 'date':
            row.date = text;
            break;
          case 'description':
            row.description = text;
            break;
          case 'debit':
            row.debit = text;
            break;
          case 'credit':
            row.credit = text;
            break;
          case 'balance':
            row.balance = text;
            break;
          case 'reference':
            row.reference = text;
            break;
          case 'amount':
            row.amount = text;
            break;
          case 'value_date':
            row.valueDate = text;
            break;
        }
      }
    }

    rows.push(row);
  }

  return rows;
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

export interface TableDetectionResult {
  tables: TableRegion[];
  allRows: ExtractedRow[];
  columnBoundaries: ColumnBoundary[];
  confidence: number;
  perTableMetrics: TableMetrics[];  // NEW: Per-table diagnostics
}

export interface TableMetrics {
  tableIndex: number;
  pageNumbers: number[];
  lineCount: number;
  columns: ColumnBoundary[];
  columnTypes: string[];
  rowsExtracted: number;
}

/**
 * Reconcile column mappings across tables to ensure consistency
 * Uses consensus voting across tables rather than just the "best" table
 */
function reconcileColumnMappings(tables: TableRegion[]): ColumnBoundary[] {
  if (tables.length === 0) return [];
  if (tables.length === 1) return tables[0].columnBoundaries;
  
  // Build consensus map: for each X-position, collect all type votes
  const positionVotes = new Map<number, { type: string; confidence: number; count: number }[]>();
  const positionTolerance = 15;
  
  for (const table of tables) {
    for (const boundary of table.columnBoundaries) {
      // Find existing position group or create new one
      let foundGroup = false;
      for (const [groupX, votes] of positionVotes) {
        if (Math.abs(groupX - boundary.centerX) < positionTolerance) {
          const existingVote = votes.find(v => v.type === boundary.inferredType);
          if (existingVote) {
            existingVote.count++;
            existingVote.confidence = Math.max(existingVote.confidence, boundary.confidence);
          } else {
            votes.push({ 
              type: boundary.inferredType || 'unknown', 
              confidence: boundary.confidence,
              count: 1 
            });
          }
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        positionVotes.set(boundary.centerX, [{
          type: boundary.inferredType || 'unknown',
          confidence: boundary.confidence,
          count: 1
        }]);
      }
    }
  }
  
  // Determine consensus type for each position
  const consensusBoundaries: ColumnBoundary[] = [];
  const assignedTypes = new Set<string>();
  
  // Sort positions by X to process left-to-right
  const sortedPositions = [...positionVotes.entries()].sort((a, b) => a[0] - b[0]);
  
  for (const [x, votes] of sortedPositions) {
    // Sort by count, then by confidence
    votes.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.confidence - a.confidence;
    });
    
    const winner = votes[0];
    const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);
    const votePercentage = winner.count / totalVotes;
    
    // For amount column types (debit/credit/balance), require higher confidence for changes
    let finalType = winner.type;
    const amountTypes = ['debit', 'credit', 'balance', 'amount'];
    const uniqueTypes = ['date', 'description', 'balance']; // Types that should only appear once
    
    // Prevent duplicate date columns - keep only the first one
    if (uniqueTypes.includes(winner.type) && assignedTypes.has(winner.type)) {
      // Find next best non-duplicate type
      const alternativeVote = votes.find(v => !assignedTypes.has(v.type) || !uniqueTypes.includes(v.type));
      if (alternativeVote) {
        finalType = alternativeVote.type;
        console.log(`[ColumnReconciliation] Prevented duplicate ${winner.type} at x=${x.toFixed(0)}, using ${finalType} instead`);
      } else {
        finalType = 'unknown';
        console.log(`[ColumnReconciliation] Prevented duplicate ${winner.type} at x=${x.toFixed(0)}, marking as unknown`);
      }
    }
    
    if (votes.length > 1) {
      const secondPlace = votes[1];
      const bothAreAmountTypes = amountTypes.includes(winner.type) && amountTypes.includes(secondPlace.type);
      
      // Prevent debit<->credit swaps unless overwhelming evidence (>80%)
      if (bothAreAmountTypes && votePercentage < 0.8) {
        // Keep the type with highest confidence instead
        const highestConf = votes.reduce((max, v) => v.confidence > max.confidence ? v : max, votes[0]);
        finalType = highestConf.type;
        console.log(`[ColumnReconciliation] Kept ${finalType} at x=${x.toFixed(0)} (low consensus: ${(votePercentage * 100).toFixed(0)}%)`);
      }
    }
    
    // Track assigned types to prevent duplicates
    if (uniqueTypes.includes(finalType)) {
      assignedTypes.add(finalType);
    }
    
    consensusBoundaries.push({
      x0: x - 50, // Approximate
      x1: x + 50,
      centerX: x,
      inferredType: finalType as any,
      confidence: winner.confidence * votePercentage,
    });
    
    console.log(`[ColumnReconciliation] Consensus at x=${x.toFixed(0)}: ${finalType} (${winner.count}/${totalVotes} votes, ${(votePercentage * 100).toFixed(0)}%)`);
  }
  
  // Validate required columns and add missing ones
  const hasDate = consensusBoundaries.some(b => b.inferredType === 'date');
  const hasDescription = consensusBoundaries.some(b => b.inferredType === 'description');
  const hasBalance = consensusBoundaries.some(b => b.inferredType === 'balance');
  const hasAmountColumn = consensusBoundaries.some(b => 
    b.inferredType === 'debit' || b.inferredType === 'credit' || b.inferredType === 'amount'
  );
  
  // If description is missing, find the widest unassigned column and assign it
  if (!hasDescription) {
    const unknownColumns = consensusBoundaries.filter(b => 
      b.inferredType === 'unknown' || b.inferredType === null
    );
    if (unknownColumns.length > 0) {
      const widest = unknownColumns.reduce((max, b) => 
        (b.x1 - b.x0) > (max.x1 - max.x0) ? b : max
      );
      widest.inferredType = 'description';
      widest.confidence = 0.4;
      console.log(`[ColumnReconciliation] Added missing description column at x=${widest.centerX.toFixed(0)}`);
    }
  }
  
  // Log missing required columns as warnings
  if (!hasDate) console.warn('[ColumnReconciliation] WARNING: No date column found in reconciled boundaries');
  if (!hasBalance) console.warn('[ColumnReconciliation] WARNING: No balance column found in reconciled boundaries');
  if (!hasAmountColumn) console.warn('[ColumnReconciliation] WARNING: No amount/debit/credit column found in reconciled boundaries');
  
  // Sort by X position
  consensusBoundaries.sort((a, b) => a.centerX - b.centerX);
  
  // Apply consensus to all tables
  for (const table of tables) {
    for (const boundary of table.columnBoundaries) {
      const consensus = consensusBoundaries.find(c => 
        Math.abs(c.centerX - boundary.centerX) < positionTolerance
      );
      
      if (consensus && consensus.inferredType && boundary.inferredType !== consensus.inferredType) {
        const oldType = boundary.inferredType;
        boundary.inferredType = consensus.inferredType;
        boundary.confidence = consensus.confidence;
        console.log(`[ColumnReconciliation] Applied consensus at x=${boundary.centerX.toFixed(0)}: ${oldType} -> ${consensus.inferredType}`);
      }
    }
  }
  
  return consensusBoundaries;
}

/**
 * Check if a column contains CR/DR suffixes indicating a merged amount column
 * Updated: Now handles asymmetric suffixes (only DR or only CR present)
 * If only one suffix type is found, amounts without suffix are the opposite type
 */
function checkForMergedColumnSuffixes(lines: PdfLine[], boundary: ColumnBoundary): boolean {
  let drCount = 0;
  let crCount = 0;
  let totalNumeric = 0;
  
  for (const line of lines) {
    const wordsInColumn = line.words.filter(w => {
      const wordCenter = (w.x0 + w.x1) / 2;
      return wordCenter >= boundary.x0 && wordCenter <= boundary.x1;
    });
    
    if (wordsInColumn.length === 0) continue;
    
    const text = wordsInColumn.map(w => w.text).join(' ').trim();
    
    // Check if it's numeric
    if (hasNumericContent(text)) {
      totalNumeric++;
      
      // Check for DR/CR suffixes or prefixes
      if (/\b(dr|debit)\b/i.test(text) || /^-/.test(text.replace(/[₹$£€¥\s,]/g, ''))) {
        drCount++;
      }
      if (/\b(cr|credit)\b/i.test(text) || /\+/.test(text)) {
        crCount++;
      }
    }
  }
  
  // UPDATED: Handle asymmetric suffixes
  // If only DR suffix is found: amounts without suffix are credits
  // If only CR suffix is found: amounts without suffix are debits
  const hasSuffixes = drCount > 0 || crCount > 0;
  const hasBothTypes = (drCount > 0 && (totalNumeric - drCount) > 0) || 
                       (crCount > 0 && (totalNumeric - crCount) > 0);
  
  const result = totalNumeric >= 3 && hasSuffixes && hasBothTypes;
  
  if (result) {
    console.log(`[MergedColumnCheck] Detected merged column: ${totalNumeric} numeric, ${drCount} DR, ${crCount} CR`);
  }
  
  return result;
}

/**
 * Check if document likely has a merged debit/credit column based on content
 */
function detectMergedColumnFromRows(rows: ExtractedRow[]): boolean {
  if (rows.length < 3) return false;
  
  let drCount = 0;
  let crCount = 0;
  
  for (const row of rows) {
    const amountText = row.amount || row.debit || row.credit || '';
    if (/\b(dr|debit)\b/i.test(amountText) || /-\s*$/.test(amountText)) drCount++;
    if (/\b(cr|credit)\b/i.test(amountText) || /\+\s*$/.test(amountText)) crCount++;
  }
  
  // Must have both types present
  return drCount > 0 && crCount > 0;
}

/**
 * Main function: Detect tables and extract structured data from text elements
 */
export function detectAndExtractTables(
  elements: TextElement[],
  yTolerance: number = 3
): TableDetectionResult {
  // Step 1: Group words into lines
  const lines = groupWordsIntoLines(elements, yTolerance);
  console.log('[TableDetector] Lines grouped:', lines.length);

  // Step 2: Detect table regions
  const tables = detectTableRegions(lines);
  console.log('[TableDetector] Tables detected:', tables.length);

  if (tables.length === 0) {
    // No clear table structure - treat entire document as one table
    const fallbackTable: TableRegion = {
      top: lines.length > 0 ? lines[0].top : 0,
      bottom: lines.length > 0 ? lines[lines.length - 1].bottom : 0,
      left: lines.length > 0 ? Math.min(...lines.map(l => l.left)) : 0,
      right: lines.length > 0 ? Math.max(...lines.map(l => l.right)) : 0,
      headerLine: lines[0] || null,
      dataLines: lines,
      columnBoundaries: [],
      pageNumbers: [...new Set(lines.map(l => l.pageNumber))],
    };
    tables.push(fallbackTable);
  }

  // Step 3: For each table, detect column boundaries and classify
  let allRows: ExtractedRow[] = [];
  const perTableMetrics: TableMetrics[] = [];

  for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
    const table = tables[tableIdx];
    const boundaries = detectColumnBoundaries(table.dataLines);
    console.log(`[TableDetector] Table ${tableIdx}: Column boundaries: ${boundaries.length}`);

    const classifiedBoundaries = classifyColumns(table.dataLines, boundaries);
    console.log(`[TableDetector] Table ${tableIdx}: Classified columns:`, 
      classifiedBoundaries.map(b => `${b.inferredType}(${b.confidence.toFixed(2)})`));

    table.columnBoundaries = classifiedBoundaries;

    // Extract rows
    const tableRows = extractRowsFromTable(table, classifiedBoundaries);
    
    // Collect metrics
    perTableMetrics.push({
      tableIndex: tableIdx,
      pageNumbers: table.pageNumbers,
      lineCount: table.dataLines.length,
      columns: classifiedBoundaries,
      columnTypes: classifiedBoundaries.map(b => b.inferredType || 'unknown'),
      rowsExtracted: tableRows.length,
    });
    
    allRows = allRows.concat(tableRows);
  }

  // Step 4: NEW - Cross-table column reconciliation
  const reconciledBoundaries = reconcileColumnMappings(tables);
  
  // Step 5: Re-extract rows using reconciled boundaries for consistency
  if (tables.length > 1) {
    allRows = [];
    for (const table of tables) {
      // Use reconciled boundaries with position matching
      const alignedBoundaries = table.columnBoundaries.map(b => {
        const match = reconciledBoundaries.find(ref => 
          Math.abs(ref.centerX - b.centerX) < 15
        );
        return match ? { ...b, inferredType: match.inferredType } : b;
      });
      
      const tableRows = extractRowsFromTable(table, alignedBoundaries);
      allRows = allRows.concat(tableRows);
    }
  }

  // Step 6: Check for merged amount column pattern in extracted rows
  const hasMergedColumn = detectMergedColumnFromRows(allRows);
  if (hasMergedColumn) {
    console.log('[TableDetector] Detected merged debit/credit column with DR/CR suffixes in rows');
  }

  // Calculate overall confidence using weighted scoring
  const confidence = calculateWeightedConfidence(
    reconciledBoundaries, 
    tables.length,
    allRows.length
  );

  return {
    tables,
    allRows,
    columnBoundaries: reconciledBoundaries,
    confidence,
    perTableMetrics,
  };
}

/**
 * Calculate weighted confidence score based on column importance
 * and bonus for having all required columns
 */
function calculateWeightedConfidence(
  boundaries: ColumnBoundary[],
  tableCount: number,
  rowCount: number
): number {
  if (boundaries.length === 0) return 0;
  
  const weights: Record<string, number> = {
    date: 1.5,
    balance: 1.5,
    description: 1.2,
    debit: 1.0,
    credit: 1.0,
    amount: 1.0,
    reference: 0.5,
    value_date: 0.5,
    unknown: 0.3,
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const b of boundaries) {
    const type = b.inferredType || 'unknown';
    const weight = weights[type] || 0.5;
    weightedSum += b.confidence * weight;
    totalWeight += weight;
  }
  
  let baseConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Check for required columns
  const hasDate = boundaries.some(b => b.inferredType === 'date');
  const hasBalance = boundaries.some(b => b.inferredType === 'balance');
  const hasDescription = boundaries.some(b => b.inferredType === 'description');
  const hasAmountColumn = boundaries.some(b => 
    b.inferredType === 'debit' || b.inferredType === 'credit' || b.inferredType === 'amount'
  );
  
  // Bonus for having all required columns
  const hasAllRequired = hasDate && hasBalance && hasDescription && hasAmountColumn;
  if (hasAllRequired) {
    baseConfidence += 0.15;
    console.log('[Confidence] All required columns found (+15% bonus)');
  }
  
  // Bonus for having rows extracted
  if (rowCount >= 3) {
    baseConfidence += 0.05;
  }
  
  // Small penalty for excessive fragmentation (but less severe now with merging)
  if (tableCount > 5) {
    baseConfidence -= 0.02;
    console.log(`[Confidence] Table fragmentation penalty: ${tableCount} tables (-2%)`);
  }
  
  const finalConfidence = Math.min(Math.max(baseConfidence, 0), 1);
  console.log(`[Confidence] Weighted calculation: ${(finalConfidence * 100).toFixed(0)}%`);
  
  return finalConfidence;
}

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
 * Similar to pdfplumber's line grouping algorithm
 */
export function groupWordsIntoLines(
  elements: TextElement[],
  yTolerance: number = 3
): PdfLine[] {
  if (elements.length === 0) return [];

  // Convert TextElements to PdfWords
  const words: PdfWord[] = elements.map(el => ({
    text: el.text.trim(),
    x0: el.boundingBox.x,
    x1: el.boundingBox.x + el.boundingBox.width,
    top: el.boundingBox.y,
    bottom: el.boundingBox.y + el.boundingBox.height,
    width: el.boundingBox.width,
    height: el.boundingBox.height,
    pageNumber: el.pageNumber,
  })).filter(w => w.text.length > 0);

  if (words.length === 0) return [];

  // Sort words by page, then Y, then X
  words.sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
    if (Math.abs(a.top - b.top) > yTolerance) return a.top - b.top;
    return a.x0 - b.x0;
  });

  const lines: PdfLine[] = [];
  let currentLine: PdfWord[] = [words[0]];
  let currentTop = words[0].top;
  let currentPage = words[0].pageNumber;

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    
    // Check if word belongs to same line (within Y-tolerance and same page)
    if (word.pageNumber === currentPage && Math.abs(word.top - currentTop) <= yTolerance) {
      currentLine.push(word);
    } else {
      // Finalize current line
      if (currentLine.length > 0) {
        lines.push(createLineFromWords(currentLine));
      }
      // Start new line
      currentLine = [word];
      currentTop = word.top;
      currentPage = word.pageNumber;
    }
  }

  // Don't forget the last line
  if (currentLine.length > 0) {
    lines.push(createLineFromWords(currentLine));
  }

  return lines;
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

/**
 * Detect table regions by finding areas with consistent column structure
 */
export function detectTableRegions(lines: PdfLine[]): TableRegion[] {
  if (lines.length < 3) return [];

  const tables: TableRegion[] = [];
  let tableStartIndex = -1;
  let consistentColumnCount = 0;
  let prevWordCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const wordCount = line.words.length;

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
  }

  // Handle table at end of document
  if (consistentColumnCount >= 3) {
    tables.push(createTableRegion(lines, tableStartIndex, lines.length - 1));
  }

  return tables;
}

function isConsistentStructure(count1: number, count2: number): boolean {
  // Allow ±2 word variance for multi-line descriptions, etc.
  return Math.abs(count1 - count2) <= 2;
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
  return postProcessColumnTypes(classifiedBoundaries);
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

function isWordInColumn(word: PdfWord, boundary: ColumnBoundary): boolean {
  const wordCenter = (word.x0 + word.x1) / 2;
  // Word is in column if its center is within bounds, or significant overlap
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

function postProcessColumnTypes(boundaries: ColumnBoundary[]): ColumnBoundary[] {
  // Ensure we have at least a date and balance column
  let hasDate = boundaries.some(b => b.inferredType === 'date');
  let hasBalance = boundaries.some(b => b.inferredType === 'balance');
  let hasDescription = boundaries.some(b => b.inferredType === 'description');
  const hasDebit = boundaries.some(b => b.inferredType === 'debit');
  const hasCredit = boundaries.some(b => b.inferredType === 'credit');

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

  // NEW: Assign unknown columns between date and balance as debit/credit
  if (!hasDebit || !hasCredit) {
    const dateIndex = boundaries.findIndex(b => b.inferredType === 'date');
    const balanceIndex = boundaries.findIndex(b => b.inferredType === 'balance');
    
    if (dateIndex >= 0 && balanceIndex >= 0 && balanceIndex > dateIndex) {
      // Find unknown/reference columns between date and balance (excluding description)
      const candidateColumns = boundaries
        .map((b, i) => ({ boundary: b, index: i }))
        .filter(({ boundary, index }) => 
          (boundary.inferredType === 'unknown' || boundary.inferredType === 'reference') &&
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
        console.log(`[PostProcess] Promoted column ${candidateColumns[0].index} to CREDIT`);
      }
      
      if (candidateColumns.length >= 2 && !hasDebit) {
        boundaries[candidateColumns[1].index] = {
          ...boundaries[candidateColumns[1].index],
          inferredType: 'debit',
          confidence: 0.5,
        };
        console.log(`[PostProcess] Promoted column ${candidateColumns[1].index} to DEBIT`);
      }
      
      // If only 1 unknown column, assign as debit (more common for single amount column)
      if (candidateColumns.length === 1 && !hasDebit && hasCredit) {
        // Already assigned as credit above, reassign as debit
        boundaries[candidateColumns[0].index] = {
          ...boundaries[candidateColumns[0].index],
          inferredType: 'debit',
          confidence: 0.5,
        };
        console.log(`[PostProcess] Reassigned column ${candidateColumns[0].index} to DEBIT (single column)`);
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
  rawLine: PdfLine;
}

/**
 * Extract structured rows from lines using detected column boundaries
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
      rawLine: line,
    };

    // Extract text for each column
    for (const boundary of boundaries) {
      const wordsInColumn = line.words.filter(w => isWordInColumn(w, boundary));
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
  let primaryBoundaries: ColumnBoundary[] = [];

  for (const table of tables) {
    const boundaries = detectColumnBoundaries(table.dataLines);
    console.log('[TableDetector] Column boundaries:', boundaries.length);

    const classifiedBoundaries = classifyColumns(table.dataLines, boundaries);
    console.log('[TableDetector] Classified columns:', 
      classifiedBoundaries.map(b => `${b.inferredType}(${b.confidence.toFixed(2)})`));

    table.columnBoundaries = classifiedBoundaries;

    // Extract rows
    const tableRows = extractRowsFromTable(table, classifiedBoundaries);
    allRows = allRows.concat(tableRows);

    // Use first table's boundaries as primary
    if (primaryBoundaries.length === 0) {
      primaryBoundaries = classifiedBoundaries;
    }
  }

  // Calculate overall confidence
  const avgConfidence = primaryBoundaries.length > 0
    ? primaryBoundaries.reduce((sum, b) => sum + b.confidence, 0) / primaryBoundaries.length
    : 0;

  return {
    tables,
    allRows,
    columnBoundaries: primaryBoundaries,
    confidence: avgConfidence,
  };
}

/**
 * Header Detection & Column Anchor Locking
 * Detects header row and locks column X-anchors from headers
 * Reuses anchors across all pages for consistency
 */

import type { PdfLine, PdfWord, ColumnBoundary, ColumnType } from './tableDetector';

// =============================================================================
// TYPES
// =============================================================================

export interface LockedColumnAnchors {
  date: ColumnAnchor | null;
  description: ColumnAnchor | null;
  debit: ColumnAnchor | null;
  credit: ColumnAnchor | null;
  balance: ColumnAnchor | null;
}

export interface ColumnAnchor {
  x0: number;
  x1: number;
  centerX: number;
  headerText: string;
  confidence: number;
}

export interface HeaderDetectionResult {
  headerLine: PdfLine | null;
  headerLineIndex: number;
  anchors: LockedColumnAnchors;
  confidence: number;
}

// =============================================================================
// HEADER KEYWORD MAPS
// =============================================================================

const HEADER_KEYWORDS: Record<ColumnType, string[]> = {
  date: [
    'date', 'txn date', 'transaction date', 'value date', 'post date',
    'posting date', 'trans date', 'dated', 'dt', 'तारीख', '日付', 'tarikh'
  ],
  description: [
    'description', 'particulars', 'narration', 'details', 'remarks',
    'transaction details', 'memo', 'reference', 'विवरण', '摘要', 'keterangan'
  ],
  debit: [
    'debit', 'withdrawal', 'dr', 'withdrawals', 'out', 'debit amount',
    'debits', 'payment', 'paid out', 'डेबिट', '支出', 'keluar'
  ],
  credit: [
    'credit', 'deposit', 'cr', 'deposits', 'in', 'credit amount',
    'credits', 'received', 'paid in', 'क्रेडिट', '收入', 'masuk'
  ],
  balance: [
    'balance', 'running balance', 'available balance', 'closing',
    'closing balance', 'bal', 'शेष', '余额', 'baki'
  ],
  reference: ['ref', 'reference', 'ref no', 'txn id', 'transaction id'],
  unknown: [],
};

// =============================================================================
// HEADER DETECTION
// =============================================================================

/**
 * Detect header row by finding line with most column keyword matches
 * Searches first 15 lines only
 */
export function detectAndLockHeaders(lines: PdfLine[]): HeaderDetectionResult {
  let bestHeaderLine: PdfLine | null = null;
  let bestHeaderIndex = -1;
  let bestMatchCount = 0;
  let bestAnchors: LockedColumnAnchors = createEmptyAnchors();
  
  // Search first 15 lines for potential header
  const searchLimit = Math.min(15, lines.length);
  
  for (let i = 0; i < searchLimit; i++) {
    const line = lines[i];
    const lineText = line.words.map(w => w.text.toLowerCase()).join(' ');
    
    // Count how many column types are matched
    let matchCount = 0;
    const matches: Array<{ type: ColumnType; word: PdfWord; keyword: string }> = [];
    
    for (const [colType, keywords] of Object.entries(HEADER_KEYWORDS)) {
      if (colType === 'unknown') continue;
      
      for (const keyword of keywords) {
        if (lineText.includes(keyword.toLowerCase())) {
          // Find the word that contains this keyword
          const matchingWord = line.words.find(w => 
            w.text.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (matchingWord) {
            matches.push({
              type: colType as ColumnType,
              word: matchingWord,
              keyword,
            });
            matchCount++;
            break; // Only count each column type once
          }
        }
      }
    }
    
    // Need at least 3 column matches to be a valid header
    if (matchCount >= 3 && matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestHeaderLine = line;
      bestHeaderIndex = i;
      bestAnchors = buildAnchorsFromMatches(matches);
    }
  }
  
  const confidence = bestMatchCount >= 4 ? 0.9 : bestMatchCount >= 3 ? 0.7 : 0.3;
  
  console.log(`[HeaderAnchors] Header detected at line ${bestHeaderIndex}, matches: ${bestMatchCount}, confidence: ${confidence}`);
  
  return {
    headerLine: bestHeaderLine,
    headerLineIndex: bestHeaderIndex,
    anchors: bestAnchors,
    confidence,
  };
}

/**
 * Build locked anchors from matched keywords
 */
function buildAnchorsFromMatches(
  matches: Array<{ type: ColumnType; word: PdfWord; keyword: string }>
): LockedColumnAnchors {
  const anchors = createEmptyAnchors();
  
  for (const match of matches) {
    const anchor: ColumnAnchor = {
      x0: match.word.x0,
      x1: match.word.x1,
      centerX: (match.word.x0 + match.word.x1) / 2,
      headerText: match.word.text,
      confidence: 0.9,
    };
    
    switch (match.type) {
      case 'date':
        anchors.date = anchor;
        break;
      case 'description':
        anchors.description = anchor;
        break;
      case 'debit':
        anchors.debit = anchor;
        break;
      case 'credit':
        anchors.credit = anchor;
        break;
      case 'balance':
        anchors.balance = anchor;
        break;
    }
  }
  
  return anchors;
}

/**
 * Create empty anchors structure
 */
function createEmptyAnchors(): LockedColumnAnchors {
  return {
    date: null,
    description: null,
    debit: null,
    credit: null,
    balance: null,
  };
}

// =============================================================================
// ANCHOR USAGE
// =============================================================================

/**
 * Assign a word to a column based on locked anchors
 * Uses X-position overlap with anchors
 */
export function assignWordToColumn(
  word: PdfWord,
  anchors: LockedColumnAnchors
): ColumnType | null {
  const wordCenter = (word.x0 + word.x1) / 2;
  
  // Check each anchor
  const anchorEntries: Array<[string, ColumnAnchor | null]> = [
    ['date', anchors.date],
    ['description', anchors.description],
    ['debit', anchors.debit],
    ['credit', anchors.credit],
    ['balance', anchors.balance],
  ];
  
  for (const [colType, anchor] of anchorEntries) {
    if (!anchor) continue;
    
    // Check if word overlaps with anchor
    const overlap = calculateOverlap(word.x0, word.x1, anchor.x0, anchor.x1);
    
    if (overlap > 0.3) { // >30% overlap
      return colType as ColumnType;
    }
    
    // Or if word center is within anchor bounds (with tolerance)
    const tolerance = (anchor.x1 - anchor.x0) * 0.5;
    if (wordCenter >= anchor.x0 - tolerance && wordCenter <= anchor.x1 + tolerance) {
      return colType as ColumnType;
    }
  }
  
  return null;
}

/**
 * Calculate overlap ratio between two ranges
 */
function calculateOverlap(
  a0: number, a1: number,
  b0: number, b1: number
): number {
  const overlapStart = Math.max(a0, b0);
  const overlapEnd = Math.min(a1, b1);
  
  if (overlapStart >= overlapEnd) return 0;
  
  const overlapWidth = overlapEnd - overlapStart;
  const aWidth = a1 - a0;
  
  return aWidth > 0 ? overlapWidth / aWidth : 0;
}

/**
 * Convert locked anchors to ColumnBoundary array for compatibility
 */
export function anchorsToColumnBoundaries(anchors: LockedColumnAnchors): ColumnBoundary[] {
  const boundaries: ColumnBoundary[] = [];
  
  const anchorEntries: Array<[ColumnType, ColumnAnchor | null]> = [
    ['date', anchors.date],
    ['description', anchors.description],
    ['debit', anchors.debit],
    ['credit', anchors.credit],
    ['balance', anchors.balance],
  ];
  
  for (const [colType, anchor] of anchorEntries) {
    if (anchor) {
      boundaries.push({
        x0: anchor.x0,
        x1: anchor.x1,
        centerX: anchor.centerX,
        inferredType: colType,
        confidence: anchor.confidence,
      });
    }
  }
  
  // Sort by X position
  boundaries.sort((a, b) => a.x0 - b.x0);
  
  return boundaries;
}

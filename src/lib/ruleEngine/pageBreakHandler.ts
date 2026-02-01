/**
 * Cross-Page Transaction Stitching Handler
 * Detects and merges transactions that span across PDF page boundaries
 * 
 * Problem: Long transaction descriptions may be split across page breaks
 * Solution: Detect continuation lines and merge them with previous transaction
 */

import type { PdfLine, PdfWord } from './tableDetector';
import type { LockedColumnAnchors } from './headerAnchors';

// =============================================================================
// TYPES
// =============================================================================

export interface PageBoundaryContext {
  previousPageLastRow: PdfLine | null;
  currentPageFirstRow: PdfLine | null;
  shouldStitch: boolean;
  stitchReason?: string;
}

export interface StitchedPageResult {
  stitchedLines: PdfLine[];
  stitchCount: number;
  stitchLocations: Array<{ fromPage: number; toPage: number; lineIndex: number }>;
}

// =============================================================================
// CONTINUATION DETECTION
// =============================================================================

/**
 * Date-like patterns to detect if a line starts with a date
 */
const DATE_START_PATTERNS = [
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/,     // DD/MM/YYYY, MM/DD/YYYY
  /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/,        // YYYY-MM-DD
  /^\d{1,2}\s+[A-Za-z]{3}/,                       // 15 Jan
  /^[A-Za-z]{3}\s+\d{1,2}/,                       // Jan 15
  /^\d{1,2}(?:st|nd|rd|th)\s+[A-Za-z]/,          // 15th Jan
];

/**
 * Monetary amount patterns to detect if a line contains transaction amounts
 */
const AMOUNT_PATTERNS = [
  /[₹$£€¥]\s*[\d,]+\.\d{2}/,                     // Currency symbol + amount
  /[\d,]+\.\d{2}\s*(?:CR|DR|Cr|Dr)/i,            // Amount with CR/DR suffix
  /(?:^|\s)[\d,]{1,12}\.\d{2}(?:\s|$)/,          // Standalone amount
];

/**
 * Check if a line contains a valid date at the start
 */
function lineStartsWithDate(line: PdfLine): boolean {
  if (line.words.length === 0) return false;
  
  // Check first 1-3 words for date pattern
  const firstWords = line.words.slice(0, 3).map(w => w.text).join(' ');
  return DATE_START_PATTERNS.some(pattern => pattern.test(firstWords));
}

/**
 * Check if a line contains monetary amounts
 */
function lineHasMonetaryAmount(line: PdfLine): boolean {
  const lineText = line.words.map(w => w.text).join(' ');
  return AMOUNT_PATTERNS.some(pattern => pattern.test(lineText));
}

/**
 * Check if a line is likely a continuation of a previous transaction
 * Criteria:
 * 1. No date at start
 * 2. No monetary amounts
 * 3. Looks like description text
 */
export function isContinuationLine(line: PdfLine): boolean {
  if (line.words.length === 0) return false;
  
  const hasDate = lineStartsWithDate(line);
  const hasAmount = lineHasMonetaryAmount(line);
  
  // Continuation lines have no date and no amounts
  if (hasDate || hasAmount) return false;
  
  // Check if it looks like description text (at least 2 chars)
  const totalTextLength = line.words.reduce((sum, w) => sum + w.text.length, 0);
  if (totalTextLength < 2) return false;
  
  // Additional check: continuation lines typically start with lowercase or continuing words
  const firstWord = line.words[0].text;
  const isLowercase = /^[a-z]/.test(firstWord);
  const isCommonContinuation = /^(and|or|for|to|from|by|with|in|at|the|of|on)/i.test(firstWord);
  const isPartialWord = firstWord.length < 3 && /^[a-z]+$/i.test(firstWord);
  
  // Consider it a continuation if it lacks date/amount AND has continuation indicators
  return !hasDate && !hasAmount;
}

/**
 * Check if a line is incomplete (missing expected transaction elements)
 * An incomplete line might have date/description but no balance
 */
function isIncompleteTransaction(line: PdfLine, anchors: LockedColumnAnchors): boolean {
  if (!anchors.balance) return false;
  
  // Check if any word falls within balance column
  const balanceX0 = anchors.balance.x0 - 15;
  const balanceX1 = anchors.balance.x1 + 15;
  
  const hasBalanceWord = line.words.some(w => {
    const wordCenter = (w.x0 + w.x1) / 2;
    return wordCenter >= balanceX0 && wordCenter <= balanceX1;
  });
  
  // Has date but no balance = potentially incomplete
  const hasDate = lineStartsWithDate(line);
  return hasDate && !hasBalanceWord;
}

// =============================================================================
// PAGE BOUNDARY DETECTION
// =============================================================================

/**
 * Detect if a page break occurs in the middle of a transaction
 */
export function detectPageBreakContinuation(
  previousPageLines: PdfLine[],
  currentPageLines: PdfLine[],
  anchors: LockedColumnAnchors
): PageBoundaryContext {
  if (previousPageLines.length === 0 || currentPageLines.length === 0) {
    return {
      previousPageLastRow: null,
      currentPageFirstRow: null,
      shouldStitch: false,
    };
  }
  
  const lastRow = previousPageLines[previousPageLines.length - 1];
  const firstRow = currentPageLines[0];
  
  // Check if first row of new page is a continuation
  if (isContinuationLine(firstRow)) {
    return {
      previousPageLastRow: lastRow,
      currentPageFirstRow: firstRow,
      shouldStitch: true,
      stitchReason: 'First row of new page has no date or amounts',
    };
  }
  
  // Check if last row of previous page is incomplete
  if (isIncompleteTransaction(lastRow, anchors)) {
    return {
      previousPageLastRow: lastRow,
      currentPageFirstRow: firstRow,
      shouldStitch: true,
      stitchReason: 'Last row of previous page missing balance column',
    };
  }
  
  return {
    previousPageLastRow: lastRow,
    currentPageFirstRow: firstRow,
    shouldStitch: false,
  };
}

// =============================================================================
// CROSS-PAGE STITCHING
// =============================================================================

/**
 * Merge two lines into one, combining their words
 */
function mergeLines(line1: PdfLine, line2: PdfLine): PdfLine {
  const allWords = [...line1.words, ...line2.words];
  
  // Sort words by X position
  allWords.sort((a, b) => a.x0 - b.x0);
  
  return {
    words: allWords,
    top: Math.min(line1.top, line2.top),
    bottom: Math.max(line1.bottom, line2.bottom),
    left: Math.min(line1.left, line2.left),
    right: Math.max(line1.right, line2.right),
    pageNumber: line1.pageNumber, // Keep first page number
  };
}

/**
 * Process lines across multiple pages and stitch continuations
 */
export function stitchLinesAcrossPages(
  pageLines: PdfLine[][],
  anchors: LockedColumnAnchors
): StitchedPageResult {
  if (pageLines.length === 0) {
    return { stitchedLines: [], stitchCount: 0, stitchLocations: [] };
  }
  
  const result: PdfLine[] = [];
  const stitchLocations: Array<{ fromPage: number; toPage: number; lineIndex: number }> = [];
  let stitchCount = 0;
  
  // Process first page as-is
  for (const line of pageLines[0]) {
    result.push(line);
  }
  
  // Process subsequent pages with cross-page detection
  for (let pageIdx = 1; pageIdx < pageLines.length; pageIdx++) {
    const previousPageLines = pageLines[pageIdx - 1];
    const currentPageLines = pageLines[pageIdx];
    
    if (currentPageLines.length === 0) continue;
    
    const context = detectPageBreakContinuation(
      previousPageLines,
      currentPageLines,
      anchors
    );
    
    if (context.shouldStitch && result.length > 0) {
      // Merge first line of current page with last line in result
      const lastResultIndex = result.length - 1;
      const mergedLine = mergeLines(result[lastResultIndex], currentPageLines[0]);
      result[lastResultIndex] = mergedLine;
      
      stitchCount++;
      stitchLocations.push({
        fromPage: pageIdx,
        toPage: pageIdx + 1,
        lineIndex: lastResultIndex,
      });
      
      console.log(`[PageBreakHandler] Stitched line across page ${pageIdx}->${pageIdx + 1}: "${context.stitchReason}"`);
      
      // Add remaining lines from current page
      for (let i = 1; i < currentPageLines.length; i++) {
        result.push(currentPageLines[i]);
      }
    } else {
      // No stitching needed, add all lines
      for (const line of currentPageLines) {
        result.push(line);
      }
    }
  }
  
  return {
    stitchedLines: result,
    stitchCount,
    stitchLocations,
  };
}

/**
 * Simple helper to check if a row should merge with the previous one
 * Used by dynamicRowProcessor for within-page stitching
 */
export function shouldMergeAcrossPageBreak(
  previousLine: PdfLine | null,
  currentLine: PdfLine
): boolean {
  if (!previousLine) return false;
  
  // Different pages AND current line is continuation
  if (previousLine.pageNumber !== currentLine.pageNumber) {
    return isContinuationLine(currentLine);
  }
  
  return false;
}

/**
 * Dynamic Row Processing Engine
 * Converts detected table rows to transactions without bank profile templates
 */

import type { RawTransaction, ParsedTransaction, TextElement, ColumnType } from './types';
import type { ExtractedRow, ColumnBoundary, PdfLine } from './tableDetector';

// =============================================================================
// DATE VALIDATION PATTERNS
// =============================================================================

const DATE_VALIDATION_PATTERNS = [
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,
  /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,
  /^\d{1,2}\s+[A-Za-z]{3,9}(\s+\d{2,4})?$/,
  /^[A-Za-z]{3,9}\s+\d{1,2}(,?\s+\d{2,4})?$/,
  /^\d{1,2}[\/\-]\d{1,2}$/,
];

// =============================================================================
// ROW TYPE DETECTION
// =============================================================================

export interface RowClassification {
  isTransaction: boolean;
  isContinuation: boolean;
  isHeader: boolean;
  isFooter: boolean;
  isOpeningBalance: boolean;
  isClosingBalance: boolean;
}

const SKIP_PATTERNS = [
  /^page\s*\d+/i,
  /^continued/i,
  /brought\s*forward/i,
  /carried\s*forward/i,
  /^total[s]?\s*$/i,
  /statement\s*date/i,
  /account\s*(number|no\.?)/i,
  /^date\s+(description|particulars)/i,
];

const OPENING_BALANCE_PATTERNS = [
  /opening\s*balance/i,
  /brought\s*forward/i,
  /b\/f/i,
  /balance\s*b\/f/i,
  /previous\s*balance/i,
];

const CLOSING_BALANCE_PATTERNS = [
  /closing\s*balance/i,
  /carried\s*forward/i,
  /c\/f/i,
  /balance\s*c\/f/i,
  /ending\s*balance/i,
];

/**
 * Classify a row to determine its type
 */
export function classifyRow(row: ExtractedRow): RowClassification {
  const fullText = [row.date, row.description, row.debit, row.credit, row.balance]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Check for opening/closing balance
  const isOpeningBalance = OPENING_BALANCE_PATTERNS.some(p => p.test(fullText));
  const isClosingBalance = CLOSING_BALANCE_PATTERNS.some(p => p.test(fullText));

  // Check for skip patterns (headers/footers)
  const isSkip = SKIP_PATTERNS.some(p => p.test(fullText));

  // Check if it's a valid transaction (has date and at least one amount)
  const hasValidDate = row.date !== null && 
    DATE_VALIDATION_PATTERNS.some(p => p.test(row.date!));
  const hasAmount = row.debit !== null || row.credit !== null || row.balance !== null;
  const isTransaction = hasValidDate && hasAmount && !isSkip;

  // Continuation row: has description but no date or amounts
  const hasDescription = row.description !== null && row.description.trim().length > 2;
  const isContinuation = hasDescription && !hasValidDate && !hasAmount && !isSkip;

  return {
    isTransaction,
    isContinuation,
    isHeader: isSkip && !isOpeningBalance && !isClosingBalance,
    isFooter: isSkip && !isOpeningBalance && !isClosingBalance,
    isOpeningBalance,
    isClosingBalance,
  };
}

// =============================================================================
// MULTI-LINE STITCHING
// =============================================================================

export interface StitchedTransaction {
  primaryRow: ExtractedRow;
  continuationRows: ExtractedRow[];
  fullDescription: string;
  classification: RowClassification;
}

/**
 * Apply look-back stitching to merge continuation lines with parent transactions
 */
export function stitchContinuationRows(rows: ExtractedRow[]): StitchedTransaction[] {
  const stitched: StitchedTransaction[] = [];
  let currentTransaction: StitchedTransaction | null = null;

  for (const row of rows) {
    const classification = classifyRow(row);

    if (classification.isTransaction || classification.isOpeningBalance || classification.isClosingBalance) {
      // Save previous transaction
      if (currentTransaction) {
        stitched.push(finalizeStitchedTransaction(currentTransaction));
      }

      // Start new transaction
      currentTransaction = {
        primaryRow: row,
        continuationRows: [],
        fullDescription: row.description || '',
        classification,
      };
    } else if (classification.isContinuation && currentTransaction) {
      // Append to current transaction
      currentTransaction.continuationRows.push(row);
      if (row.description) {
        currentTransaction.fullDescription += ' ' + row.description;
      }
    }
    // Skip headers/footers
  }

  // Don't forget the last transaction
  if (currentTransaction) {
    stitched.push(finalizeStitchedTransaction(currentTransaction));
  }

  return stitched;
}

function finalizeStitchedTransaction(tx: StitchedTransaction): StitchedTransaction {
  return {
    ...tx,
    fullDescription: cleanDescription(tx.fullDescription),
  };
}

/**
 * Clean and normalize a description string
 */
function cleanDescription(description: string): string {
  return description
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/([,.\-:])\1+/g, '$1')
    .replace(/\s*[-–—]\s*/g, ' - ')
    .replace(/\(\s*\)/g, '')
    .replace(/REF\s*[:.]?\s*/gi, 'Ref: ')
    .replace(/\bTRF\b/gi, 'Transfer')
    .replace(/\bPYMT\b/gi, 'Payment')
    .replace(/\bDEP\b/gi, 'Deposit')
    .replace(/\bWDL\b/gi, 'Withdrawal')
    .replace(/\bCHQ\b/gi, 'Cheque');
}

// =============================================================================
// CONVERSION TO RAW TRANSACTIONS
// =============================================================================

/**
 * Convert stitched transactions to RawTransaction format for downstream processing
 */
export function convertToRawTransactions(
  stitchedTransactions: StitchedTransaction[]
): RawTransaction[] {
  return stitchedTransactions.map((tx, index) => {
    const row = tx.primaryRow;
    
    // Collect all text elements from primary and continuation rows
    const allElements: TextElement[] = [];
    
    // Convert PdfLine words back to TextElements
    const addLineElements = (line: PdfLine) => {
      for (const word of line.words) {
        allElements.push({
          text: word.text,
          boundingBox: {
            x: word.x0,
            y: word.top,
            width: word.width,
            height: word.height,
          },
          pageNumber: word.pageNumber,
          confidence: 1.0,
          source: 'text-layer',
        });
      }
    };

    addLineElements(row.rawLine);
    tx.continuationRows.forEach(cr => addLineElements(cr.rawLine));

    return {
      rowIndex: index,
      pageNumber: row.pageNumber,
      elements: allElements,
      rawDate: row.date || undefined,
      rawDescription: tx.fullDescription,
      rawDebit: row.debit || undefined,
      rawCredit: row.credit || undefined,
      rawBalance: row.balance || undefined,
    };
  });
}

// =============================================================================
// COLUMN ANCHORS CONVERSION
// =============================================================================

/**
 * Convert detected ColumnBoundaries to legacy ColumnAnchor format
 * This allows integration with existing coordinate mapper code
 */
export function convertToColumnAnchors(
  boundaries: ColumnBoundary[]
): Array<{
  columnType: ColumnType;
  boundingBox: { x: number; y: number; width: number; height: number };
  aliases: string[];
}> {
  return boundaries
    .filter(b => b.inferredType !== null && b.inferredType !== 'unknown')
    .map(b => ({
      columnType: b.inferredType as ColumnType,
      boundingBox: {
        x: b.x0,
        y: 0, // Y not relevant for column matching
        width: b.x1 - b.x0,
        height: 20,
      },
      aliases: [`${b.inferredType} (auto-detected)`],
    }));
}

// =============================================================================
// MAIN PROCESSING FUNCTION
// =============================================================================

export interface DynamicProcessingResult {
  rawTransactions: RawTransaction[];
  stitchedTransactions: StitchedTransaction[];
  columnBoundaries: ColumnBoundary[];
  openingBalance: StitchedTransaction | null;
  closingBalance: StitchedTransaction | null;
  skippedRowCount: number;
}

/**
 * Process extracted rows into transactions using dynamic detection
 */
export function processExtractedRows(
  rows: ExtractedRow[],
  boundaries: ColumnBoundary[]
): DynamicProcessingResult {
  // Stitch continuation rows
  const stitched = stitchContinuationRows(rows);
  
  // Separate opening/closing balance
  const openingBalance = stitched.find(t => t.classification.isOpeningBalance) || null;
  const closingBalance = stitched.find(t => t.classification.isClosingBalance) || null;
  
  // Filter to actual transactions
  const transactions = stitched.filter(t => 
    t.classification.isTransaction && 
    !t.classification.isOpeningBalance && 
    !t.classification.isClosingBalance
  );

  // Count skipped rows
  const skippedRowCount = rows.length - stitched.reduce(
    (sum, t) => sum + 1 + t.continuationRows.length, 
    0
  );

  // Convert to raw transactions
  const rawTransactions = convertToRawTransactions(transactions);

  console.log('[DynamicRowProcessor] Processed:', {
    totalRows: rows.length,
    transactions: transactions.length,
    openingBalance: !!openingBalance,
    closingBalance: !!closingBalance,
    skipped: skippedRowCount,
  });

  return {
    rawTransactions,
    stitchedTransactions: transactions,
    columnBoundaries: boundaries,
    openingBalance,
    closingBalance,
    skippedRowCount,
  };
}

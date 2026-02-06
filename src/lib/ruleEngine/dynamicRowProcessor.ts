/**
 * Dynamic Row Processing Engine
 * Converts detected table rows to transactions without bank profile templates
 */

import type { RawTransaction, ParsedTransaction, TextElement, ColumnType } from './types';
import type { ExtractedRow, ColumnBoundary, PdfLine } from './tableDetector';
import { isAddressContent, ADDRESS_PATTERNS } from './skipPatterns';

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
  recoveredDate: string | null;
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

// Patterns for merged amount column CR/DR suffix extraction
// Enhanced to handle various Indian bank formats: "1,548.00 Dr", "500.00DR", "1548.00 (Dr)", "-1548.00"
const DEBIT_SUFFIX_PATTERN = /([\d,.\s]+)\s*[(\[]?\s*(dr|debit|d)\s*[)\]]?\s*$/i;
const CREDIT_SUFFIX_PATTERN = /([\d,.\s]+)\s*[(\[]?\s*(cr|credit|c)\s*[)\]]?\s*$/i;
const NEGATIVE_AMOUNT_PATTERN = /^\s*-\s*([\d,.]+)\s*$/;
const POSITIVE_AMOUNT_PATTERN = /^\s*\+?\s*([\d,.]+)\s*$/;

// =============================================================================
// REFERENCE EXTRACTION PATTERNS
// =============================================================================

export type ReferenceType = 'UTR' | 'IMPS' | 'NEFT' | 'RTGS' | 'Cheque' | 'RefNo' | 'Other';

const REFERENCE_PATTERNS: Array<{ pattern: RegExp; type: ReferenceType }> = [
  { pattern: /\bUTR\s*[:\-]?\s*([A-Z0-9]{16,22})\b/i, type: 'UTR' },
  { pattern: /\bIMPS\s*[:\-]?\s*(\d{12,16})\b/i, type: 'IMPS' },
  { pattern: /\bNEFT\s*[:\-]?\s*([A-Z0-9]{16,22})\b/i, type: 'NEFT' },
  { pattern: /\bRTGS\s*[:\-]?\s*([A-Z0-9]{16,22})\b/i, type: 'RTGS' },
  { pattern: /\bCHQ\s*(?:NO)?\.?\s*[:\-]?\s*(\d{6,8})\b/i, type: 'Cheque' },
  { pattern: /\bCHEQUE\s*(?:NO)?\.?\s*[:\-]?\s*(\d{6,8})\b/i, type: 'Cheque' },
  { pattern: /\bCHK\s*(?:NO)?\.?\s*[:\-]?\s*(\d{6,8})\b/i, type: 'Cheque' },
  { pattern: /\bREF\s*(?:NO)?\.?\s*[:\-]?\s*([A-Z0-9]{6,20})\b/i, type: 'RefNo' },
  { pattern: /\bTXN\s*(?:ID)?\.?\s*[:\-]?\s*([A-Z0-9]{10,20})\b/i, type: 'RefNo' },
  { pattern: /\bTRAN\s*(?:ID)?\.?\s*[:\-]?\s*([A-Z0-9]{10,20})\b/i, type: 'RefNo' },
  { pattern: /\bACH\s*[:\-]?\s*([A-Z0-9]{10,20})\b/i, type: 'RefNo' },
];

/**
 * Extract reference/UTR/cheque numbers from transaction description
 * Returns the extracted reference, its type, and cleaned description
 */
export function extractReference(description: string): { 
  reference: string | null; 
  referenceType: ReferenceType | null;
  cleanedDescription: string;
} {
  for (const { pattern, type } of REFERENCE_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      console.log(`[ReferenceExtractor] Found ${type}: ${match[1]} in "${description.substring(0, 50)}..."`);
      return {
        reference: match[1],
        referenceType: type,
        cleanedDescription: description.replace(match[0], '').replace(/\s+/g, ' ').trim(),
      };
    }
  }
  return { reference: null, referenceType: null, cleanedDescription: description };
}

/**
 * Extract debit/credit from merged amount column based on suffix
 * Handles multiple formats:
 * - "1,548.00 Dr" / "500.00 Cr"
 * - "1548.00DR" / "500.00CR"
 * - "1,548.00 (Dr)" / "500.00 (Cr)"
 * - "-1548.00" (negative = debit)
 * - "+500.00" (positive = credit)
 * - "1548.00 D" / "500.00 C"
 */
function splitMergedAmount(amountText: string): { debit: string | null; credit: string | null; wasClassified: boolean } {
  if (!amountText) return { debit: null, credit: null, wasClassified: false };
  
  const trimmed = amountText.trim();
  
  // Check for DR/Debit suffix
  const debitMatch = trimmed.match(DEBIT_SUFFIX_PATTERN);
  if (debitMatch) {
    return { debit: debitMatch[1].trim(), credit: null, wasClassified: true };
  }
  
  // Check for CR/Credit suffix
  const creditMatch = trimmed.match(CREDIT_SUFFIX_PATTERN);
  if (creditMatch) {
    return { debit: null, credit: creditMatch[1].trim(), wasClassified: true };
  }
  
  // Check for negative prefix (common in some banks for debit)
  const negativeMatch = trimmed.match(NEGATIVE_AMOUNT_PATTERN);
  if (negativeMatch) {
    return { debit: negativeMatch[1].trim(), credit: null, wasClassified: true };
  }
  
  // Check for explicit positive prefix (less common, but indicates credit)
  const positiveMatch = trimmed.match(POSITIVE_AMOUNT_PATTERN);
  if (positiveMatch && trimmed.startsWith('+')) {
    return { debit: null, credit: positiveMatch[1].trim(), wasClassified: true };
  }
  
  // No suffix found - return as-is (will need manual classification)
  return { debit: null, credit: null, wasClassified: false };
}

/**
 * Find a date pattern in ANY column of the row
 * Used for cross-column recovery when date column is misclassified
 */
function findDateInAnyColumn(row: ExtractedRow): string | null {
  const allFields = [row.date, row.description, row.debit, row.credit, row.balance, row.amount];
  
  for (const field of allFields) {
    if (!field) continue;
    
    // Check each part of the field for date patterns
    const parts = field.split(/\s+/);
    for (const part of parts) {
      if (DATE_VALIDATION_PATTERNS.some(p => p.test(part))) {
        return part;
      }
    }
  }
  return null;
}

/**
 * Check if row contains any numeric content (likely amounts)
 */
function hasNumericContent(row: ExtractedRow): boolean {
  const allFields = [row.debit, row.credit, row.balance, row.amount];
  return allFields.some(field => {
    if (!field) return false;
    // Remove common formatting and check for digits
    const cleaned = field.replace(/[,\s]/g, '');
    return /\d+\.?\d*/.test(cleaned);
  });
}

/**
 * Classify a row to determine its type
 * ULTRA-RELAXED: Include rows with ANY meaningful content
 */
export function classifyRow(row: ExtractedRow): RowClassification & { 
  effectiveDebit: string | null; 
  effectiveCredit: string | null;
  wasAmountSplit: boolean;
} {
  // Handle merged amount column by splitting into debit/credit
  let effectiveDebit = row.debit;
  let effectiveCredit = row.credit;
  let wasAmountSplit = false;
  
  if (row.amount && !row.debit && !row.credit) {
    const { debit, credit, wasClassified } = splitMergedAmount(row.amount);
    effectiveDebit = debit;
    effectiveCredit = credit;
    wasAmountSplit = wasClassified;
  }
  
  const fullText = [row.date, row.description, effectiveDebit, effectiveCredit, row.balance]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Check for opening/closing balance
  const isOpeningBalance = OPENING_BALANCE_PATTERNS.some(p => p.test(fullText));
  const isClosingBalance = CLOSING_BALANCE_PATTERNS.some(p => p.test(fullText));

  // Check for skip patterns (headers/footers)
  const isSkip = SKIP_PATTERNS.some(p => p.test(fullText));

  // ULTRA-RELAXED DETECTION
  // 1. Try to validate date in date column
  const hasValidDate = row.date !== null && 
    DATE_VALIDATION_PATTERNS.some(p => p.test(row.date!));
  
  // 2. Cross-column date recovery - search all fields for dates
  const recoveredDate = hasValidDate ? row.date : findDateInAnyColumn(row);
  const hasRecoveredDate = recoveredDate !== null;
  
  // 3. Check for balance and amounts
  const hasBalance = row.balance !== null && row.balance.trim().length > 0;
  const hasAmount = effectiveDebit !== null || effectiveCredit !== null || row.amount !== null;
  
  // 4. Check for any numeric content (fallback)
  const hasNumeric = hasNumericContent(row);
  
  // 5. Check for meaningful description
  const hasDescription = row.description !== null && row.description.trim().length > 2;
  
  // RELAXED: A row is a transaction if:
  // - Has ANY date (validated or recovered) + any other content, OR
  // - Has balance + any amount, OR  
  // - Has numeric content + description (likely a transaction row), OR
  // - Has description + any date (even recovered), OR
  // - Has at least 2 of: date, description, amount, balance
  const contentCount = [hasRecoveredDate, hasDescription, hasAmount || hasNumeric, hasBalance].filter(Boolean).length;
  
  const isTransaction = !isSkip && !isOpeningBalance && !isClosingBalance && (
    (hasRecoveredDate && (hasAmount || hasBalance || hasDescription)) ||
    (hasBalance && hasAmount) ||
    (hasNumeric && hasDescription) ||
    (hasValidDate && hasBalance) ||
    contentCount >= 2
  );

  // Continuation row: has ONLY description (no date anywhere, no balance, no amounts)
  const isContinuation = hasDescription && !hasRecoveredDate && !hasBalance && !hasAmount && !hasNumeric && !isSkip;

  return {
    isTransaction,
    isContinuation,
    isHeader: isSkip && !isOpeningBalance && !isClosingBalance,
    isFooter: isSkip && !isOpeningBalance && !isClosingBalance,
    isOpeningBalance,
    isClosingBalance,
    recoveredDate,
    effectiveDebit,
    effectiveCredit,
    wasAmountSplit,
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
  effectiveDebit: string | null;
  effectiveCredit: string | null;
  wasAmountSplit: boolean;
  recoveredDate: string | null;  // Date recovered from any column
}

/**
 * Apply look-back stitching to merge continuation lines with parent transactions
 */
export function stitchContinuationRows(rows: ExtractedRow[]): StitchedTransaction[] {
  const stitched: StitchedTransaction[] = [];
  let currentTransaction: StitchedTransaction | null = null;

  for (const row of rows) {
    const classResult = classifyRow(row);
    const classification: RowClassification = {
      isTransaction: classResult.isTransaction,
      isContinuation: classResult.isContinuation,
      isHeader: classResult.isHeader,
      isFooter: classResult.isFooter,
      isOpeningBalance: classResult.isOpeningBalance,
      isClosingBalance: classResult.isClosingBalance,
      recoveredDate: classResult.recoveredDate,
    };

    if (classification.isTransaction || classification.isOpeningBalance || classification.isClosingBalance) {
      // Save previous transaction
      if (currentTransaction) {
        stitched.push(finalizeStitchedTransaction(currentTransaction));
      }

      // Start new transaction with resolved debit/credit
      currentTransaction = {
        primaryRow: row,
        continuationRows: [],
        fullDescription: row.description || '',
        classification,
        effectiveDebit: classResult.effectiveDebit,
        effectiveCredit: classResult.effectiveCredit,
        wasAmountSplit: classResult.wasAmountSplit,
        recoveredDate: classResult.recoveredDate,
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
 * Handles merged amount columns by using pre-split effective values
 * Extracts reference numbers (UTR, NEFT, cheque, etc.) to separate field
 */
export function convertToRawTransactions(
  stitchedTransactions: StitchedTransaction[]
): RawTransaction[] {
  let splitCount = 0;
  
  const result = stitchedTransactions.map((tx, index) => {
    const row = tx.primaryRow;
    
    // Use pre-computed effective debit/credit from classification
    const effectiveDebit = tx.effectiveDebit ?? row.debit;
    const effectiveCredit = tx.effectiveCredit ?? row.credit;
    
    if (tx.wasAmountSplit) {
      splitCount++;
      console.log(`[DynamicRowProcessor] Split merged amount: "${row.amount}" -> debit: ${effectiveDebit}, credit: ${effectiveCredit}`);
    }
    
    // Use recovered date if original date is empty
    let rawDate = row.date;
    if (!rawDate && tx.recoveredDate) {
      rawDate = tx.recoveredDate;
      console.log(`[DynamicRowProcessor] Recovered date "${tx.recoveredDate}" from another column`);
    }
    
    // Extract reference from description
    let description = tx.fullDescription;
    const { reference, referenceType, cleanedDescription } = extractReference(description);
    
    // If date was recovered from description, remove it from description
    if (tx.recoveredDate && cleanedDescription.includes(tx.recoveredDate)) {
      description = cleanedDescription.replace(tx.recoveredDate, '').replace(/\s+/g, ' ').trim();
    } else {
      description = cleanedDescription;
    }
    
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
      rawDate: rawDate || undefined,
      rawDescription: description,  // Use cleaned description (reference and recovered date removed)
      rawDebit: effectiveDebit || undefined,
      rawCredit: effectiveCredit || undefined,
      rawBalance: row.balance || undefined,
      rawReference: reference || undefined,
      referenceType: referenceType || undefined,
    };
  });

  if (splitCount > 0) {
    console.log(`[DynamicRowProcessor] Split ${splitCount} merged amount values into debit/credit`);
  }

  return result;
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
  
  // RELAXED: Include ALL stitched rows except opening/closing balance
  // Let the Excel generator filter truly empty rows at output stage
  const transactions = stitched.filter(t => 
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

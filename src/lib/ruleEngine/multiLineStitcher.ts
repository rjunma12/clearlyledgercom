/**
 * Multi-Line Stitching Engine
 * Solves 'Ghost Rows' by implementing Look-Back Stitching Rules
 */

import type { TextRow } from './coordinateMapper';
import type { RawTransaction, ParsedTransaction } from './types';

// =============================================================================
// ROW VALIDATION
// =============================================================================

/**
 * Check if a row contains a valid date value
 */
export function hasValidDate(row: TextRow): boolean {
  const dateElements = row.elements.get('date');
  if (!dateElements || dateElements.length === 0) return false;
  
  const dateText = dateElements.map(e => e.text).join(' ').trim();
  
  // Common date patterns
  const datePatterns = [
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,  // DD/MM/YYYY, MM/DD/YYYY
    /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,     // YYYY-MM-DD
    /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}$/,       // 15 January 2025
    /^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}$/,     // January 15, 2025
  ];
  
  return datePatterns.some(pattern => pattern.test(dateText));
}

/**
 * Check if a row contains any monetary amount (debit, credit, or balance)
 */
export function hasMonetaryAmount(row: TextRow): boolean {
  const debitElements = row.elements.get('debit');
  const creditElements = row.elements.get('credit');
  const balanceElements = row.elements.get('balance');
  
  const hasDebit = debitElements && debitElements.some(e => 
    /[\d,.]/.test(e.text) && e.text.trim().length > 0
  );
  
  const hasCredit = creditElements && creditElements.some(e => 
    /[\d,.]/.test(e.text) && e.text.trim().length > 0
  );
  
  const hasBalance = balanceElements && balanceElements.some(e => 
    /[\d,.]/.test(e.text) && e.text.trim().length > 0
  );
  
  return hasDebit || hasCredit || hasBalance;
}

/**
 * Check if a row has description content
 */
export function hasDescription(row: TextRow): boolean {
  const descElements = row.elements.get('description');
  return descElements !== undefined && 
         descElements.length > 0 && 
         descElements.some(e => e.text.trim().length > 0);
}

/**
 * Determine if a row is a continuation line (orphan description)
 * A continuation line has description text but NO date and NO amounts
 */
export function isContinuationRow(row: TextRow): boolean {
  return hasDescription(row) && !hasValidDate(row) && !hasMonetaryAmount(row);
}

/**
 * Determine if a row is a complete transaction row
 * A complete row has a date AND at least one amount
 */
export function isCompleteTransactionRow(row: TextRow): boolean {
  return hasValidDate(row) && hasMonetaryAmount(row);
}

// =============================================================================
// LOOK-BACK STITCHING ENGINE
// =============================================================================

export interface StitchedRow {
  primaryRow: TextRow;
  continuationRows: TextRow[];
  stitchedDescription: string;
  isStitched: boolean;
}

/**
 * Apply look-back stitching to merge continuation lines with their parent transactions
 */
export function applyLookBackStitching(rows: TextRow[]): StitchedRow[] {
  const stitchedRows: StitchedRow[] = [];
  let currentStitchedRow: StitchedRow | null = null;
  
  for (const row of rows) {
    if (isCompleteTransactionRow(row)) {
      // Save previous stitched row if exists
      if (currentStitchedRow) {
        stitchedRows.push(finalizeStitchedRow(currentStitchedRow));
      }
      
      // Start new stitched row
      currentStitchedRow = {
        primaryRow: row,
        continuationRows: [],
        stitchedDescription: extractDescription(row),
        isStitched: false,
      };
    } else if (isContinuationRow(row) && currentStitchedRow) {
      // Append to current transaction
      currentStitchedRow.continuationRows.push(row);
      currentStitchedRow.isStitched = true;
      
      // Append description text
      const continuationText = extractDescription(row);
      if (continuationText) {
        currentStitchedRow.stitchedDescription += ' ' + continuationText;
      }
    }
    // Skip rows that are neither complete nor continuation (e.g., headers, footers)
  }
  
  // Don't forget the last row
  if (currentStitchedRow) {
    stitchedRows.push(finalizeStitchedRow(currentStitchedRow));
  }
  
  return stitchedRows;
}

/**
 * Extract description text from a row
 */
function extractDescription(row: TextRow): string {
  const descElements = row.elements.get('description');
  if (!descElements) return '';
  
  return descElements
    .map(e => e.text)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');  // Normalize whitespace
}

/**
 * Finalize a stitched row by cleaning up the description
 */
function finalizeStitchedRow(row: StitchedRow): StitchedRow {
  return {
    ...row,
    stitchedDescription: cleanDescription(row.stitchedDescription),
  };
}

// =============================================================================
// DESCRIPTION CLEANING
// =============================================================================

/**
 * Clean and normalize a description string
 */
export function cleanDescription(description: string): string {
  let cleaned = description
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim()
    // Remove repeated punctuation
    .replace(/([,.\-:])\1+/g, '$1')
    // Normalize dashes
    .replace(/\s*[-–—]\s*/g, ' - ')
    // Remove empty parentheses
    .replace(/\(\s*\)/g, '')
    // Clean up reference numbers
    .replace(/REF\s*[:.]?\s*/gi, 'Ref: ')
    // Normalize case for common terms
    .replace(/\bTRF\b/gi, 'Transfer')
    .replace(/\bPYMT\b/gi, 'Payment')
    .replace(/\bDEP\b/gi, 'Deposit')
    .replace(/\bWDL\b/gi, 'Withdrawal')
    .replace(/\bCHQ\b/gi, 'Cheque')
    .replace(/\bATM\b/gi, 'ATM')
    .replace(/\bPOS\b/gi, 'POS');
  
  return cleaned;
}

// =============================================================================
// RAW TRANSACTION CONVERSION
// =============================================================================

/**
 * Convert stitched rows to raw transaction format
 */
export function convertToRawTransactions(
  stitchedRows: StitchedRow[]
): RawTransaction[] {
  return stitchedRows.map((stitched, index) => {
    const row = stitched.primaryRow;
    
    return {
      rowIndex: index,
      pageNumber: row.elements.get('date')?.[0]?.pageNumber ?? 0,
      elements: [
        ...(row.elements.get('date') ?? []),
        ...(row.elements.get('description') ?? []),
        ...(row.elements.get('debit') ?? []),
        ...(row.elements.get('credit') ?? []),
        ...(row.elements.get('balance') ?? []),
        ...stitched.continuationRows.flatMap(r => 
          Array.from(r.elements.values()).flat()
        ),
      ],
      rawDate: row.elements.get('date')?.map(e => e.text).join(' '),
      rawDescription: stitched.stitchedDescription,
      rawDebit: row.elements.get('debit')?.map(e => e.text).join(''),
      rawCredit: row.elements.get('credit')?.map(e => e.text).join(''),
      rawBalance: row.elements.get('balance')?.map(e => e.text).join(''),
    };
  });
}

/**
 * Track original lines for audit trail
 */
export function getOriginalLines(stitched: StitchedRow): string[] {
  const lines: string[] = [];
  
  // Primary row line
  const primaryDesc = extractDescription(stitched.primaryRow);
  if (primaryDesc) lines.push(primaryDesc);
  
  // Continuation row lines
  for (const contRow of stitched.continuationRows) {
    const contDesc = extractDescription(contRow);
    if (contDesc) lines.push(contDesc);
  }
  
  return lines;
}

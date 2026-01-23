/**
 * Chronological Order Detection & Auto-Reversal
 * Ensures transactions are in ascending date order (oldest first)
 */

import type { ParsedTransaction, DocumentSegment } from './types';

// =============================================================================
// TYPES
// =============================================================================

export type DateOrder = 'ascending' | 'descending' | 'mixed' | 'unknown';

export interface ChronologicalAnalysis {
  dateOrder: DateOrder;
  wasReversed: boolean;
  outOfOrderIndices: number[];
  confidence: number;
}

export interface DateSequenceWarning {
  rowIndex: number;
  expectedDate: string;
  actualDate: string;
  message: string;
}

// =============================================================================
// DATE ORDER DETECTION
// =============================================================================

/**
 * Parse ISO date string to comparable timestamp
 */
function dateToTimestamp(isoDate: string): number | null {
  if (!isoDate || isoDate.length === 0) return null;
  const date = new Date(isoDate);
  return isNaN(date.getTime()) ? null : date.getTime();
}

/**
 * Analyze the date order of transactions
 * Returns whether dates are ascending, descending, mixed, or unknown
 */
export function detectDateOrder(transactions: ParsedTransaction[]): DateOrder {
  if (transactions.length < 2) return 'unknown';
  
  // Extract valid dates with their indices
  const datesWithIndices: Array<{ index: number; timestamp: number }> = [];
  
  for (let i = 0; i < transactions.length; i++) {
    const timestamp = dateToTimestamp(transactions[i].date);
    if (timestamp !== null) {
      datesWithIndices.push({ index: i, timestamp });
    }
  }
  
  if (datesWithIndices.length < 2) return 'unknown';
  
  // Count ascending and descending transitions
  let ascending = 0;
  let descending = 0;
  let equal = 0;
  
  for (let i = 1; i < datesWithIndices.length; i++) {
    const prev = datesWithIndices[i - 1].timestamp;
    const curr = datesWithIndices[i].timestamp;
    
    if (curr > prev) {
      ascending++;
    } else if (curr < prev) {
      descending++;
    } else {
      equal++;
    }
  }
  
  const total = ascending + descending;
  if (total === 0) return 'unknown';
  
  // Determine order based on majority
  const ascendingRatio = ascending / total;
  
  if (ascendingRatio >= 0.8) return 'ascending';
  if (ascendingRatio <= 0.2) return 'descending';
  return 'mixed';
}

/**
 * Calculate confidence score for the detected order
 */
export function calculateOrderConfidence(
  transactions: ParsedTransaction[],
  order: DateOrder
): number {
  if (order === 'unknown') return 0;
  if (order === 'mixed') return 0.5;
  
  let correct = 0;
  let total = 0;
  
  for (let i = 1; i < transactions.length; i++) {
    const prevTs = dateToTimestamp(transactions[i - 1].date);
    const currTs = dateToTimestamp(transactions[i].date);
    
    if (prevTs === null || currTs === null) continue;
    
    total++;
    
    if (order === 'ascending' && currTs >= prevTs) correct++;
    if (order === 'descending' && currTs <= prevTs) correct++;
  }
  
  return total > 0 ? correct / total : 0;
}

// =============================================================================
// SEQUENCE VALIDATION
// =============================================================================

/**
 * Find indices where dates are out of expected sequence
 */
export function findOutOfOrderIndices(
  transactions: ParsedTransaction[],
  expectedOrder: 'ascending' | 'descending' = 'ascending'
): number[] {
  const outOfOrder: number[] = [];
  
  for (let i = 1; i < transactions.length; i++) {
    const prevTs = dateToTimestamp(transactions[i - 1].date);
    const currTs = dateToTimestamp(transactions[i].date);
    
    if (prevTs === null || currTs === null) continue;
    
    const isWrongOrder = expectedOrder === 'ascending'
      ? currTs < prevTs
      : currTs > prevTs;
    
    if (isWrongOrder) {
      outOfOrder.push(i);
    }
  }
  
  return outOfOrder;
}

/**
 * Validate that dates are in chronological sequence
 * Returns warnings for any out-of-order dates
 */
export function validateChronologicalSequence(
  transactions: ParsedTransaction[]
): DateSequenceWarning[] {
  const warnings: DateSequenceWarning[] = [];
  const outOfOrder = findOutOfOrderIndices(transactions, 'ascending');
  
  for (const index of outOfOrder) {
    warnings.push({
      rowIndex: index,
      expectedDate: `after ${transactions[index - 1]?.date ?? 'unknown'}`,
      actualDate: transactions[index].date,
      message: `Date ${transactions[index].date} appears out of sequence (expected after ${transactions[index - 1]?.date})`,
    });
  }
  
  return warnings;
}

// =============================================================================
// TRANSACTION REVERSAL
// =============================================================================

/**
 * Reverse transaction order and recalculate indices
 */
export function reverseTransactions(
  transactions: ParsedTransaction[]
): ParsedTransaction[] {
  if (transactions.length === 0) return [];
  
  // Reverse the array
  const reversed = [...transactions].reverse();
  
  // Recalculate row indices
  return reversed.map((tx, index) => ({
    ...tx,
    rowIndex: index,
    id: `tx-${index}`,
  }));
}

/**
 * Recalculate running balances after reversal
 * This is needed because the balance equation direction changes
 */
export function recalculateBalances(
  transactions: ParsedTransaction[],
  openingBalance: number
): ParsedTransaction[] {
  if (transactions.length === 0) return [];
  
  let runningBalance = openingBalance;
  
  return transactions.map(tx => {
    const credit = tx.credit ?? 0;
    const debit = tx.debit ?? 0;
    runningBalance = runningBalance + credit - debit;
    
    return {
      ...tx,
      balance: runningBalance,
    };
  });
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Perform complete chronological analysis on transactions
 */
export function analyzeChronologicalOrder(
  transactions: ParsedTransaction[],
  autoReverse: boolean = true
): {
  transactions: ParsedTransaction[];
  analysis: ChronologicalAnalysis;
  warnings: DateSequenceWarning[];
} {
  // Detect current order
  const dateOrder = detectDateOrder(transactions);
  const confidence = calculateOrderConfidence(transactions, dateOrder);
  
  let processedTransactions = transactions;
  let wasReversed = false;
  
  // Auto-reverse if descending and auto-reverse is enabled
  if (autoReverse && dateOrder === 'descending' && confidence >= 0.8) {
    processedTransactions = reverseTransactions(transactions);
    wasReversed = true;
  }
  
  // Find any remaining out-of-order dates
  const outOfOrderIndices = findOutOfOrderIndices(processedTransactions, 'ascending');
  const warnings = validateChronologicalSequence(processedTransactions);
  
  return {
    transactions: processedTransactions,
    analysis: {
      dateOrder: wasReversed ? 'ascending' : dateOrder,
      wasReversed,
      outOfOrderIndices,
      confidence,
    },
    warnings,
  };
}

/**
 * Apply chronological ordering to a document segment
 */
export function processSegmentChronology(
  segment: DocumentSegment,
  autoReverse: boolean = true
): {
  segment: DocumentSegment;
  wasReversed: boolean;
  warnings: DateSequenceWarning[];
} {
  const result = analyzeChronologicalOrder(segment.transactions, autoReverse);
  
  // If reversed, recalculate balances using the opening balance
  let transactions = result.transactions;
  if (result.analysis.wasReversed) {
    transactions = recalculateBalances(transactions, segment.openingBalance);
  }
  
  return {
    segment: {
      ...segment,
      transactions,
    },
    wasReversed: result.analysis.wasReversed,
    warnings: result.warnings,
  };
}

/**
 * Check if auto-reversal should be applied
 */
export function shouldAutoReverse(
  dateOrder: DateOrder,
  confidence: number,
  threshold: number = 0.8
): boolean {
  return dateOrder === 'descending' && confidence >= threshold;
}

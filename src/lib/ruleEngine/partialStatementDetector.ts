/**
 * Partial Statement Detector
 * Detects mid-month or incomplete statement snapshots
 * Adjusts validation expectations for partial statements
 */

import type { ParsedTransaction, ExtractedStatementHeader } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface StatementCompleteness {
  hasOpeningBalance: boolean;
  hasClosingBalance: boolean;
  isPartialStatement: boolean;
  partialReason?: string;
  detectedPeriod?: {
    from: string;
    to: string;
  };
  suggestedOpeningBalance?: number;
  suggestedClosingBalance?: number;
}

// =============================================================================
// BALANCE ROW DETECTION PATTERNS
// =============================================================================

/**
 * Patterns that indicate an opening balance row
 */
const OPENING_BALANCE_PATTERNS = [
  /^opening\s*balance/i,
  /^brought?\s*forward/i,
  /^b\/f/i,
  /^balance\s*brought?\s*forward/i,
  /^opening\s*bal\.?/i,
  /^o\/b/i,
  /^previous\s*balance/i,
  /^beginning\s*balance/i,
  /^starting\s*balance/i,
  /प्रारंभिक\s*शेष/,                     // Hindi: Opening balance
  /期初余额/,                              // Chinese: Opening balance
  /期首残高/,                              // Japanese: Opening balance
  /baki\s*dibawa/i,                        // Malay: Balance brought forward
];

/**
 * Patterns that indicate a closing balance row
 */
const CLOSING_BALANCE_PATTERNS = [
  /^closing\s*balance/i,
  /^carried?\s*forward/i,
  /^c\/f/i,
  /^balance\s*carried?\s*forward/i,
  /^closing\s*bal\.?/i,
  /^ending\s*balance/i,
  /^final\s*balance/i,
  /^available\s*balance/i,
  /^current\s*balance/i,
  /अंतिम\s*शेष/,                          // Hindi: Closing balance
  /期末余额/,                              // Chinese: Closing balance
  /期末残高/,                              // Japanese: Closing balance
  /baki\s*semasa/i,                        // Malay: Current balance
];

/**
 * Patterns that indicate a statement period
 */
const PERIOD_PATTERNS = [
  /statement\s*period/i,
  /from\s*\d/i,
  /period:\s*\d/i,
  /for\s*the\s*period/i,
];

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if a transaction description indicates an opening balance
 */
export function isOpeningBalanceRow(description: string): boolean {
  if (!description) return false;
  const cleaned = description.trim().toLowerCase();
  return OPENING_BALANCE_PATTERNS.some(pattern => pattern.test(cleaned));
}

/**
 * Check if a transaction description indicates a closing balance
 */
export function isClosingBalanceRow(description: string): boolean {
  if (!description) return false;
  const cleaned = description.trim().toLowerCase();
  return CLOSING_BALANCE_PATTERNS.some(pattern => pattern.test(cleaned));
}

/**
 * Detect if the statement is complete or partial
 */
export function detectStatementCompleteness(
  transactions: ParsedTransaction[],
  extractedHeader?: ExtractedStatementHeader
): StatementCompleteness {
  if (transactions.length === 0) {
    return {
      hasOpeningBalance: false,
      hasClosingBalance: false,
      isPartialStatement: true,
      partialReason: 'No transactions found',
    };
  }
  
  // Check for opening balance in first few transactions
  const firstFew = transactions.slice(0, 5);
  const hasOpening = firstFew.some(tx => isOpeningBalanceRow(tx.description));
  
  // Check for closing balance in last few transactions
  const lastFew = transactions.slice(-5);
  const hasClosing = lastFew.some(tx => isClosingBalanceRow(tx.description));
  
  // Determine if partial
  const isPartial = !hasOpening || !hasClosing;
  
  // Build reason string
  let partialReason: string | undefined;
  if (isPartial) {
    const missing: string[] = [];
    if (!hasOpening) missing.push('opening balance');
    if (!hasClosing) missing.push('closing balance');
    partialReason = `Missing ${missing.join(' and ')} row`;
  }
  
  // Extract period from header if available
  const detectedPeriod = extractedHeader?.statementPeriodFrom
    ? {
        from: extractedHeader.statementPeriodFrom,
        to: extractedHeader.statementPeriodTo || '',
      }
    : undefined;
  
  // Suggest opening/closing balances from transaction data
  let suggestedOpeningBalance: number | undefined;
  let suggestedClosingBalance: number | undefined;
  
  if (!hasOpening && transactions.length > 0) {
    // Derive opening balance from first transaction
    const first = transactions[0];
    if (first.balance != null && first.debit != null) {
      suggestedOpeningBalance = first.balance + first.debit;
    } else if (first.balance != null && first.credit != null) {
      suggestedOpeningBalance = first.balance - first.credit;
    }
  }
  
  if (!hasClosing && transactions.length > 0) {
    // Use last transaction's balance as closing
    const last = transactions[transactions.length - 1];
    suggestedClosingBalance = last.balance;
  }
  
  console.log(`[PartialStatementDetector] Opening: ${hasOpening}, Closing: ${hasClosing}, Partial: ${isPartial}`);
  
  return {
    hasOpeningBalance: hasOpening,
    hasClosingBalance: hasClosing,
    isPartialStatement: isPartial,
    partialReason,
    detectedPeriod,
    suggestedOpeningBalance,
    suggestedClosingBalance,
  };
}

/**
 * Adjust validation behavior for partial statements
 */
export function getValidationAdjustments(completeness: StatementCompleteness): {
  skipOpeningBalanceCheck: boolean;
  skipClosingBalanceCheck: boolean;
  useFirstTransactionAsOpening: boolean;
  warningMessage?: string;
} {
  return {
    skipOpeningBalanceCheck: !completeness.hasOpeningBalance,
    skipClosingBalanceCheck: !completeness.hasClosingBalance,
    useFirstTransactionAsOpening: !completeness.hasOpeningBalance,
    warningMessage: completeness.isPartialStatement
      ? `Partial statement detected: ${completeness.partialReason}. Balance validation adjusted.`
      : undefined,
  };
}

/**
 * Check if dates suggest a partial statement (not full month)
 */
export function isLikelyPartialPeriod(
  firstDate: string,
  lastDate: string
): boolean {
  if (!firstDate || !lastDate) return false;
  
  try {
    const first = new Date(firstDate);
    const last = new Date(lastDate);
    
    // Check if dates span less than 25 days (likely partial month)
    const daysDiff = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
    
    // Also check if first date is not 1st of month
    const firstDayOfMonth = first.getDate() !== 1;
    
    // Also check if last date is not last few days of month
    const lastDayCheck = last.getDate() < 28;
    
    if (daysDiff < 25 || (firstDayOfMonth && lastDayCheck)) {
      console.log(`[PartialStatementDetector] Date range suggests partial statement: ${daysDiff.toFixed(0)} days`);
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

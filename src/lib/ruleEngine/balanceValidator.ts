/**
 * Mathematical Integrity & Audit Flags Engine
 * Implements arithmetic validation for 100% accuracy
 */

import type { 
  ParsedTransaction, 
  ValidationResult, 
  ValidationStatus,
  DocumentSegment,
  ParsedDocument 
} from './types';
import { isOpeningBalanceRow, isClosingBalanceRow } from './locales';

// =============================================================================
// CURRENCY-AWARE TOLERANCE
// =============================================================================

/**
 * Currency-specific balance tolerances
 * No-decimal currencies need higher tolerance, standard currencies use 0.01
 */
const CURRENCY_TOLERANCES: Record<string, number> = {
  // No-decimal currencies (allow rounding to nearest unit)
  JPY: 1.0,
  KRW: 1.0,
  IDR: 1.0,
  VND: 1.0,
  
  // Standard 2-decimal currencies
  USD: 0.01,
  EUR: 0.01,
  GBP: 0.01,
  AUD: 0.01,
  CAD: 0.01,
  NZD: 0.01,
  CHF: 0.01,
  SGD: 0.01,
  HKD: 0.01,
  
  // INR - some banks round to nearest paisa or rupee
  INR: 0.50,
  
  // Middle East currencies
  AED: 0.01,
  SAR: 0.01,
  QAR: 0.01,
  
  // Default fallback
  DEFAULT: 0.05,
};

/**
 * Get the appropriate tolerance for a given currency
 */
export function getToleranceForCurrency(currency?: string): number {
  if (!currency) return CURRENCY_TOLERANCES.DEFAULT;
  const upperCurrency = currency.toUpperCase();
  return CURRENCY_TOLERANCES[upperCurrency] ?? CURRENCY_TOLERANCES.DEFAULT;
}

// =============================================================================
// BALANCE VALIDATION FORMULA
// =============================================================================

/**
 * Core validation formula:
 * Balance[n-1] + Credit[n] - Debit[n] == Balance[n]
 * 
 * For the first transaction after opening balance:
 * OpeningBalance + Credit[0] - Debit[0] == Balance[0]
 */
export function validateBalanceEquation(
  previousBalance: number,
  credit: number | null,
  debit: number | null,
  currentBalance: number,
  currency?: string
): ValidationResult {
  // Get currency-aware tolerance
  const tolerance = getToleranceForCurrency(currency);
  const creditAmount = credit ?? 0;
  const debitAmount = debit ?? 0;
  
  const expectedBalance = previousBalance + creditAmount - debitAmount;
  const discrepancy = Math.abs(currentBalance - expectedBalance);
  
  if (discrepancy <= tolerance) {
    return {
      isValid: true,
      status: 'valid',
      message: 'Balance verified ✓',
      expectedBalance,
      actualBalance: currentBalance,
      discrepancy: 0,
    };
  }
  
  // Check if it might be a debit/credit swap
  const swappedBalance = previousBalance - creditAmount + debitAmount;
  if (Math.abs(currentBalance - swappedBalance) <= tolerance) {
    console.log('[BalanceValidator] Possible swap detected:', {
      previousBalance,
      credit: creditAmount,
      debit: debitAmount,
      expected: expectedBalance,
      actual: currentBalance,
      swappedWouldBe: swappedBalance,
    });
    return {
      isValid: false,
      status: 'warning',
      message: 'Possible debit/credit swap detected',
      expectedBalance,
      actualBalance: currentBalance,
      discrepancy,
    };
  }
  
  // Log detailed mismatch info for debugging
  console.log('[BalanceValidator] MISMATCH:', {
    previousBalance,
    credit: creditAmount,
    debit: debitAmount,
    expected: expectedBalance,
    actual: currentBalance,
    discrepancy: discrepancy.toFixed(2),
  });
  
  return {
    isValid: false,
    status: 'error',
    message: `Balance mismatch: expected ${formatCurrency(expectedBalance)}, got ${formatCurrency(currentBalance)} (difference: ${formatCurrency(discrepancy)})`,
    expectedBalance,
    actualBalance: currentBalance,
    discrepancy,
  };
}

// =============================================================================
// OVERDRAFT ACCOUNT DETECTION
// =============================================================================

/**
 * Detect if a statement contains negative balances (overdraft account)
 */
export function detectOverdraftAccount(transactions: ParsedTransaction[]): boolean {
  return transactions.some(tx => tx.balance < 0);
}

/**
 * Check if a balance represents an overdraft
 */
export function isOverdraftBalance(balance: number): boolean {
  return balance < 0;
}

// =============================================================================
// TRANSACTION CHAIN VALIDATION
// =============================================================================

/**
 * Validate an entire chain of transactions
 * @param transactions - Array of parsed transactions to validate
 * @param openingBalance - Starting balance for the chain
 * @param currency - Optional currency code for tolerance calculation
 * @param isPartialStatement - If true, use first transaction as derived opening balance
 */
export function validateTransactionChain(
  transactions: ParsedTransaction[],
  openingBalance: number,
  currency?: string,
  isPartialStatement: boolean = false
): ParsedTransaction[] {
  if (transactions.length === 0) return [];
  
  const validatedTransactions: ParsedTransaction[] = [];
  const tolerance = getToleranceForCurrency(currency);
  
  // Detect overdraft account
  const isOverdraftAccount = detectOverdraftAccount(transactions);
  if (isOverdraftAccount) {
    console.log('[BalanceValidator] Overdraft account detected - allowing negative balances');
  }
  
  // Handle partial statement - derive opening balance from first transaction
  let runningBalance = openingBalance;
  if (isPartialStatement && transactions.length > 0) {
    const firstTx = transactions[0];
    const credit = firstTx.credit ?? 0;
    const debit = firstTx.debit ?? 0;
    runningBalance = firstTx.balance - credit + debit;
    console.log('[BalanceValidator] Partial statement - derived opening balance:', runningBalance);
  }
  
  console.log('[BalanceValidator] Starting chain validation with opening balance:', runningBalance, 
    'currency:', currency, 'tolerance:', tolerance, 'isPartialStatement:', isPartialStatement);
  
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    
    const validation = validateBalanceEquation(
      runningBalance,
      transaction.credit,
      transaction.debit,
      transaction.balance,
      currency
    );
    
    // For overdraft accounts, don't treat negative balances as errors
    let adjustedStatus = validation.status;
    if (validation.status === 'error' && isOverdraftAccount && transaction.balance < 0) {
      // Check if it's just a negative balance vs actual calculation error
      const expectedBalance = runningBalance + (transaction.credit ?? 0) - (transaction.debit ?? 0);
      const discrepancy = Math.abs(transaction.balance - expectedBalance);
      
      if (discrepancy <= tolerance) {
        adjustedStatus = 'valid';
      }
    }
    
    if (adjustedStatus === 'error') {
      console.log(`[BalanceValidator] Row ${i} validation failed:`, {
        rowIndex: transaction.rowIndex,
        date: transaction.date,
        description: transaction.description?.substring(0, 30),
        debit: transaction.debit,
        credit: transaction.credit,
        balance: transaction.balance,
        runningBalance,
        expected: validation.expectedBalance,
      });
    }
    
    validatedTransactions.push({
      ...transaction,
      validationStatus: adjustedStatus,
      validationMessage: adjustedStatus !== validation.status 
        ? 'Overdraft balance validated' 
        : validation.message,
    });
    
    // Update running balance for next iteration
    // Use actual balance from statement (not calculated) to continue chain
    runningBalance = transaction.balance;
  }
  
  console.log('[BalanceValidator] Chain validation complete:', {
    total: validatedTransactions.length,
    valid: validatedTransactions.filter(t => t.validationStatus === 'valid').length,
    warnings: validatedTransactions.filter(t => t.validationStatus === 'warning').length,
    errors: validatedTransactions.filter(t => t.validationStatus === 'error').length,
  });
  
  return validatedTransactions;
}

// =============================================================================
// MERGED PDF HANDLING
// =============================================================================

/**
 * Detect segment boundaries in merged PDFs
 * Look for 'Opening Balance' or 'Balance Brought Forward' to reset checksum
 */
export function detectSegmentBoundaries(
  transactions: ParsedTransaction[]
): number[] {
  const boundaries: number[] = [0];  // First segment always starts at 0
  
  for (let i = 1; i < transactions.length; i++) {
    const desc = transactions[i].description.toLowerCase();
    
    if (isOpeningBalanceRow(desc)) {
      boundaries.push(i);
    }
  }
  
  return boundaries;
}

/**
 * Split transactions into segments based on boundaries
 */
export function splitIntoSegments(
  transactions: ParsedTransaction[],
  boundaries: number[]
): DocumentSegment[] {
  const segments: DocumentSegment[] = [];
  
  for (let i = 0; i < boundaries.length; i++) {
    const startIdx = boundaries[i];
    const endIdx = boundaries[i + 1] ?? transactions.length;
    
    const segmentTransactions = transactions.slice(startIdx, endIdx);
    
    if (segmentTransactions.length === 0) continue;
    
    // Determine opening balance
    const firstTx = segmentTransactions[0];
    const openingBalance = calculateOpeningBalance(firstTx);
    
    segments.push({
      segmentIndex: i,
      startPage: Math.min(...segmentTransactions.map(t => t.sourcePageNumbers[0] ?? 0)),
      endPage: Math.max(...segmentTransactions.map(t => t.sourcePageNumbers[t.sourcePageNumbers.length - 1] ?? 0)),
      openingBalance,
      closingBalance: segmentTransactions[segmentTransactions.length - 1]?.balance,
      transactions: segmentTransactions,
    });
  }
  
  return segments;
}

/**
 * Calculate the opening balance from the first transaction
 */
function calculateOpeningBalance(firstTransaction: ParsedTransaction): number {
  // Opening balance = Current balance - Credits + Debits
  const credit = firstTransaction.credit ?? 0;
  const debit = firstTransaction.debit ?? 0;
  return firstTransaction.balance - credit + debit;
}

// =============================================================================
// DOCUMENT-LEVEL VALIDATION
// =============================================================================

/**
 * Validate an entire document with segment awareness
 */
export function validateDocument(
  document: ParsedDocument
): ParsedDocument {
  let totalValid = 0;
  let totalError = 0;
  let totalWarning = 0;
  
  const validatedSegments = document.segments.map(segment => {
    const validatedTransactions = validateTransactionChain(
      segment.transactions,
      segment.openingBalance
    );
    
    // Count validation results
    for (const tx of validatedTransactions) {
      switch (tx.validationStatus) {
        case 'valid':
          totalValid++;
          break;
        case 'error':
          totalError++;
          break;
        case 'warning':
          totalWarning++;
          break;
      }
    }
    
    return {
      ...segment,
      transactions: validatedTransactions,
    };
  });
  
  // Determine overall validation status
  let overallStatus: ValidationStatus = 'valid';
  if (totalError > 0) {
    overallStatus = 'error';
  } else if (totalWarning > 0) {
    overallStatus = 'warning';
  }
  
  return {
    ...document,
    segments: validatedSegments,
    validTransactions: totalValid,
    errorTransactions: totalError,
    warningTransactions: totalWarning,
    overallValidation: overallStatus,
  };
}

// =============================================================================
// AUDIT FLAG GENERATION
// =============================================================================

export interface AuditFlag {
  rowIndex: number;
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  details: {
    expected?: number;
    actual?: number;
    discrepancy?: number;
    previousBalance?: number;
  };
}

/**
 * Generate audit flags for all validation issues
 */
export function generateAuditFlags(
  transactions: ParsedTransaction[]
): AuditFlag[] {
  const flags: AuditFlag[] = [];
  
  for (const tx of transactions) {
    if (tx.validationStatus === 'error') {
      flags.push({
        rowIndex: tx.rowIndex,
        severity: 'error',
        code: 'BALANCE_MISMATCH',
        message: tx.validationMessage ?? 'Balance verification failed',
        details: {},
      });
    } else if (tx.validationStatus === 'warning') {
      flags.push({
        rowIndex: tx.rowIndex,
        severity: 'warning',
        code: 'POSSIBLE_SWAP',
        message: tx.validationMessage ?? 'Possible debit/credit swap',
        details: {},
      });
    }
  }
  
  return flags;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format a number as currency for display
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Check if all transactions in a document pass validation
 */
export function isDocumentValid(document: ParsedDocument): boolean {
  return document.overallValidation === 'valid';
}

/**
 * Get validation summary for UI display
 */
export function getValidationSummary(document: ParsedDocument): {
  total: number;
  valid: number;
  errors: number;
  warnings: number;
  passRate: string;
} {
  const total = document.totalTransactions;
  const valid = document.validTransactions;
  const errors = document.errorTransactions;
  const warnings = document.warningTransactions;
  const passRate = total > 0 ? ((valid / total) * 100).toFixed(1) + '%' : '0%';
  
  return { total, valid, errors, warnings, passRate };
}

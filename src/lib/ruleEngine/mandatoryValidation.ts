/**
 * Mandatory Validation Module
 * NON-NEGOTIABLE validation that runs after parsing
 * 
 * Checks:
 * 1. Balance equation: Opening + Credits - Debits ≈ Closing
 * 2. No duplicate rows
 * 3. No reordered rows
 * 4. Stable schema (all required columns present)
 */

import type { ParsedTransaction } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface MandatoryValidationReport {
  openingBalance: number | null;
  closingBalance: number | null;
  calculatedClosing: number | null;
  totalCredits: number;
  totalDebits: number;
  balanceCheckPassed: boolean;
  balanceDiscrepancy: number;
  duplicateRows: number[];
  reorderedRows: number[];
  schemaViolations: string[];
  transactionCount: number;
  validTransactionCount: number;
  passRate: number;
}

// =============================================================================
// BALANCE VALIDATION
// =============================================================================

/**
 * Validate balance equation: Opening + Credits - Debits = Closing
 */
function validateBalanceEquation(
  transactions: ParsedTransaction[],
  openingBalance: number | null,
  closingBalance: number | null
): {
  calculatedClosing: number | null;
  totalCredits: number;
  totalDebits: number;
  passed: boolean;
  discrepancy: number;
} {
  let totalCredits = 0;
  let totalDebits = 0;

  for (const tx of transactions) {
    totalCredits += tx.credit ?? 0;
    totalDebits += tx.debit ?? 0;
  }

  if (openingBalance === null || closingBalance === null) {
    return {
      calculatedClosing: null,
      totalCredits,
      totalDebits,
      passed: false,
      discrepancy: 0,
    };
  }

  const calculatedClosing = openingBalance + totalCredits - totalDebits;
  const discrepancy = Math.abs(calculatedClosing - closingBalance);
  
  // Allow small tolerance for rounding
  const passed = discrepancy < 0.01;

  return {
    calculatedClosing,
    totalCredits,
    totalDebits,
    passed,
    discrepancy,
  };
}

// =============================================================================
// DUPLICATE DETECTION
// =============================================================================

/**
 * Detect duplicate transactions based on date + amount + balance
 */
function detectDuplicateTransactions(transactions: ParsedTransaction[]): number[] {
  const seen = new Map<string, number>();
  const duplicates: number[] = [];

  for (const tx of transactions) {
    // Create a key from date, amounts, and balance
    const key = [
      tx.date,
      tx.debit ?? '',
      tx.credit ?? '',
      tx.balance,
    ].join('|');

    if (seen.has(key)) {
      duplicates.push(tx.rowIndex);
    } else {
      seen.set(key, tx.rowIndex);
    }
  }

  return duplicates;
}

// =============================================================================
// ORDER VALIDATION
// =============================================================================

/**
 * Detect rows that appear to be out of chronological order
 */
function detectReorderedRows(transactions: ParsedTransaction[]): number[] {
  const reordered: number[] = [];
  
  for (let i = 1; i < transactions.length; i++) {
    const prevDate = transactions[i - 1].date;
    const currDate = transactions[i].date;
    
    // Skip if dates are empty or invalid
    if (!prevDate || !currDate) continue;
    
    // Parse dates for comparison
    const prevTime = new Date(prevDate).getTime();
    const currTime = new Date(currDate).getTime();
    
    // Skip invalid dates
    if (isNaN(prevTime) || isNaN(currTime)) continue;
    
    // Flag if current date is before previous (assuming ascending order)
    if (currTime < prevTime) {
      reordered.push(transactions[i].rowIndex);
    }
  }

  return reordered;
}

// =============================================================================
// SCHEMA VALIDATION
// =============================================================================

/**
 * Validate that transactions have required fields
 */
function validateSchema(transactions: ParsedTransaction[]): string[] {
  const violations: string[] = [];
  
  for (const tx of transactions) {
    // Every transaction must have a date
    if (!tx.date || tx.date.trim() === '') {
      violations.push(`Row ${tx.rowIndex}: Missing date`);
    }
    
    // Every transaction must have at least one amount
    if (tx.debit === null && tx.credit === null) {
      violations.push(`Row ${tx.rowIndex}: Missing amount (no debit or credit)`);
    }
    
    // Debit and credit should not both be populated
    if (tx.debit !== null && tx.credit !== null) {
      violations.push(`Row ${tx.rowIndex}: Both debit and credit populated`);
    }
    
    // No negative amounts allowed in output
    if (tx.debit !== null && tx.debit < 0) {
      violations.push(`Row ${tx.rowIndex}: Negative debit value`);
    }
    if (tx.credit !== null && tx.credit < 0) {
      violations.push(`Row ${tx.rowIndex}: Negative credit value`);
    }
  }

  return violations;
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Run mandatory validation - this MUST run after parsing
 * Results are used for:
 * 1. Blocking auto-download on failure
 * 2. Confidence scoring
 * 3. User warnings
 */
export function runMandatoryValidation(
  transactions: ParsedTransaction[],
  openingBalance: number | null,
  closingBalance: number | null
): MandatoryValidationReport {
  // Balance validation
  const balanceResult = validateBalanceEquation(transactions, openingBalance, closingBalance);

  // Duplicate detection
  const duplicateRows = detectDuplicateTransactions(transactions);

  // Order validation
  const reorderedRows = detectReorderedRows(transactions);

  // Schema validation
  const schemaViolations = validateSchema(transactions);

  // Count valid transactions (those that pass individual validation)
  const validTransactionCount = transactions.filter(
    tx => tx.validationStatus === 'valid'
  ).length;

  const passRate = transactions.length > 0
    ? validTransactionCount / transactions.length
    : 0;

  const report: MandatoryValidationReport = {
    openingBalance,
    closingBalance,
    calculatedClosing: balanceResult.calculatedClosing,
    totalCredits: balanceResult.totalCredits,
    totalDebits: balanceResult.totalDebits,
    balanceCheckPassed: balanceResult.passed,
    balanceDiscrepancy: balanceResult.discrepancy,
    duplicateRows,
    reorderedRows,
    schemaViolations,
    transactionCount: transactions.length,
    validTransactionCount,
    passRate,
  };

  console.log('[MandatoryValidation] Report:', {
    balancePassed: report.balanceCheckPassed,
    discrepancy: report.balanceDiscrepancy.toFixed(2),
    duplicates: report.duplicateRows.length,
    reordered: report.reorderedRows.length,
    schemaIssues: report.schemaViolations.length,
    passRate: `${(report.passRate * 100).toFixed(1)}%`,
  });

  return report;
}

/**
 * Check if validation passed (allows export)
 */
export function validationPassed(report: MandatoryValidationReport): boolean {
  // Balance check is critical
  if (!report.balanceCheckPassed && report.openingBalance !== null && report.closingBalance !== null) {
    return false;
  }
  
  // Schema violations are critical
  if (report.schemaViolations.length > 0) {
    return false;
  }
  
  return true;
}

/**
 * Get validation summary for UI
 */
export function getValidationSummaryMessage(report: MandatoryValidationReport): string {
  const issues: string[] = [];
  
  if (!report.balanceCheckPassed && report.openingBalance !== null) {
    issues.push(`Balance mismatch: ${report.balanceDiscrepancy.toFixed(2)}`);
  }
  
  if (report.duplicateRows.length > 0) {
    issues.push(`${report.duplicateRows.length} duplicate(s)`);
  }
  
  if (report.schemaViolations.length > 0) {
    issues.push(`${report.schemaViolations.length} schema issue(s)`);
  }
  
  if (issues.length === 0) {
    return `✓ All ${report.transactionCount} transactions validated`;
  }
  
  return `⚠ Issues: ${issues.join(', ')}`;
}

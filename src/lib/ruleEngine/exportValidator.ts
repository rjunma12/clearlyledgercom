/**
 * Export Validation Agent
 * 
 * Cross-validates extracted PDF data against exported CSV/Excel to ensure
 * 100% data integrity. Detects missing, duplicate, or corrupted records.
 */

import { ParsedTransaction } from './types';

// ============================================================================
// TYPES
// ============================================================================

export type ValidationVerdict = 'EXPORT_COMPLETE' | 'EXPORT_INCOMPLETE';

export interface ExportValidationSummary {
  pdf_pages: number;
  pdf_transactions: number;
  exported_rows: number;
  fully_exported: boolean;
  missing_rows: number;
  duplicate_rows: number;
  corrupted_rows: number;
}

export interface MissingTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  source_page: number;
  row_id: number;
}

export interface CorruptedTransaction {
  issue: 'amount_mismatch' | 'date_mismatch' | 'truncation' | 'column_shift';
  pdf_value: string | number;
  export_value: string | number;
  field: string;
  source_page: number;
  row_id: number;
}

export interface DuplicateInExport {
  date: string;
  amount: number;
  description: string;
  occurrences: number;
  row_indices: number[];
}

export interface ExportValidationResult {
  export_validation: ExportValidationSummary;
  missing_transactions: MissingTransaction[];
  corrupted_transactions: CorruptedTransaction[];
  duplicates_in_csv: DuplicateInExport[];
  confidence_score: number;
  verdict: ValidationVerdict;
  validation_timestamp: string;
}

export interface ExportedRow {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  validationStatus?: string;
}

interface MatchResult {
  matched: boolean;
  exportRowIndex: number | null;
  matchType: 'exact' | 'tolerant' | 'none';
  issues: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize a date string to YYYY-MM-DD format for comparison
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try parsing common formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return dateStr.trim().toLowerCase();
}

/**
 * Normalize amount to number for comparison
 */
function normalizeAmount(amountStr: string | number | null | undefined): number {
  if (amountStr === null || amountStr === undefined || amountStr === '') {
    return 0;
  }
  
  if (typeof amountStr === 'number') {
    return Math.round(amountStr * 100) / 100;
  }
  
  // Remove currency symbols, commas, spaces
  const cleaned = amountStr
    .replace(/[₹$€£¥,\s]/g, '')
    .replace(/\(([^)]+)\)/, '-$1') // Handle parentheses as negative
    .trim();
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

/**
 * Normalize description for comparison
 */
function normalizeDescription(desc: string): string {
  if (!desc) return '';
  return desc
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate Levenshtein distance-based similarity (0-1)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeDescription(str1);
  const s2 = normalizeDescription(str2);
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Simple containment check for efficiency
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.85;
  }
  
  // Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Check if two dates are within tolerance (±1 day)
 */
function datesMatch(date1: string, date2: string, toleranceDays: number = 1): boolean {
  const d1 = new Date(normalizeDate(date1));
  const d2 = new Date(normalizeDate(date2));
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    // Fall back to string comparison
    return normalizeDate(date1) === normalizeDate(date2);
  }
  
  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  return diffDays <= toleranceDays;
}

/**
 * Check if two amounts match within tolerance
 */
function amountsMatch(amt1: number, amt2: number, tolerance: number = 1): boolean {
  return Math.abs(amt1 - amt2) <= tolerance;
}

/**
 * Detect potential truncation (e.g., 3249 → 324)
 */
function detectTruncation(pdfAmt: number, exportAmt: number): boolean {
  if (pdfAmt === 0 || exportAmt === 0) return false;
  
  // Check if one is a truncated version of the other
  const pdfStr = Math.abs(pdfAmt).toString();
  const exportStr = Math.abs(exportAmt).toString();
  
  // Export is missing digits
  if (pdfStr.startsWith(exportStr) && pdfStr.length > exportStr.length) {
    return true;
  }
  
  // PDF is missing digits (less common)
  if (exportStr.startsWith(pdfStr) && exportStr.length > pdfStr.length) {
    return true;
  }
  
  return false;
}

// ============================================================================
// CORE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Count integrity check - compare total transactions
 */
export function countIntegrityCheck(
  pdfTransactions: ParsedTransaction[],
  exportedRows: ExportedRow[]
): { passed: boolean; pdfCount: number; exportCount: number; difference: number } {
  const pdfCount = pdfTransactions.length;
  const exportCount = exportedRows.length;
  
  return {
    passed: pdfCount === exportCount,
    pdfCount,
    exportCount,
    difference: pdfCount - exportCount
  };
}

/**
 * Match a single PDF transaction against exported rows
 */
function matchTransactionRow(
  pdfTx: ParsedTransaction,
  exportedRows: ExportedRow[],
  usedIndices: Set<number>,
  tolerant: boolean = false
): MatchResult {
  const pdfDate = normalizeDate(pdfTx.date);
  const pdfDebit = normalizeAmount(pdfTx.debit);
  const pdfCredit = normalizeAmount(pdfTx.credit);
  const pdfBalance = normalizeAmount(pdfTx.balance);
  const pdfDesc = normalizeDescription(pdfTx.description);
  
  for (let i = 0; i < exportedRows.length; i++) {
    if (usedIndices.has(i)) continue;
    
    const row = exportedRows[i];
    const rowDate = normalizeDate(row.date);
    const rowDebit = normalizeAmount(row.debit);
    const rowCredit = normalizeAmount(row.credit);
    const rowBalance = normalizeAmount(row.balance);
    const rowDesc = normalizeDescription(row.description);
    
    // Exact match
    if (
      pdfDate === rowDate &&
      pdfDebit === rowDebit &&
      pdfCredit === rowCredit &&
      Math.abs(pdfBalance - rowBalance) < 0.01
    ) {
      return { matched: true, exportRowIndex: i, matchType: 'exact', issues: [] };
    }
    
    // Tolerant match (if enabled)
    if (tolerant) {
      const dateOk = datesMatch(pdfDate, rowDate, 1);
      const debitOk = amountsMatch(pdfDebit, rowDebit, 1);
      const creditOk = amountsMatch(pdfCredit, rowCredit, 1);
      const balanceOk = amountsMatch(pdfBalance, rowBalance, 1);
      const descSimilar = stringSimilarity(pdfDesc, rowDesc) >= 0.7;
      
      // Must match on date + at least one amount + description similarity
      if (dateOk && (debitOk || creditOk) && descSimilar) {
        const issues: string[] = [];
        if (!debitOk && pdfDebit > 0) issues.push('debit_mismatch');
        if (!creditOk && pdfCredit > 0) issues.push('credit_mismatch');
        if (!balanceOk) issues.push('balance_mismatch');
        
        return { matched: true, exportRowIndex: i, matchType: 'tolerant', issues };
      }
    }
  }
  
  return { matched: false, exportRowIndex: null, matchType: 'none', issues: ['no_match'] };
}

/**
 * Detect duplicate rows in exported data
 */
export function detectDuplicates(exportedRows: ExportedRow[]): DuplicateInExport[] {
  const duplicates: DuplicateInExport[] = [];
  const seen = new Map<string, { count: number; indices: number[] }>();
  
  exportedRows.forEach((row, index) => {
    // Create a key from date + amount
    const debit = normalizeAmount(row.debit);
    const credit = normalizeAmount(row.credit);
    const amount = debit > 0 ? debit : credit;
    const key = `${normalizeDate(row.date)}|${amount}|${normalizeDescription(row.description).substring(0, 30)}`;
    
    if (seen.has(key)) {
      const entry = seen.get(key)!;
      entry.count++;
      entry.indices.push(index);
    } else {
      seen.set(key, { count: 1, indices: [index] });
    }
  });
  
  // Find entries with count > 1
  seen.forEach((entry, key) => {
    if (entry.count > 1) {
      const [date, amount, desc] = key.split('|');
      duplicates.push({
        date,
        amount: parseFloat(amount),
        description: desc,
        occurrences: entry.count,
        row_indices: entry.indices
      });
    }
  });
  
  return duplicates;
}

/**
 * Detect corruption between PDF and export row
 */
function detectCorruption(
  pdfTx: ParsedTransaction,
  exportRow: ExportedRow,
  rowIndex: number,
  pageNum: number = 1
): CorruptedTransaction[] {
  const corruptions: CorruptedTransaction[] = [];
  
  const pdfDebit = normalizeAmount(pdfTx.debit);
  const pdfCredit = normalizeAmount(pdfTx.credit);
  const pdfBalance = normalizeAmount(pdfTx.balance);
  
  const exportDebit = normalizeAmount(exportRow.debit);
  const exportCredit = normalizeAmount(exportRow.credit);
  const exportBalance = normalizeAmount(exportRow.balance);
  
  // Check debit
  if (pdfDebit > 0 && !amountsMatch(pdfDebit, exportDebit, 0.01)) {
    if (detectTruncation(pdfDebit, exportDebit)) {
      corruptions.push({
        issue: 'truncation',
        pdf_value: pdfDebit,
        export_value: exportDebit,
        field: 'debit',
        source_page: pageNum,
        row_id: rowIndex
      });
    } else {
      corruptions.push({
        issue: 'amount_mismatch',
        pdf_value: pdfDebit,
        export_value: exportDebit,
        field: 'debit',
        source_page: pageNum,
        row_id: rowIndex
      });
    }
  }
  
  // Check credit
  if (pdfCredit > 0 && !amountsMatch(pdfCredit, exportCredit, 0.01)) {
    if (detectTruncation(pdfCredit, exportCredit)) {
      corruptions.push({
        issue: 'truncation',
        pdf_value: pdfCredit,
        export_value: exportCredit,
        field: 'credit',
        source_page: pageNum,
        row_id: rowIndex
      });
    } else {
      corruptions.push({
        issue: 'amount_mismatch',
        pdf_value: pdfCredit,
        export_value: exportCredit,
        field: 'credit',
        source_page: pageNum,
        row_id: rowIndex
      });
    }
  }
  
  // Check balance
  if (pdfBalance > 0 && !amountsMatch(pdfBalance, exportBalance, 0.01)) {
    corruptions.push({
      issue: 'amount_mismatch',
      pdf_value: pdfBalance,
      export_value: exportBalance,
      field: 'balance',
      source_page: pageNum,
      row_id: rowIndex
    });
  }
  
  return corruptions;
}

/**
 * Calculate confidence score based on validation results
 */
function calculateConfidenceScore(
  totalPdf: number,
  matchedExact: number,
  matchedTolerant: number,
  missing: number,
  corrupted: number,
  duplicates: number
): number {
  if (totalPdf === 0) return 1;
  
  // Base score from match rate
  const exactWeight = 1.0;
  const tolerantWeight = 0.9;
  
  const matchScore = (matchedExact * exactWeight + matchedTolerant * tolerantWeight) / totalPdf;
  
  // Penalties
  const missingPenalty = missing * 0.1;
  const corruptedPenalty = corrupted * 0.05;
  const duplicatePenalty = duplicates * 0.02;
  
  const finalScore = Math.max(0, matchScore - missingPenalty - corruptedPenalty - duplicatePenalty);
  
  return Math.round(finalScore * 100) / 100;
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Main export validation function
 * Cross-validates PDF transactions against exported rows
 */
export function validateExport(
  pdfTransactions: ParsedTransaction[],
  exportedRows: ExportedRow[],
  totalPages: number = 1
): ExportValidationResult {
  const missing: MissingTransaction[] = [];
  const corrupted: CorruptedTransaction[] = [];
  const usedExportIndices = new Set<number>();
  
  let matchedExact = 0;
  let matchedTolerant = 0;
  
  // Step 1: Match each PDF transaction
  pdfTransactions.forEach((pdfTx, pdfIndex) => {
    // Try exact match first
    let result = matchTransactionRow(pdfTx, exportedRows, usedExportIndices, false);
    
    if (!result.matched) {
      // Try tolerant match
      result = matchTransactionRow(pdfTx, exportedRows, usedExportIndices, true);
    }
    
    if (result.matched && result.exportRowIndex !== null) {
      usedExportIndices.add(result.exportRowIndex);
      
      if (result.matchType === 'exact') {
        matchedExact++;
      } else {
        matchedTolerant++;
        // Check for corruption on tolerant matches
        const exportRow = exportedRows[result.exportRowIndex];
        const corruptionIssues = detectCorruption(pdfTx, exportRow, pdfIndex);
        corrupted.push(...corruptionIssues);
      }
    } else {
      // Transaction not found in export
      const debit = normalizeAmount(pdfTx.debit);
      const credit = normalizeAmount(pdfTx.credit);
      
      missing.push({
        date: pdfTx.date,
        description: pdfTx.description,
        amount: debit > 0 ? debit : credit,
        type: debit > 0 ? 'debit' : 'credit',
        source_page: 1, // Page number tracked externally if needed
        row_id: pdfIndex
      });
    }
  });
  
  // Step 2: Detect duplicates in export
  const duplicates = detectDuplicates(exportedRows);
  
  // Step 3: Calculate confidence score
  const confidenceScore = calculateConfidenceScore(
    pdfTransactions.length,
    matchedExact,
    matchedTolerant,
    missing.length,
    corrupted.length,
    duplicates.length
  );
  
  // Step 4: Determine verdict
  const fullyExported = 
    missing.length === 0 && 
    corrupted.length === 0 && 
    pdfTransactions.length === exportedRows.length;
  
  const verdict: ValidationVerdict = fullyExported ? 'EXPORT_COMPLETE' : 'EXPORT_INCOMPLETE';
  
  return {
    export_validation: {
      pdf_pages: totalPages,
      pdf_transactions: pdfTransactions.length,
      exported_rows: exportedRows.length,
      fully_exported: fullyExported,
      missing_rows: missing.length,
      duplicate_rows: duplicates.reduce((sum, d) => sum + d.occurrences - 1, 0),
      corrupted_rows: corrupted.length
    },
    missing_transactions: missing,
    corrupted_transactions: corrupted,
    duplicates_in_csv: duplicates,
    confidence_score: confidenceScore,
    verdict,
    validation_timestamp: new Date().toISOString()
  };
}

/**
 * Quick pre-export validation check
 * Returns true if export should proceed, false if there are blocking issues
 */
export function preExportCheck(
  transactions: ParsedTransaction[]
): { canExport: boolean; reason?: string; transactionCount: number } {
  if (!transactions || transactions.length === 0) {
    return {
      canExport: false,
      reason: 'No transactions extracted from PDF',
      transactionCount: 0
    };
  }
  
  // Check for basic data integrity
  const validTransactions = transactions.filter(tx => 
    tx.date && 
    (tx.debit !== null || tx.credit !== null || tx.balance !== null)
  );
  
  if (validTransactions.length === 0) {
    return {
      canExport: false,
      reason: 'No valid transaction data found (missing dates or amounts)',
      transactionCount: 0
    };
  }
  
  const invalidCount = transactions.length - validTransactions.length;
  if (invalidCount > transactions.length * 0.5) {
    return {
      canExport: false,
      reason: `Too many invalid transactions: ${invalidCount} of ${transactions.length}`,
      transactionCount: validTransactions.length
    };
  }
  
  return {
    canExport: true,
    transactionCount: validTransactions.length
  };
}

/**
 * Generate human-readable validation summary
 */
export function getValidationSummary(result: ExportValidationResult): string {
  const { export_validation, verdict, confidence_score } = result;
  
  if (verdict === 'EXPORT_COMPLETE') {
    return `✓ Export validated: ${export_validation.pdf_transactions} transactions exported successfully (${Math.round(confidence_score * 100)}% confidence)`;
  }
  
  const issues: string[] = [];
  if (export_validation.missing_rows > 0) {
    issues.push(`${export_validation.missing_rows} missing`);
  }
  if (export_validation.corrupted_rows > 0) {
    issues.push(`${export_validation.corrupted_rows} corrupted`);
  }
  if (export_validation.duplicate_rows > 0) {
    issues.push(`${export_validation.duplicate_rows} duplicates`);
  }
  
  return `⚠ Export incomplete: ${issues.join(', ')} (${Math.round(confidence_score * 100)}% confidence)`;
}

/**
 * Generate detailed human-readable failure message with row-level details
 */
export function getDetailedFailureMessage(result: ExportValidationResult): string {
  const { export_validation, missing_transactions, corrupted_transactions, confidence_score } = result;
  
  const lines: string[] = [];
  
  // Header
  lines.push(`Export Validation Failed (${Math.round(confidence_score * 100)}% confidence)`);
  lines.push('');
  
  // Summary
  lines.push(`PDF Transactions: ${export_validation.pdf_transactions}`);
  lines.push(`Exported Rows: ${export_validation.exported_rows}`);
  lines.push('');
  
  // Missing transactions
  if (missing_transactions.length > 0) {
    lines.push(`❌ MISSING TRANSACTIONS (${missing_transactions.length}):`);
    missing_transactions.slice(0, 5).forEach((tx, i) => {
      lines.push(`   ${i + 1}. ${tx.date} | ${tx.description.substring(0, 40)}... | ${tx.type === 'debit' ? '-' : '+'}${tx.amount.toLocaleString()}`);
    });
    if (missing_transactions.length > 5) {
      lines.push(`   ... and ${missing_transactions.length - 5} more`);
    }
    lines.push('');
  }
  
  // Corrupted data
  if (corrupted_transactions.length > 0) {
    lines.push(`⚠️ DATA DISCREPANCIES (${corrupted_transactions.length}):`);
    corrupted_transactions.slice(0, 5).forEach((tx, i) => {
      const issueType = tx.issue === 'truncation' ? 'TRUNCATED' : 
                        tx.issue === 'amount_mismatch' ? 'MISMATCH' : 
                        tx.issue.toUpperCase();
      lines.push(`   ${i + 1}. Row ${tx.row_id}: ${issueType} - ${tx.field} (PDF: ${tx.pdf_value} → Export: ${tx.export_value})`);
    });
    if (corrupted_transactions.length > 5) {
      lines.push(`   ... and ${corrupted_transactions.length - 5} more`);
    }
    lines.push('');
  }
  
  // Action required
  if (missing_transactions.length > 0) {
    lines.push('🚫 Export is BLOCKED. Please contact support with your PDF file.');
  } else {
    lines.push('⚠️ Export can proceed with warnings. Review the data before using.');
  }
  
  return lines.join('\n');
}

/**
 * Get a short, user-friendly error message for toasts
 */
export function getShortErrorMessage(result: ExportValidationResult): string {
  const { export_validation, missing_transactions, corrupted_transactions } = result;
  
  if (missing_transactions.length > 0) {
    const firstMissing = missing_transactions[0];
    if (missing_transactions.length === 1) {
      return `Missing transaction: ${firstMissing.date} - ${firstMissing.description.substring(0, 20)}... (${firstMissing.type === 'debit' ? '-' : '+'}${firstMissing.amount.toLocaleString()})`;
    }
    return `${missing_transactions.length} transactions missing from export. Row ${firstMissing.row_id} and ${missing_transactions.length - 1} others.`;
  }
  
  if (corrupted_transactions.length > 0) {
    const first = corrupted_transactions[0];
    if (first.issue === 'truncation') {
      return `Data truncation detected: Row ${first.row_id} ${first.field} shows ${first.export_value} instead of ${first.pdf_value}`;
    }
    return `${corrupted_transactions.length} data discrepancy(s): Row ${first.row_id} ${first.field} mismatch`;
  }
  
  if (export_validation.duplicate_rows > 0) {
    return `${export_validation.duplicate_rows} potential duplicate(s) detected in export`;
  }
  
  return `Export validation failed: ${export_validation.missing_rows} missing, ${export_validation.corrupted_rows} corrupted`;
}

/**
 * Determine if export should be blocked based on validation result
 * 
 * UPDATED: Allow export with small discrepancies (< $1 total)
 * Only block for missing transactions or large discrepancies
 */
export function shouldBlockExport(result: ExportValidationResult): { blocked: boolean; reason: string } {
  const { missing_transactions, corrupted_transactions, confidence_score } = result;
  
  // Block if any transactions are missing
  if (missing_transactions.length > 0) {
    return {
      blocked: true,
      reason: `Export blocked: ${missing_transactions.length} transaction(s) would be missing from the export file. This indicates a data processing error.`
    };
  }
  
  // Calculate total discrepancy from corrupted transactions
  const totalDiscrepancy = corrupted_transactions.reduce((sum, tx) => {
    const pdfVal = typeof tx.pdf_value === 'number' ? tx.pdf_value : parseFloat(String(tx.pdf_value)) || 0;
    const exportVal = typeof tx.export_value === 'number' ? tx.export_value : parseFloat(String(tx.export_value)) || 0;
    return sum + Math.abs(pdfVal - exportVal);
  }, 0);
  
  // Allow export if total discrepancy is small (< $1)
  if (totalDiscrepancy > 1.0) {
    return {
      blocked: true,
      reason: `Export blocked: Total data discrepancy of ${totalDiscrepancy.toFixed(2)} detected across ${corrupted_transactions.length} transaction(s).`
    };
  }
  
  // Block if confidence is extremely low
  if (confidence_score < 0.5) {
    return {
      blocked: true,
      reason: `Export blocked: Data confidence is only ${Math.round(confidence_score * 100)}%. The export may contain significant errors.`
    };
  }
  
  return { blocked: false, reason: '' };
}

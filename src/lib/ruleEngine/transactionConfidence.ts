/**
 * Per-Transaction Confidence Scoring Module
 * Provides row-level quality metrics with A-F grading
 */

import type { ParsedTransaction, RawTransaction, ValidationStatus } from './types';

// =============================================================================
// CONFIDENCE TYPES
// =============================================================================

export interface TransactionConfidence {
  overall: number;           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    dateConfidence: number;        // Was date parsed cleanly?
    amountConfidence: number;      // Were amounts numeric?
    balanceConfidence: number;     // Did balance validate?
    ocrConfidence?: number;        // OCR quality if applicable
    descriptionConfidence: number; // Description completeness
  };
  flags: string[];           // Specific concerns
}

// Weights for calculating overall confidence
const CONFIDENCE_WEIGHTS = {
  date: 0.20,
  amount: 0.30,
  balance: 0.30,
  description: 0.20,
};

// =============================================================================
// CONFIDENCE CALCULATION
// =============================================================================

/**
 * Calculate confidence score for a single transaction
 * Returns overall score (0-100), letter grade, and specific flags
 */
export function calculateTransactionConfidence(
  transaction: ParsedTransaction,
  rawTransaction?: RawTransaction
): TransactionConfidence {
  const flags: string[] = [];

  // -------------------------------------------------------------------------
  // Date confidence
  // -------------------------------------------------------------------------
  let dateConfidence = 100;
  if (!transaction.date || transaction.date.length === 0) {
    dateConfidence = 0;
    flags.push('Missing date');
  } else if (transaction.date.includes('NaN') || transaction.date === 'Invalid Date') {
    dateConfidence = 20;
    flags.push('Invalid date format');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction.date)) {
    dateConfidence = 60;
    flags.push('Non-standard date format');
  }

  // -------------------------------------------------------------------------
  // Amount confidence
  // -------------------------------------------------------------------------
  let amountConfidence = 100;
  if (transaction.debit === null && transaction.credit === null) {
    amountConfidence = 50;
    flags.push('No amount detected');
  } else if (transaction.debit !== null && transaction.credit !== null) {
    // Both shouldn't be set for a single transaction
    amountConfidence = 70;
    flags.push('Both debit and credit present');
  } else if ((transaction.debit !== null && transaction.debit < 0) || 
             (transaction.credit !== null && transaction.credit < 0)) {
    amountConfidence = 60;
    flags.push('Negative amount detected');
  }

  // -------------------------------------------------------------------------
  // Balance confidence (based on validation status)
  // -------------------------------------------------------------------------
  let balanceConfidence = 100;
  if (transaction.validationStatus === 'error') {
    balanceConfidence = 20;
    flags.push('Balance mismatch');
  } else if (transaction.validationStatus === 'warning') {
    balanceConfidence = 60;
    flags.push('Balance warning');
  } else if (transaction.validationStatus === 'unchecked') {
    balanceConfidence = 80;
    flags.push('Balance unchecked');
  } else if (transaction.balance === 0) {
    // Zero balance might be unusual but valid
    balanceConfidence = 90;
  }

  // -------------------------------------------------------------------------
  // Description confidence
  // -------------------------------------------------------------------------
  let descriptionConfidence = 100;
  if (!transaction.description || transaction.description.trim().length === 0) {
    descriptionConfidence = 30;
    flags.push('Missing description');
  } else if (transaction.description.length < 3) {
    descriptionConfidence = 50;
    flags.push('Very short description');
  } else if (transaction.isStitchedRow) {
    // Slight penalty for stitched rows (may have merging issues)
    descriptionConfidence = 90;
  }
  
  // Check for gibberish patterns (common OCR failures)
  if (transaction.description && hasGibberishPattern(transaction.description)) {
    descriptionConfidence = Math.min(descriptionConfidence, 40);
    flags.push('Possible OCR gibberish');
  }

  // -------------------------------------------------------------------------
  // OCR confidence (if raw elements are available)
  // -------------------------------------------------------------------------
  let ocrConfidence: number | undefined = undefined;
  if (rawTransaction?.elements) {
    const ocrElements = rawTransaction.elements.filter(
      e => e.source === 'ocr' && e.confidence !== undefined
    );
    
    if (ocrElements.length > 0) {
      const sumConfidence = ocrElements.reduce(
        (sum, e) => sum + (e.confidence || 0), 
        0
      );
      ocrConfidence = Math.round((sumConfidence / ocrElements.length) * 100);
      
      if (ocrConfidence < 70) {
        flags.push('Low OCR confidence');
      }
    }
  }

  // -------------------------------------------------------------------------
  // Calculate weighted overall score
  // -------------------------------------------------------------------------
  const overall = Math.round(
    dateConfidence * CONFIDENCE_WEIGHTS.date +
    amountConfidence * CONFIDENCE_WEIGHTS.amount +
    balanceConfidence * CONFIDENCE_WEIGHTS.balance +
    descriptionConfidence * CONFIDENCE_WEIGHTS.description
  );

  // Factor in OCR confidence if available (reduces overall by up to 10%)
  const adjustedOverall = ocrConfidence !== undefined
    ? Math.round(overall * (0.9 + (ocrConfidence / 1000)))
    : overall;

  // -------------------------------------------------------------------------
  // Determine letter grade
  // -------------------------------------------------------------------------
  const grade = getLetterGrade(adjustedOverall);

  return {
    overall: Math.min(100, Math.max(0, adjustedOverall)),
    grade,
    factors: {
      dateConfidence,
      amountConfidence,
      balanceConfidence,
      ocrConfidence,
      descriptionConfidence,
    },
    flags,
  };
}

/**
 * Convert numeric score to letter grade
 */
function getLetterGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A';
  if (score >= 85) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Check for common gibberish patterns that indicate OCR failure
 */
function hasGibberishPattern(text: string): boolean {
  // Too many consecutive consonants
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(text)) return true;
  
  // Too many numbers mixed with random letters
  if (/\d[a-z]\d[a-z]\d/i.test(text)) return true;
  
  // High ratio of special characters
  const specialCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (text.length > 5 && specialCount / text.length > 0.3) return true;
  
  // Repeated characters
  if (/(.)\1{4,}/.test(text)) return true;
  
  return false;
}

// =============================================================================
// ROW-LEVEL CONFIDENCE WITH FALLBACK
// =============================================================================

export interface RowConfidenceResult {
  rowIndex: number;
  overallScore: number;
  breakdown: {
    dateClarity: number;
    amountPresence: number;
    balanceIntegrity: number;
    descriptionQuality: number;
  };
  flags: string[];
  needsReview: boolean;
}

/**
 * Score a transaction row for confidence with detailed breakdown
 * Used for row-level fallback decisions
 */
export function scoreTransactionRow(
  tx: ParsedTransaction,
  prevBalance: number | null
): RowConfidenceResult {
  const flags: string[] = [];
  
  // Date clarity (0-100)
  let dateClarity = 0;
  if (tx.date && tx.date.length > 0) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
      dateClarity = 100;
    } else {
      dateClarity = 50;
      flags.push('Non-standard date');
    }
  } else {
    flags.push('Missing date');
  }
  
  // Amount presence (0-100)
  let amountPresence = 0;
  if (tx.debit !== null || tx.credit !== null) {
    amountPresence = 100;
    if (tx.debit !== null && tx.credit !== null) {
      amountPresence = 70; // Unusual to have both
      flags.push('Both debit and credit');
    }
  } else {
    flags.push('No amount');
  }
  
  // Balance integrity (0-100)
  let balanceIntegrity = 100;
  if (prevBalance !== null && tx.balance !== undefined) {
    const expected = prevBalance + (tx.credit ?? 0) - (tx.debit ?? 0);
    const diff = Math.abs(expected - tx.balance);
    
    if (diff > 1.00) {
      balanceIntegrity = 0;
      flags.push('Balance mismatch');
    } else if (diff > 0.10) {
      balanceIntegrity = 50;
      flags.push('Balance rounding');
    } else if (diff > 0.01) {
      balanceIntegrity = 80;
    }
  } else if (tx.validationStatus === 'error') {
    balanceIntegrity = 20;
    flags.push('Validation error');
  } else if (tx.validationStatus === 'warning') {
    balanceIntegrity = 60;
    flags.push('Validation warning');
  }
  
  // Description quality (0-100)
  let descriptionQuality = 100;
  if (!tx.description || tx.description.trim().length === 0) {
    descriptionQuality = 30;
    flags.push('Missing description');
  } else if (tx.description.length < 3) {
    descriptionQuality = 50;
    flags.push('Short description');
  } else if (hasGibberishPattern(tx.description)) {
    descriptionQuality = 40;
    flags.push('Possible OCR error');
  }
  
  // Calculate weighted overall
  const overallScore = Math.round(
    dateClarity * 0.20 +
    amountPresence * 0.30 +
    balanceIntegrity * 0.30 +
    descriptionQuality * 0.20
  );
  
  return {
    rowIndex: tx.rowIndex,
    overallScore,
    breakdown: {
      dateClarity,
      amountPresence,
      balanceIntegrity,
      descriptionQuality,
    },
    flags,
    needsReview: overallScore < 70,
  };
}

/**
 * Score all transactions and identify those needing review
 */
export function scoreAllTransactions(
  transactions: ParsedTransaction[]
): RowConfidenceResult[] {
  const results: RowConfidenceResult[] = [];
  let prevBalance: number | null = null;
  
  for (const tx of transactions) {
    const result = scoreTransactionRow(tx, prevBalance);
    results.push(result);
    prevBalance = tx.balance;
  }
  
  return results;
}

// =============================================================================
// AGGREGATION FUNCTIONS
// =============================================================================

export interface AggregateConfidenceResult {
  average: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  lowConfidenceCount: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  commonFlags: Array<{ flag: string; count: number }>;
}

/**
 * Aggregate confidence scores across all transactions
 * Returns summary statistics for document-level quality assessment
 */
export function aggregateConfidenceScores(
  confidences: TransactionConfidence[]
): AggregateConfidenceResult {
  if (confidences.length === 0) {
    return {
      average: 0,
      grade: 'F',
      lowConfidenceCount: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
      commonFlags: [],
    };
  }

  // Calculate average
  const average = Math.round(
    confidences.reduce((sum, c) => sum + c.overall, 0) / confidences.length
  );

  // Count low confidence transactions (below 70)
  const lowConfidenceCount = confidences.filter(c => c.overall < 70).length;

  // Grade distribution
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const c of confidences) {
    gradeDistribution[c.grade]++;
  }

  // Collect and count flags
  const flagCounts: Record<string, number> = {};
  for (const c of confidences) {
    for (const flag of c.flags) {
      flagCounts[flag] = (flagCounts[flag] || 0) + 1;
    }
  }

  // Sort flags by frequency
  const commonFlags = Object.entries(flagCounts)
    .map(([flag, count]) => ({ flag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 flags

  return {
    average,
    grade: getLetterGrade(average),
    lowConfidenceCount,
    gradeDistribution,
    commonFlags,
  };
}

/**
 * Enrich transactions with confidence scores
 * Returns transactions with confidence field populated
 */
export function enrichTransactionsWithConfidence(
  transactions: ParsedTransaction[],
  rawTransactions?: RawTransaction[]
): ParsedTransaction[] {
  return transactions.map((tx, index) => ({
    ...tx,
    confidence: calculateTransactionConfidence(
      tx,
      rawTransactions?.[index]
    ),
  }));
}

/**
 * Get transactions that need manual review (low confidence)
 */
export function getTransactionsNeedingReview(
  transactions: ParsedTransaction[],
  threshold: number = 70
): ParsedTransaction[] {
  return transactions.filter(tx => {
    if (!tx.confidence) return false;
    return tx.confidence.overall < threshold;
  });
}

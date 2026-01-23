/**
 * Duplicate Transaction Detector
 * Identifies potential duplicate transactions when merging multiple bank statements
 */

import { ParsedTransaction } from './types';

export interface DuplicateDetectionOptions {
  /** Enable duplicate detection */
  enabled: boolean;
  /** Date tolerance in days (transactions within this range are candidates) */
  dateTolerance: number;
  /** Minimum description similarity score (0-1) to flag as duplicate */
  descriptionSimilarityThreshold: number;
  /** Whether amounts must match exactly */
  requireExactAmount: boolean;
  /** Amount tolerance as percentage (e.g., 0.01 = 1%) when not exact */
  amountTolerance: number;
}

export const DEFAULT_DUPLICATE_OPTIONS: DuplicateDetectionOptions = {
  enabled: true,
  dateTolerance: 1, // Same day or adjacent day
  descriptionSimilarityThreshold: 0.7,
  requireExactAmount: true,
  amountTolerance: 0.01,
};

export interface DuplicateGroup {
  /** Indices of transactions that are potential duplicates */
  transactionIndices: number[];
  /** Confidence score for this being a true duplicate (0-1) */
  confidence: number;
  /** Reason for flagging */
  reason: string;
  /** Source files involved */
  sourceFiles: string[];
}

export interface DuplicateDetectionResult {
  /** Groups of potential duplicates */
  duplicateGroups: DuplicateGroup[];
  /** Total number of transactions flagged as potential duplicates */
  totalFlagged: number;
  /** Warnings generated during detection */
  warnings: string[];
}

// Extended transaction with source tracking for duplicate detection
interface TransactionWithMeta extends ParsedTransaction {
  originalIndex: number;
  sourceFileName?: string;
  fileIndex?: number;
}

/**
 * Detect potential duplicate transactions in a list
 */
export function detectDuplicates(
  transactions: ParsedTransaction[],
  options: Partial<DuplicateDetectionOptions> = {}
): DuplicateDetectionResult {
  const opts = { ...DEFAULT_DUPLICATE_OPTIONS, ...options };
  
  if (!opts.enabled || transactions.length < 2) {
    return { duplicateGroups: [], totalFlagged: 0, warnings: [] };
  }

  const duplicateGroups: DuplicateGroup[] = [];
  const warnings: string[] = [];
  const processedPairs = new Set<string>();

  // Add original index to each transaction
  const txWithMeta: TransactionWithMeta[] = transactions.map((tx, idx) => ({
    ...tx,
    originalIndex: idx,
  }));

  // Compare each transaction with others
  for (let i = 0; i < txWithMeta.length; i++) {
    const tx1 = txWithMeta[i];
    const potentialDuplicates: number[] = [i];
    let highestConfidence = 0;
    let matchReason = '';
    const involvedFiles = new Set<string>();
    
    if (tx1.sourceFileName) {
      involvedFiles.add(tx1.sourceFileName);
    }

    for (let j = i + 1; j < txWithMeta.length; j++) {
      const tx2 = txWithMeta[j];
      const pairKey = `${i}-${j}`;
      
      // Skip if already processed
      if (processedPairs.has(pairKey)) continue;

      // Check if these could be duplicates
      const result = compareTransactions(tx1, tx2, opts);
      
      if (result.isDuplicate) {
        processedPairs.add(pairKey);
        potentialDuplicates.push(j);
        
        if (result.confidence > highestConfidence) {
          highestConfidence = result.confidence;
          matchReason = result.reason;
        }
        
        if (tx2.sourceFileName) {
          involvedFiles.add(tx2.sourceFileName);
        }
      }
    }

    // If we found duplicates for this transaction
    if (potentialDuplicates.length > 1) {
      // Check if this group overlaps with an existing group
      const existingGroupIndex = duplicateGroups.findIndex(group =>
        group.transactionIndices.some(idx => potentialDuplicates.includes(idx))
      );

      if (existingGroupIndex >= 0) {
        // Merge with existing group
        const existingGroup = duplicateGroups[existingGroupIndex];
        const mergedIndices = [...new Set([...existingGroup.transactionIndices, ...potentialDuplicates])];
        existingGroup.transactionIndices = mergedIndices;
        existingGroup.confidence = Math.max(existingGroup.confidence, highestConfidence);
        existingGroup.sourceFiles = [...new Set([...existingGroup.sourceFiles, ...involvedFiles])];
      } else {
        // Create new group
        duplicateGroups.push({
          transactionIndices: potentialDuplicates,
          confidence: highestConfidence,
          reason: matchReason,
          sourceFiles: Array.from(involvedFiles),
        });
      }
    }
  }

  // Count total flagged transactions
  const flaggedIndices = new Set<number>();
  duplicateGroups.forEach(group => {
    group.transactionIndices.forEach(idx => flaggedIndices.add(idx));
  });

  // Generate summary warning
  if (duplicateGroups.length > 0) {
    warnings.push(
      `Found ${duplicateGroups.length} potential duplicate group(s) affecting ${flaggedIndices.size} transactions`
    );
  }

  return {
    duplicateGroups,
    totalFlagged: flaggedIndices.size,
    warnings,
  };
}

/**
 * Compare two transactions to determine if they might be duplicates
 */
function compareTransactions(
  tx1: TransactionWithMeta,
  tx2: TransactionWithMeta,
  options: DuplicateDetectionOptions
): { isDuplicate: boolean; confidence: number; reason: string } {
  // Skip if from same file (not cross-file duplicates)
  if (tx1.fileIndex !== undefined && tx1.fileIndex === tx2.fileIndex) {
    return { isDuplicate: false, confidence: 0, reason: '' };
  }

  // Check date proximity
  const date1 = parseDate(tx1.date);
  const date2 = parseDate(tx2.date);
  
  if (!date1 || !date2) {
    return { isDuplicate: false, confidence: 0, reason: '' };
  }

  const daysDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff > options.dateTolerance) {
    return { isDuplicate: false, confidence: 0, reason: '' };
  }

  // Check amount match
  const amount1 = getTransactionAmount(tx1);
  const amount2 = getTransactionAmount(tx2);
  
  let amountMatch = false;
  let amountConfidence = 0;
  
  if (options.requireExactAmount) {
    amountMatch = amount1 === amount2;
    amountConfidence = amountMatch ? 1 : 0;
  } else {
    const maxAmount = Math.max(Math.abs(amount1), Math.abs(amount2));
    if (maxAmount > 0) {
      const diff = Math.abs(amount1 - amount2) / maxAmount;
      amountMatch = diff <= options.amountTolerance;
      amountConfidence = amountMatch ? (1 - diff) : 0;
    } else {
      amountMatch = amount1 === amount2;
      amountConfidence = amountMatch ? 1 : 0;
    }
  }

  if (!amountMatch) {
    return { isDuplicate: false, confidence: 0, reason: '' };
  }

  // Check description similarity
  const descSimilarity = calculateSimilarity(
    normalizeDescription(tx1.description),
    normalizeDescription(tx2.description)
  );

  if (descSimilarity < options.descriptionSimilarityThreshold) {
    return { isDuplicate: false, confidence: 0, reason: '' };
  }

  // Calculate overall confidence
  const dateConfidence = 1 - (daysDiff / (options.dateTolerance + 1));
  const overallConfidence = (dateConfidence * 0.3 + amountConfidence * 0.4 + descSimilarity * 0.3);

  // Build reason string
  const reasons: string[] = [];
  if (daysDiff === 0) {
    reasons.push('same date');
  } else {
    reasons.push(`${daysDiff.toFixed(0)} day(s) apart`);
  }
  reasons.push(`amount: ${formatAmount(amount1)}`);
  reasons.push(`${Math.round(descSimilarity * 100)}% description match`);

  return {
    isDuplicate: true,
    confidence: overallConfidence,
    reason: reasons.join(', '),
  };
}

/**
 * Get the effective amount (debit or credit) from a transaction
 */
function getTransactionAmount(tx: ParsedTransaction): number {
  if (tx.debit !== null && tx.debit > 0) {
    return -tx.debit; // Negative for debits
  }
  if (tx.credit !== null && tx.credit > 0) {
    return tx.credit; // Positive for credits
  }
  return 0;
}

/**
 * Normalize description for comparison
 */
function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate Jaccard similarity between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  // Use word-based Jaccard similarity
  const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(str2.split(' ').filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) {
    // Fall back to character-based for short descriptions
    return levenshteinSimilarity(str1, str2);
  }

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Calculate Levenshtein-based similarity (0-1)
 */
function levenshteinSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLen);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Use a single array for space optimization
  const prev = Array(n + 1).fill(0).map((_, i) => i);
  const curr = Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // Deletion
        curr[j - 1] + 1,  // Insertion
        prev[j - 1] + cost // Substitution
      );
    }
    // Swap arrays
    for (let j = 0; j <= n; j++) {
      prev[j] = curr[j];
    }
  }

  return prev[n];
}

/**
 * Format amount for display
 */
function formatAmount(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '+';
  return `${sign}$${absAmount.toFixed(2)}`;
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    /^(\d{2})-(\d{2})-(\d{4})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
  }

  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? null : new Date(parsed);
}

/**
 * Mark transactions as potential duplicates
 */
export function flagDuplicatesInTransactions(
  transactions: ParsedTransaction[],
  duplicateResult: DuplicateDetectionResult
): ParsedTransaction[] {
  // Create a map of transaction index to duplicate info
  const duplicateMap = new Map<number, { groupIndex: number; confidence: number }>();
  
  duplicateResult.duplicateGroups.forEach((group, groupIndex) => {
    group.transactionIndices.forEach(txIndex => {
      duplicateMap.set(txIndex, { groupIndex, confidence: group.confidence });
    });
  });

  // Update transactions with duplicate flags
  return transactions.map((tx, index) => {
    const duplicateInfo = duplicateMap.get(index);
    
    if (duplicateInfo) {
      return {
        ...tx,
        validationStatus: tx.validationStatus === 'error' ? 'error' : 'warning' as const,
        validationMessage: tx.validationMessage 
          ? `${tx.validationMessage}; Potential duplicate (${Math.round(duplicateInfo.confidence * 100)}% confidence)`
          : `Potential duplicate (${Math.round(duplicateInfo.confidence * 100)}% confidence)`,
        notes: [
          ...(tx.notes || []),
          `Duplicate group #${duplicateInfo.groupIndex + 1}`,
        ],
      };
    }
    
    return tx;
  });
}

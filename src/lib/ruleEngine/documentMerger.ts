/**
 * Document Merger - Combines multiple ParsedDocuments into a single consolidated output
 * Premium feature for Professional and Business tiers
 */

import { 
  ParsedDocument, 
  ParsedTransaction, 
  DocumentSegment, 
  ValidationStatus 
} from './types';
import { 
  detectDuplicates, 
  flagDuplicatesInTransactions,
  DuplicateDetectionOptions,
  DuplicateDetectionResult,
  DEFAULT_DUPLICATE_OPTIONS,
  DuplicateGroup
} from './duplicateDetector';

export interface MergeOptions {
  sortByDate: boolean;
  addSourceColumn: boolean;
  validateContinuity: boolean;
  handleGaps: 'warn' | 'ignore' | 'flag';
  /** Duplicate detection options */
  duplicateDetection: Partial<DuplicateDetectionOptions>;
}

export const DEFAULT_MERGE_OPTIONS: MergeOptions = {
  sortByDate: true,
  addSourceColumn: true,
  validateContinuity: false,
  handleGaps: 'warn',
  duplicateDetection: DEFAULT_DUPLICATE_OPTIONS,
};

export interface MergeResult {
  document: ParsedDocument;
  warnings: string[];
  sourceFiles: string[];
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
  gaps: Array<{
    afterFile: string;
    beforeFile: string;
    gapDays: number;
  }>;
  /** Duplicate detection results */
  duplicates: {
    detected: boolean;
    groups: DuplicateGroup[];
    totalFlagged: number;
  };
}

// Extended transaction type for merged documents (internal use)
interface MergedTransaction extends ParsedTransaction {
  sourceFileName?: string;
  fileIndex?: number;
}

/**
 * Merge multiple ParsedDocuments into a single consolidated document
 */
export function mergeDocuments(
  documents: ParsedDocument[],
  fileNames: string[],
  options: Partial<MergeOptions> = {}
): MergeResult {
  const opts = { ...DEFAULT_MERGE_OPTIONS, ...options };
  const warnings: string[] = [];
  const gaps: MergeResult['gaps'] = [];

  if (documents.length === 0) {
    return {
      document: createEmptyDocument(),
      warnings: ['No documents to merge'],
      sourceFiles: [],
      dateRange: { earliest: null, latest: null },
      gaps: [],
      duplicates: { detected: false, groups: [], totalFlagged: 0 },
    };
  }

  if (documents.length === 1) {
    const doc = documents[0];
    return {
      document: doc,
      warnings: [],
      sourceFiles: fileNames,
      dateRange: getDateRange(doc),
      gaps: [],
      duplicates: { detected: false, groups: [], totalFlagged: 0 },
    };
  }

  // Collect all transactions from all documents
  let allTransactions: MergedTransaction[] = [];
  
  documents.forEach((doc, docIndex) => {
    const fileName = fileNames[docIndex] || `File ${docIndex + 1}`;
    
    doc.segments.forEach(segment => {
      segment.transactions.forEach(tx => {
        const mergedTx: MergedTransaction = {
          ...tx,
          sourceFileName: opts.addSourceColumn ? fileName : undefined,
          fileIndex: docIndex,
        };
        allTransactions.push(mergedTx);
      });
    });
  });

  // Sort by date if requested
  if (opts.sortByDate) {
    allTransactions.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  }

  // Detect date gaps between files
  if (opts.validateContinuity && fileNames.length > 1) {
    const fileRanges = documents.map((doc, idx) => ({
      fileName: fileNames[idx],
      ...getDateRange(doc),
    }));

    // Sort by earliest date
    fileRanges.sort((a, b) => {
      if (!a.earliest || !b.earliest) return 0;
      return parseDate(a.earliest)!.getTime() - parseDate(b.earliest)!.getTime();
    });

    for (let i = 0; i < fileRanges.length - 1; i++) {
      const current = fileRanges[i];
      const next = fileRanges[i + 1];
      
      if (current.latest && next.earliest) {
        const endDate = parseDate(current.latest);
        const startDate = parseDate(next.earliest);
        
        if (endDate && startDate) {
          const gapDays = Math.floor((startDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (gapDays > 1) {
            gaps.push({
              afterFile: current.fileName,
              beforeFile: next.fileName,
              gapDays,
            });
            
            if (opts.handleGaps === 'warn') {
              warnings.push(`${gapDays} day gap detected between "${current.fileName}" and "${next.fileName}"`);
            }
          }
        }
      }
    }
  }

  // Detect duplicate transactions
  let duplicateResult: DuplicateDetectionResult = { duplicateGroups: [], totalFlagged: 0, warnings: [] };
  
  if (opts.duplicateDetection?.enabled !== false) {
    duplicateResult = detectDuplicates(allTransactions, opts.duplicateDetection);
    
    // Add duplicate warnings
    duplicateResult.warnings.forEach(w => warnings.push(w));
    
    // Flag duplicates in transactions
    if (duplicateResult.totalFlagged > 0) {
      allTransactions = flagDuplicatesInTransactions(allTransactions, duplicateResult) as MergedTransaction[];
    }
  }

  // Re-index transactions after sorting
  allTransactions.forEach((tx, idx) => {
    tx.rowIndex = idx;
  });

  // Create merged segment
  const mergedSegment: DocumentSegment = {
    segmentIndex: 0,
    startPage: 1,
    endPage: documents.reduce((sum, doc) => sum + (doc.totalPages || 0), 0),
    openingBalance: documents[0]?.segments[0]?.openingBalance ?? 0,
    closingBalance: documents[documents.length - 1]?.segments[documents[documents.length - 1].segments.length - 1]?.closingBalance,
    statementPeriod: getMergedPeriod(documents),
    transactions: allTransactions,
  };

  // Count validation statuses (including duplicate-flagged warnings)
  const validCount = allTransactions.filter(tx => tx.validationStatus === 'valid').length;
  const errorCount = allTransactions.filter(tx => tx.validationStatus === 'error').length;
  const warningCount = allTransactions.filter(tx => tx.validationStatus === 'warning').length;

  // Determine overall validation status
  let overallValidation: ValidationStatus = 'valid';
  if (errorCount > 0) {
    overallValidation = 'error';
  } else if (warningCount > 0) {
    overallValidation = 'warning';
  }

  const mergedDocument: ParsedDocument = {
    fileName: `merged_${fileNames.length}_files.pdf`,
    totalPages: documents.reduce((sum, doc) => sum + (doc.totalPages || 0), 0),
    detectedLocale: documents[0]?.detectedLocale || 'auto',
    segments: [mergedSegment],
    totalTransactions: allTransactions.length,
    validTransactions: validCount,
    errorTransactions: errorCount,
    warningTransactions: warningCount,
    overallValidation,
  };

  // Calculate overall date range
  const allDates = allTransactions
    .map(tx => parseDate(tx.date))
    .filter((d): d is Date => d !== null);
  
  const dateRange = {
    earliest: allDates.length > 0 ? formatDate(new Date(Math.min(...allDates.map(d => d.getTime())))) : null,
    latest: allDates.length > 0 ? formatDate(new Date(Math.max(...allDates.map(d => d.getTime())))) : null,
  };

  return {
    document: mergedDocument,
    warnings,
    sourceFiles: fileNames,
    dateRange,
    gaps,
    duplicates: {
      detected: duplicateResult.totalFlagged > 0,
      groups: duplicateResult.duplicateGroups,
      totalFlagged: duplicateResult.totalFlagged,
    },
  };
}

/**
 * Helper: Create empty document
 */
function createEmptyDocument(): ParsedDocument {
  return {
    fileName: 'empty.pdf',
    totalPages: 0,
    detectedLocale: 'auto',
    segments: [],
    totalTransactions: 0,
    validTransactions: 0,
    errorTransactions: 0,
    warningTransactions: 0,
    overallValidation: 'valid',
  };
}

/**
 * Helper: Parse date string to Date object
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try common formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // Assume first format is ISO
      if (format === formats[0]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
      // Others are DD/MM/YYYY or DD-MM-YYYY
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
  }

  // Fallback to Date.parse
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? null : new Date(parsed);
}

/**
 * Helper: Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper: Get date range from document
 */
function getDateRange(doc: ParsedDocument): { earliest: string | null; latest: string | null } {
  const allDates: Date[] = [];
  
  doc.segments.forEach(segment => {
    segment.transactions.forEach(tx => {
      const date = parseDate(tx.date);
      if (date) allDates.push(date);
    });
  });

  if (allDates.length === 0) {
    return { earliest: null, latest: null };
  }

  return {
    earliest: formatDate(new Date(Math.min(...allDates.map(d => d.getTime())))),
    latest: formatDate(new Date(Math.max(...allDates.map(d => d.getTime())))),
  };
}

/**
 * Helper: Get merged statement period
 */
function getMergedPeriod(documents: ParsedDocument[]): { from: string; to: string } | undefined {
  const allPeriods = documents
    .map(doc => doc.segments[0]?.statementPeriod)
    .filter((p): p is { from: string; to: string } => !!p);

  if (allPeriods.length === 0) return undefined;

  const allStarts = allPeriods.map(p => parseDate(p.from)).filter((d): d is Date => d !== null);
  const allEnds = allPeriods.map(p => parseDate(p.to)).filter((d): d is Date => d !== null);

  if (allStarts.length === 0 || allEnds.length === 0) return undefined;

  return {
    from: formatDate(new Date(Math.min(...allStarts.map(d => d.getTime())))),
    to: formatDate(new Date(Math.max(...allEnds.map(d => d.getTime())))),
  };
}

// Re-export duplicate detection types for convenience
export type { 
  DuplicateDetectionOptions, 
  DuplicateDetectionResult, 
  DuplicateGroup,
} from './duplicateDetector';
export { DEFAULT_DUPLICATE_OPTIONS } from './duplicateDetector';

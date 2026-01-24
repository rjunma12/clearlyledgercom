/**
 * ClearlyLedger Rule Engine
 * Deterministic Geometry & Math Approach for Bank Statement Parsing
 * 
 * This module provides a comprehensive, rule-based parsing engine for
 * converting bank statements into standardized, accountant-ready format.
 * 
 * Key Features:
 * 1. Coordinate-Anchored Mapping - Solves floating text & column shift issues
 * 2. Multi-Line Stitching - Handles ghost rows from wrapped descriptions
 * 3. Mathematical Integrity - 100% arithmetic validation with audit flags
 * 4. Regional Auto-Aliasing - International header & number format support
 * 5. Uniform Schema Output - Standardized 5-column format
 * 6. Chronological Order - Auto-reverses descending dates to ascending
 * 7. Transaction Categorization - Keyword-based category assignment
 * 8. Multi-Currency Support - Detects and converts foreign currencies
 */

// Types
export * from './types';

// Locale & Language Support
export {
  HEADER_ALIASES,
  OPENING_BALANCE_KEYWORDS,
  CLOSING_BALANCE_KEYWORDS,
  LOCALE_CONFIGS,
  findCanonicalHeader,
  isOpeningBalanceRow,
  isClosingBalanceRow,
  detectLocale,
} from './locales';

// Coordinate Mapping
export {
  detectColumnAnchors,
  calculateHorizontalOverlap,
  calculateCenterDistance,
  assignToColumn,
  groupIntoRows,
  extendColumnBounds,
  type TextRow,
} from './coordinateMapper';

// Multi-Line Stitching
export {
  hasValidDate,
  hasMonetaryAmount,
  hasDescription,
  isContinuationRow,
  isCompleteTransactionRow,
  applyLookBackStitching,
  cleanDescription,
  convertToRawTransactions,
  getOriginalLines,
  type StitchedRow,
} from './multiLineStitcher';

// Balance Validation
export {
  validateBalanceEquation,
  validateTransactionChain,
  detectSegmentBoundaries,
  splitIntoSegments,
  validateDocument,
  generateAuditFlags,
  isDocumentValid,
  getValidationSummary,
  type AuditFlag,
} from './balanceValidator';

// Export Validation Agent
export {
  validateExport,
  preExportCheck,
  countIntegrityCheck,
  detectDuplicates,
  getValidationSummary as getExportValidationSummary,
  getDetailedFailureMessage,
  getShortErrorMessage,
  shouldBlockExport,
  type ExportValidationResult,
  type ExportValidationSummary,
  type MissingTransaction,
  type CorruptedTransaction,
  type DuplicateInExport,
  type ValidationVerdict,
  type ExportedRow,
} from './exportValidator';

// OCR Correction
export {
  correctOCRNumber,
  correctCurrencySymbol,
  correctOCRWord,
  correctTextElement,
  correctOCRElements,
  isValidCorrectedNumber,
  getConfidenceBoost,
} from './ocrCorrection';

// Number & Date Parsing
export {
  detectNumberFormat,
  parseNumber,
  parseNumberAuto,
  parseDate,
  isValidDate,
  normalizeAmount,
  determineAmountType,
} from './numberParser';

// Chronological Order Handling
export {
  detectDateOrder,
  calculateOrderConfidence,
  findOutOfOrderIndices,
  validateChronologicalSequence,
  reverseTransactions,
  recalculateBalances,
  analyzeChronologicalOrder,
  processSegmentChronology,
  shouldAutoReverse,
  type DateOrder,
  type ChronologicalAnalysis,
  type DateSequenceWarning,
} from './chronologicalOrder';

// Transaction Categorization
export {
  categorizeDescription,
  categorizeTransaction,
  categorizeAllTransactions,
  getCategoryStatistics,
  getAvailableCategories,
  type TransactionCategory,
  type CategoryMatch,
  type CategorizedTransaction,
} from './transactionCategorizer';

// Multi-Currency Handling
export {
  detectCurrencyInText,
  detectCurrencyFromAmount,
  detectCurrencyFromDescription,
  convertTransactionToLocal,
  processMultiCurrencyTransactions,
  getCurrencySummary,
  isMultiCurrencyDocument,
  CURRENCY_INFO,
  type CurrencyCode,
  type CurrencyInfo,
  type CurrencyDetectionResult,
  type MultiCurrencyTransaction,
} from './currencyHandler';

// Exchange Rates
export {
  getExchangeRate,
  convertAmount,
  getRatesForCurrency,
  formatWithCurrency,
  EXCHANGE_RATES,
  isCurrencySupported,
  getSupportedCurrencies,
} from './exchangeRates';

// =============================================================================
// MAIN PROCESSING PIPELINE
// =============================================================================

import type {
  TextElement,
  ParsedTransaction,
  ParsedDocument,
  RuleEngineConfig,
  ProcessingResult,
  ProcessingStage,
  Locale,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { detectColumnAnchors, groupIntoRows, extendColumnBounds } from './coordinateMapper';
import { applyLookBackStitching, convertToRawTransactions, getOriginalLines } from './multiLineStitcher';
import { validateDocument, detectSegmentBoundaries, splitIntoSegments } from './balanceValidator';
import { detectNumberFormat, parseNumber, parseDate } from './numberParser';
import { detectLocale, LOCALE_CONFIGS } from './locales';
import { analyzeChronologicalOrder, type DateOrder } from './chronologicalOrder';
import { categorizeDescription } from './transactionCategorizer';
import { processMultiCurrencyTransactions, isMultiCurrencyDocument, type CurrencyCode } from './currencyHandler';

/**
 * Main processing pipeline - converts raw text elements to validated transactions
 */
export async function processDocument(
  fileName: string,
  textElements: TextElement[],
  config: Partial<RuleEngineConfig> = {}
): Promise<ProcessingResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  const stages: ProcessingStage[] = [];
  const errors: Array<{ code: string; message: string; recoverable: boolean }> = [];
  const warnings: string[] = [];
  
  try {
    // Stage 1: Extract and identify headers
    stages.push({ stage: 'extract', status: 'processing', progress: 0 });
    
    const headerElements = textElements.filter(e => e.boundingBox.y < 100); // Top of page
    const bodyElements = textElements.filter(e => e.boundingBox.y >= 100);
    
    stages[0] = { ...stages[0], status: 'complete', progress: 100 };
    
    // Stage 2: Detect column anchors
    stages.push({ stage: 'anchor', status: 'processing', progress: 0 });
    
    let anchors = detectColumnAnchors(headerElements);
    
    if (anchors.length === 0) {
      warnings.push('No column headers detected - using fallback positioning');
    }
    
    stages[1] = { ...stages[1], status: 'complete', progress: 100 };
    
    // Stage 3: Group into rows and stitch multi-line descriptions
    stages.push({ stage: 'stitch', status: 'processing', progress: 0 });
    
    const rows = groupIntoRows(bodyElements, anchors, fullConfig);
    anchors = extendColumnBounds(anchors, rows);
    
    const stitchedRows = fullConfig.autoStitchMultiLine
      ? applyLookBackStitching(rows)
      : rows.map(r => ({ primaryRow: r, continuationRows: [], stitchedDescription: '', isStitched: false }));
    
    const rawTransactions = convertToRawTransactions(stitchedRows);
    
    stages[2] = { ...stages[2], status: 'complete', progress: 100 };
    
    // Stage 4: Parse and normalize values
    stages.push({ stage: 'validate', status: 'processing', progress: 0 });
    
    // Detect locale and number format
    const sampleNumbers = rawTransactions
      .flatMap(t => [t.rawDebit, t.rawCredit, t.rawBalance])
      .filter((n): n is string => n !== undefined && n.length > 0);
    
    const sampleHeaders = headerElements.map(e => e.text);
    const detectedLocale = fullConfig.localeDetection === 'auto'
      ? detectLocale(sampleHeaders, sampleNumbers)
      : fullConfig.localeDetection;
    
    const localeConfig = LOCALE_CONFIGS[detectedLocale];
    const numberFormat = detectNumberFormat(sampleNumbers);
    
    // Parse transactions
    let parsedTransactions: ParsedTransaction[] = rawTransactions.map((raw, index) => {
      const stitched = stitchedRows[index];
      const description = stitched?.stitchedDescription ?? raw.rawDescription ?? '';
      
      // Categorize transaction
      const categoryMatch = fullConfig.enableCategorization 
        ? categorizeDescription(description)
        : null;
      
      return {
        id: `tx-${index}`,
        rowIndex: index,
        date: parseDate(raw.rawDate ?? '', detectedLocale) ?? '',
        description,
        debit: parseNumber(raw.rawDebit ?? '', numberFormat),
        credit: parseNumber(raw.rawCredit ?? '', numberFormat),
        balance: parseNumber(raw.rawBalance ?? '', numberFormat) ?? 0,
        category: categoryMatch?.category,
        categoryConfidence: categoryMatch?.confidence,
        validationStatus: 'unchecked',
        sourcePageNumbers: [raw.pageNumber],
        isStitchedRow: stitched?.isStitched ?? false,
        originalLines: stitched ? getOriginalLines(stitched) : [],
      };
    });
    
    // Stage 4b: Apply chronological ordering
    if (fullConfig.autoReverseChronological) {
      const chronoResult = analyzeChronologicalOrder(parsedTransactions, true);
      parsedTransactions = chronoResult.transactions;
      
      if (chronoResult.analysis.wasReversed) {
        warnings.push('Transactions were automatically reversed to chronological order (oldest first)');
      }
      if (chronoResult.warnings.length > 0) {
        chronoResult.warnings.forEach(w => warnings.push(w.message));
      }
    }
    
    stages[3] = { ...stages[3], status: 'complete', progress: 100 };
    
    // Stage 5: Build document structure and validate
    stages.push({ stage: 'output', status: 'processing', progress: 0 });
    
    // Detect merged PDF segments
    const boundaries = fullConfig.detectMergedPDFs
      ? detectSegmentBoundaries(parsedTransactions)
      : [0];
    
    const segments = splitIntoSegments(parsedTransactions, boundaries);
    
    // Apply multi-currency handling if enabled
    const localCurrency = fullConfig.localCurrency as CurrencyCode;
    let hasMultipleCurrencies = false;
    
    if (fullConfig.enableCurrencyDetection) {
      for (const segment of segments) {
        const multiCurrencyTx = processMultiCurrencyTransactions(
          segment.transactions,
          localCurrency,
          true
        );
        segment.transactions = multiCurrencyTx as ParsedTransaction[];
      }
      
      const allTx = segments.flatMap(s => s.transactions);
      hasMultipleCurrencies = isMultiCurrencyDocument(allTx as any);
    }
    
    // Create document
    let document: ParsedDocument = {
      fileName,
      totalPages: Math.max(...textElements.map(e => e.pageNumber), 1),
      detectedLocale,
      segments,
      totalTransactions: parsedTransactions.length,
      validTransactions: 0,
      errorTransactions: 0,
      warningTransactions: 0,
      overallValidation: 'unchecked',
      dateOrder: fullConfig.autoReverseChronological ? 'ascending' : undefined,
      wasReversed: false,
      hasMultipleCurrencies,
      localCurrency: fullConfig.localCurrency,
    };
    
    // Validate document
    document = validateDocument(document);
    
    stages[4] = { ...stages[4], status: 'complete', progress: 100 };
    
    return {
      success: true,
      document,
      errors,
      warnings,
      stages,
      totalDuration: Date.now() - startTime,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push({
      code: 'PROCESSING_ERROR',
      message: errorMessage,
      recoverable: false,
    });
    
    return {
      success: false,
      errors,
      warnings,
      stages,
      totalDuration: Date.now() - startTime,
    };
  }
}

/**
 * Quick validation check for a single transaction
 */
export function quickValidate(
  previousBalance: number,
  debit: number | null,
  credit: number | null,
  currentBalance: number
): boolean {
  const expected = previousBalance + (credit ?? 0) - (debit ?? 0);
  return Math.abs(currentBalance - expected) < 0.01;
}

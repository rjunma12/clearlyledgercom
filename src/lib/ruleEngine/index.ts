/**
 * ClearlyLedger Rule Engine
 * Deterministic Geometry & Math Approach for Bank Statement Parsing
 * 
 * This module provides a comprehensive, rule-based parsing engine for
 * converting bank statements into standardized, accountant-ready format.
 * 
 * Key Features:
 * 1. Dynamic Table Detection - Automatic geometry-based column detection using pdf.js
 * 2. Multi-Line Stitching - Handles ghost rows from wrapped descriptions
 * 3. Mathematical Integrity - 100% arithmetic validation with audit flags
 * 4. Regional Auto-Aliasing - International header & number format support
 * 5. Uniform Schema Output - Standardized 5-column format
 * 6. Chronological Order - Auto-reverses descending dates to ascending
 * 7. Transaction Categorization - Keyword-based category assignment
 * 8. Multi-Currency Support - Detects and converts foreign currencies
 * 
 * NOTE: Bank profile templates have been replaced with dynamic table detection.
 * The system now uses vertical gutter analysis to detect column boundaries
 * and content-based classification to infer column types automatically.
 */

// Types
export * from './types';

// Table Detection (NEW - Zero-cost, template-free)
export {
  groupWordsIntoLines,
  detectTableRegions,
  detectColumnBoundaries,
  classifyColumns,
  extractRowsFromTable,
  detectAndExtractTables,
  type PdfWord,
  type PdfLine,
  type ColumnBoundary,
  type TableRegion,
  type ExtractedRow,
  type TableDetectionResult,
} from './tableDetector';

// Dynamic Row Processor (NEW)
export {
  classifyRow,
  stitchContinuationRows,
  convertToColumnAnchors,
  processExtractedRows,
  type RowClassification,
  type StitchedTransaction,
  type DynamicProcessingResult,
} from './dynamicRowProcessor';

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

// Coordinate Mapping (Legacy - kept for compatibility)
export {
  detectColumnAnchors,
  calculateHorizontalOverlap,
  calculateCenterDistance,
  assignToColumn,
  groupIntoRows,
  extendColumnBounds,
  inferColumnAnchorsFromLayout,
  type TextRow,
} from './coordinateMapper';

// Multi-Line Stitching (Legacy - kept for compatibility)
export {
  hasValidDate,
  hasMonetaryAmount,
  hasDescription,
  isContinuationRow,
  isCompleteTransactionRow,
  applyLookBackStitching,
  cleanDescription,
  convertToRawTransactions as convertStitchedToRawTransactions,
  getOriginalLines,
  type StitchedRow,
} from './multiLineStitcher';

// Skip Patterns (Enhanced with bank-specific patterns)
export {
  shouldSkipText,
  shouldSkipTextForBank,
  getSupportedBankIds,
  isPageHeader,
  isPageFooter,
  isSummaryRow,
  isSectionHeader,
  classifyText,
  type TextCategory,
} from './skipPatterns';

// Balance Validation
export {
  validateBalanceEquation,
  validateTransactionChain,
  validateWithTieredTolerance,
  TOLERANCE_TIERS,
  detectSegmentBoundaries,
  splitIntoSegments,
  validateDocument,
  generateAuditFlags,
  isDocumentValid,
  getValidationSummary,
  type AuditFlag,
  type ToleranceTierName,
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

// Mandatory Validation (NEW - Hardened pipeline)
export {
  runMandatoryValidation,
  validationPassed,
  getValidationSummaryMessage,
  type MandatoryValidationReport,
} from './mandatoryValidation';

// Safe Auto-Repair (NEW - Limited repairs only)
export {
  canAttemptRepair,
  attemptSafeRepair,
  calculateImbalance,
  getRepairSummary,
  type RepairResult,
  type RepairAction,
} from './autoRepair';

// Header Anchors (NEW - Locked column detection)
export {
  detectAndLockHeaders,
  assignWordToColumn,
  anchorsToColumnBoundaries,
  calculateAdaptiveDriftTolerance,
  type LockedColumnAnchors,
  type ColumnAnchor,
  type HeaderDetectionResult,
} from './headerAnchors';

// Multi-Strategy Table Detection (NEW - Best-result selection)
export {
  runMultiStrategyDetection,
  shouldUseMultiStrategy,
  type DetectionStrategy,
  type StrategyResult,
  type MultiStrategyResult,
  type StrategyMetrics,
} from './multiStrategyDetector';

// Provenance Tracking (NEW - No fabricated data)
export {
  createProvenance,
  parseWithProvenance,
  hasValidProvenance,
  getProvenanceSummary,
  FORBIDDEN_OPERATIONS,
  type ValueProvenance,
  type TrackedValue,
} from './provenance';

// Statement Header Extractor (NEW - Account details extraction)
export {
  extractStatementHeader,
  extractStatementHeaderFromText,
  maskAccountNumber,
  type ExtractedStatementHeader,
} from './statementHeaderExtractor';

// Number & Date Parsing
export {
  detectNumberFormat,
  parseNumber,
  parseNumberAuto,
  parseDate,
  isValidDate,
  normalizeAmount,
  determineAmountType,
  inferYearFromContext,
  setStatementPeriodContext,
} from './numberParser';

// Transaction Confidence Scoring
export {
  calculateTransactionConfidence,
  aggregateConfidenceScores,
  enrichTransactionsWithConfidence,
  getTransactionsNeedingReview,
  scoreTransactionRow,
  scoreAllTransactions,
  type TransactionConfidence,
  type AggregateConfidenceResult,
  type RowConfidenceResult,
} from './transactionConfidence';

// Export Adapters with Fallback Chain
export {
  getAvailableFormats,
  getExportFormat,
  exportTransactions,
  exportDocument,
  exportWithFallback,
  toCSVString,
  getColumnWidths,
  generatePreview,
  getFormatNotes,
  type ExportFormatType,
  type ExportFormat,
  type ExportedData,
  type ExportLevel,
  type FallbackExportResult,
} from './exportAdapters';

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
  RawTransaction,
  ExtractedStatementHeader,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { detectAndExtractTables } from './tableDetector';
import { processExtractedRows, convertToRawTransactions } from './dynamicRowProcessor';
import { validateDocument, detectSegmentBoundaries, splitIntoSegments } from './balanceValidator';
import { detectNumberFormat, parseNumber, parseDate } from './numberParser';
import { detectLocale, LOCALE_CONFIGS } from './locales';
import { analyzeChronologicalOrder } from './chronologicalOrder';
import { categorizeDescription } from './transactionCategorizer';
import { processMultiCurrencyTransactions, isMultiCurrencyDocument, type CurrencyCode } from './currencyHandler';
// Legacy imports for fallback
import { detectColumnAnchors, groupIntoRows, extendColumnBounds, inferColumnAnchorsFromLayout } from './coordinateMapper';
import { applyLookBackStitching, convertToRawTransactions as convertStitchedToRawTransactions, getOriginalLines } from './multiLineStitcher';
import { canAttemptRepair, attemptSafeRepair } from './autoRepair';
import { extractStatementHeader, type ExtractedStatementHeader as HeaderExtraction } from './statementHeaderExtractor';
import { detectBank } from './bankProfiles';

/**
 * Main processing pipeline - converts raw text elements to validated transactions
 * Uses dynamic table detection (geometry-based) instead of bank profile templates
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
    // Stage 1: Dynamic Table Detection (NEW - replaces header-based detection)
    stages.push({ stage: 'extract', status: 'processing', progress: 0 });
    
    console.log('[RuleEngine] Input elements:', textElements.length);
    
    // Use new geometry-based table detection
    const tableResult = detectAndExtractTables(textElements, 3); // 3px Y-tolerance
    console.log('[RuleEngine] Table detection confidence:', tableResult.confidence.toFixed(2));
    console.log('[RuleEngine] Columns detected:', tableResult.columnBoundaries.map(b => b.inferredType));
    console.log('[RuleEngine] Rows extracted:', tableResult.allRows.length);
    
    if (tableResult.columnBoundaries.length === 0) {
      warnings.push('No column structure detected - parsing may be incomplete');
    }
    
    stages[0] = { ...stages[0], status: 'complete', progress: 100 };
    
    // Stage 2: Dynamic Row Processing (NEW - replaces legacy stitching)
    stages.push({ stage: 'anchor', status: 'processing', progress: 0 });
    
    const processingResult = processExtractedRows(tableResult.allRows, tableResult.columnBoundaries);
    console.log('[RuleEngine] Transactions found:', processingResult.rawTransactions.length);
    console.log('[RuleEngine] Opening balance:', !!processingResult.openingBalance);
    console.log('[RuleEngine] Closing balance:', !!processingResult.closingBalance);
    console.log('[RuleEngine] Skipped rows:', processingResult.skippedRowCount);
    
    const rawTransactions = processingResult.rawTransactions;
    
    stages[1] = { ...stages[1], status: 'complete', progress: 100 };
    
    // Stage 3: Parse and normalize values
    stages.push({ stage: 'stitch', status: 'processing', progress: 0 });
    
    // Detect locale and number format from raw values
    const sampleNumbers = rawTransactions
      .flatMap(t => [t.rawDebit, t.rawCredit, t.rawBalance])
      .filter((n): n is string => n !== undefined && n.length > 0);
    
    // Extract header elements for locale detection (top 100px)
    const headerElements = textElements.filter(e => e.boundingBox.y < 100);
    const sampleHeaders = headerElements.map(e => e.text);
    
    const detectedLocale = fullConfig.localeDetection === 'auto'
      ? detectLocale(sampleHeaders, sampleNumbers)
      : fullConfig.localeDetection;
    
    const numberFormat = detectNumberFormat(sampleNumbers);
    console.log('[RuleEngine] Detected locale:', detectedLocale);
    console.log('[RuleEngine] Number format:', numberFormat);
    
    stages[2] = { ...stages[2], status: 'complete', progress: 100 };
    
    // Stage 4: Convert to ParsedTransactions
    stages.push({ stage: 'validate', status: 'processing', progress: 0 });
    
    let parsedTransactions: ParsedTransaction[] = rawTransactions.map((raw, index) => {
      const stitched = processingResult.stitchedTransactions[index];
      const description = stitched?.fullDescription ?? raw.rawDescription ?? '';
      
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
        isStitchedRow: (stitched?.continuationRows?.length ?? 0) > 0,
        originalLines: stitched?.continuationRows?.map(r => r.description || '').filter(Boolean) ?? [],
      };
    });
    
    // Apply chronological ordering
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
    
    // NEW: Extract statement header from PAGE 1 RAW TEXT ELEMENTS (not table rows)
    // This ensures we capture bank name, account holder, currency from the header area
    const page1Elements = textElements.filter(e => e.pageNumber === 1);
    const page1Lines = groupTextElementsIntoHeaderLines(page1Elements);
    
    const bankDetection = detectBank(textElements.map(e => e.text), fileName);
    const headerInfo = extractStatementHeader(page1Lines, bankDetection.profile);
    
    // Build extracted header for export
    const extractedHeader: ExtractedStatementHeader = {
      accountHolder: headerInfo.accountHolder,
      accountNumberMasked: headerInfo.accountNumberMasked,
      statementPeriodFrom: headerInfo.statementPeriodFrom || segments[0]?.statementPeriod?.from,
      statementPeriodTo: headerInfo.statementPeriodTo || segments[0]?.statementPeriod?.to,
      bankName: bankDetection.profile?.name || headerInfo.bankName,
      ifscCode: headerInfo.ifscCode,
      branchName: headerInfo.branchName,
      customerId: headerInfo.customerId,
      currency: headerInfo.currency || fullConfig.localCurrency,
      bsbNumber: headerInfo.bsbNumber,
      sortCode: headerInfo.sortCode,
      routingNumber: headerInfo.routingNumber,
    };
    
    console.log('[RuleEngine] Extracted header:', {
      hasAccountHolder: !!extractedHeader.accountHolder,
      hasAccountNumber: !!extractedHeader.accountNumberMasked,
      hasPeriod: !!(extractedHeader.statementPeriodFrom && extractedHeader.statementPeriodTo),
      bankName: extractedHeader.bankName,
      currency: extractedHeader.currency,
    });
    
    // Create document with rawTransactions fallback for export
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
      rawTransactions: parsedTransactions, // Store for export fallback
      extractedHeader, // NEW: Statement header metadata
    };
    
    // Validate document
    document = validateDocument(document);
    
    // NEW: Attempt safe auto-repair if validation failed
    if (document.overallValidation === 'error') {
      const allTransactions = document.segments.flatMap(s => s.transactions);
      
      // Get opening/closing balance from processingResult or segment
      // StitchedTransaction has primaryRow which contains the balance field
      const openingBalanceRow = processingResult.openingBalance?.primaryRow;
      const closingBalanceRow = processingResult.closingBalance?.primaryRow;
      
      // Parse balance from the row's balance field (string) or fall back to segment
      const openingBalance = openingBalanceRow?.balance 
        ? parseNumber(openingBalanceRow.balance, numberFormat) ?? document.segments[0]?.openingBalance ?? 0
        : document.segments[0]?.openingBalance ?? 0;
        
      const closingBalance = closingBalanceRow?.balance
        ? parseNumber(closingBalanceRow.balance, numberFormat) ?? document.segments[0]?.closingBalance ?? 0
        : document.segments[0]?.closingBalance ?? 0;
      
      const repairEligibility = canAttemptRepair(allTransactions, openingBalance, closingBalance);
      
      if (repairEligibility.canRepair) {
        console.log('[RuleEngine] Attempting safe auto-repair...');
        const repairResult = attemptSafeRepair(allTransactions, openingBalance, closingBalance);
        
        if (repairResult.repaired) {
          console.log('[RuleEngine] Auto-repair successful:', repairResult.repairs.length, 'repair(s) applied');
          
          // Apply repaired transactions back to first segment
          if (document.segments.length > 0) {
            document.segments[0].transactions = repairResult.repairedTransactions;
          }
          
          // Re-validate after repair
          document = validateDocument(document);
          
          warnings.push(`Auto-repair applied: ${repairResult.repairs.length} debit/credit correction(s) reduced imbalance from ${repairResult.originalImbalance.toFixed(2)} to ${repairResult.newImbalance.toFixed(2)}`);
        } else {
          console.log('[RuleEngine] Auto-repair could not improve balance');
        }
      } else {
        console.log('[RuleEngine] Auto-repair not eligible:', repairEligibility.reason);
      }
    }
    
    stages[4] = { ...stages[4], status: 'complete', progress: 100 };
    
    return {
      success: true,
      document,
      errors,
      warnings,
      stages,
      totalDuration: Date.now() - startTime,
      // Extended diagnostics for debugging (NEW)
      perTableMetrics: tableResult.perTableMetrics?.map(m => ({
        tableIndex: m.tableIndex,
        pageNumbers: m.pageNumbers,
        lineCount: m.lineCount,
        columnTypes: m.columnTypes,
        rowsExtracted: m.rowsExtracted,
        columns: m.columns.map(c => ({
          x0: c.x0,
          x1: c.x1,
          centerX: c.centerX,
          inferredType: c.inferredType,
          confidence: c.confidence,
        })),
      })),
      columnBoundaries: tableResult.columnBoundaries.map(c => ({
        x0: c.x0,
        x1: c.x1,
        centerX: c.centerX,
        inferredType: c.inferredType,
        confidence: c.confidence,
      })),
      confidence: tableResult.confidence,
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

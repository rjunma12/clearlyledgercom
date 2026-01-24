/**
 * ClearlyLedger Rule Engine Types
 * Deterministic Geometry & Math Approach for Bank Statement Parsing
 */

// =============================================================================
// COORDINATE-ANCHORED MAPPING TYPES
// =============================================================================

export interface BoundingBox {
  x: number;      // Left position
  y: number;      // Top position
  width: number;
  height: number;
}

export interface TextElement {
  text: string;
  boundingBox: BoundingBox;
  pageNumber: number;
  confidence?: number;
  source?: 'text-layer' | 'ocr';
}

export interface ColumnAnchor {
  columnType: ColumnType;
  boundingBox: BoundingBox;
  aliases: string[];
}

export type ColumnType = 'date' | 'description' | 'debit' | 'credit' | 'balance';

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

export interface RawTransaction {
  rowIndex: number;
  pageNumber: number;
  elements: TextElement[];
  rawDate?: string;
  rawDescription?: string;
  rawDebit?: string;
  rawCredit?: string;
  rawBalance?: string;
}

export interface ParsedTransaction {
  id: string;
  rowIndex: number;
  date: string;                    // YYYY-MM-DD format
  description: string;             // Cleaned & Stitched
  debit: number | null;            // Positive float or null
  credit: number | null;           // Positive float or null
  balance: number;                 // Running balance
  
  // Categorization
  category?: string;               // Transaction category (Transfer, Salary, etc.)
  categoryConfidence?: number;     // 0-1 confidence score for category
  
  // Multi-currency support
  originalCurrency?: string;       // Original currency code (USD, EUR, etc.)
  originalDebit?: number | null;   // Amount in original currency
  originalCredit?: number | null;  // Amount in original currency
  exchangeRate?: number;           // Conversion rate used
  localCurrency?: string;          // Target/local currency
  
  // Audit metadata
  validationStatus: ValidationStatus;
  validationMessage?: string;
  sourcePageNumbers: number[];
  isStitchedRow: boolean;          // True if multi-line description was merged
  originalLines: string[];         // For audit trail
  notes?: string[];                // Manual review suggestions
}

export type ValidationStatus = 'valid' | 'error' | 'warning' | 'unchecked';

export interface ValidationResult {
  isValid: boolean;
  status: ValidationStatus;
  message?: string;
  expectedBalance?: number;
  actualBalance?: number;
  discrepancy?: number;
}

// =============================================================================
// DOCUMENT STRUCTURE TYPES
// =============================================================================

export interface DocumentSegment {
  segmentIndex: number;
  startPage: number;
  endPage: number;
  openingBalance: number;
  closingBalance?: number;
  accountNumber?: string;
  statementPeriod?: {
    from: string;
    to: string;
  };
  transactions: ParsedTransaction[];
}

export type DateOrder = 'ascending' | 'descending' | 'mixed' | 'unknown';

export interface ParsedDocument {
  fileName: string;
  totalPages: number;
  detectedLocale: Locale;
  segments: DocumentSegment[];      // For merged PDFs with multiple statements
  totalTransactions: number;
  validTransactions: number;
  errorTransactions: number;
  warningTransactions: number;
  overallValidation: ValidationStatus;
  
  // Chronological order tracking
  dateOrder?: DateOrder;            // Detected date order
  wasReversed?: boolean;            // True if transactions were auto-reversed
  
  // Multi-currency summary
  hasMultipleCurrencies?: boolean;  // True if multiple currencies detected
  localCurrency?: string;           // Primary/local currency
  
  // Export fallback - raw transactions before segmentation
  rawTransactions?: ParsedTransaction[];
}

// =============================================================================
// REGIONAL & LANGUAGE TYPES
// =============================================================================

export type Locale = 
  | 'en-US' | 'en-GB' | 'en-IN' | 'en-AE' | 'en-AU' | 'en-NZ'
  | 'es-ES' | 'es-MX'
  | 'fr-FR'
  | 'de-DE'
  | 'ar-AE' | 'ar-SA'
  | 'hi-IN'
  | 'zh-CN'
  | 'ja-JP'
  | 'ms-MY'
  | 'auto';

export interface NumberFormat {
  thousandsSeparator: ',' | '.' | ' ' | "'";
  decimalSeparator: ',' | '.';
  currencySymbol?: string;
  currencyPosition: 'prefix' | 'suffix';
}

export interface HeaderAlias {
  canonical: ColumnType;
  aliases: string[];
}

export interface LocaleConfig {
  locale: Locale;
  numberFormat: NumberFormat;
  dateFormats: string[];           // Multiple possible formats to try
  headerAliases: HeaderAlias[];
  rtl: boolean;                    // Right-to-left languages
}

// =============================================================================
// RULE ENGINE CONFIGURATION
// =============================================================================

export interface RuleEngineConfig {
  strictValidation: boolean;       // Fail on any math error
  autoStitchMultiLine: boolean;    // Enable look-back stitching
  detectMergedPDFs: boolean;       // Look for opening balance resets
  localeDetection: 'auto' | Locale;
  columnDetection: 'anchor' | 'fixed' | 'auto';
  
  // Chronological ordering
  autoReverseChronological: boolean;  // Auto-reverse descending dates
  validateDateSequence: boolean;      // Check for out-of-order dates
  
  // Categorization
  enableCategorization: boolean;      // Enable transaction categorization
  
  // Multi-currency
  enableCurrencyDetection: boolean;   // Enable per-transaction currency detection
  localCurrency: string;              // Target currency for conversion (e.g., 'USD')
  
  // Thresholds
  columnOverlapThreshold: number;  // % overlap required for column assignment
  rowGapThreshold: number;         // Max Y-gap before new row
  confidenceThreshold: number;     // Min OCR confidence to accept
}

export const DEFAULT_CONFIG: RuleEngineConfig = {
  strictValidation: true,
  autoStitchMultiLine: true,
  detectMergedPDFs: true,
  localeDetection: 'auto',
  columnDetection: 'auto',
  autoReverseChronological: true,
  validateDateSequence: true,
  enableCategorization: true,
  enableCurrencyDetection: true,
  localCurrency: 'USD',
  columnOverlapThreshold: 0.3,
  rowGapThreshold: 20,
  confidenceThreshold: 0.7,
};

// =============================================================================
// PROCESSING STATUS TYPES
// =============================================================================

export interface ProcessingStage {
  stage: 'upload' | 'extract' | 'anchor' | 'stitch' | 'validate' | 'output';
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
  duration?: number;
}

export interface ProcessingResult {
  success: boolean;
  document?: ParsedDocument;
  errors: ProcessingError[];
  warnings: string[];
  stages: ProcessingStage[];
  totalDuration: number;
}

export interface ProcessingError {
  code: string;
  message: string;
  page?: number;
  row?: number;
  recoverable: boolean;
}

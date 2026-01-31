/**
 * Regional Number Parsing Engine
 * Handles international decimal/thousands separators including Indian lakh/crore format
 */

import type { NumberFormat, Locale } from './types';
import { LOCALE_CONFIGS } from './locales';
import { correctOCRDate } from './ocrCorrection';

// =============================================================================
// INDIAN NUMBER FORMAT SUPPORT
// =============================================================================

/**
 * Indian numbering pattern: 1,00,000.00 (one lakh) or 1,00,00,000.00 (one crore)
 * Format: Start with 1-2 digits, then groups of 2 digits, last group is 3 digits before decimal
 */
const INDIAN_NUMBER_PATTERN = /^\d{1,2}(,\d{2})*(,\d{3})?\.\d{1,2}$/;
const INDIAN_NUMBER_PATTERN_NO_DECIMAL = /^\d{1,2}(,\d{2})*(,\d{3})?$/;

/**
 * Check if a number string follows Indian lakh/crore format
 */
export function isIndianNumberFormat(value: string): boolean {
  const cleaned = value.replace(/[\s₹Rs\.INR]/gi, '').trim();
  return INDIAN_NUMBER_PATTERN.test(cleaned) || INDIAN_NUMBER_PATTERN_NO_DECIMAL.test(cleaned);
}

/**
 * Parse an Indian formatted number (1,00,000.00 -> 100000.00)
 */
export function parseIndianNumber(value: string): number | null {
  // Remove currency symbols and spaces
  let cleaned = value.replace(/[\s₹Rs\.INR]/gi, '').trim();
  
  // Remove all commas
  cleaned = cleaned.replace(/,/g, '');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// =============================================================================
// NUMBER FORMAT DETECTION
// =============================================================================

/**
 * Detect the number format from sample numbers
 * Analyzes patterns to determine regional separators
 * Supports: US/UK, European, Indian lakh/crore formats
 */
export function detectNumberFormat(sampleNumbers: string[]): NumberFormat {
  const cleanSamples = sampleNumbers
    .map(n => n.replace(/[^\d,.\s']/g, '').trim())
    .filter(n => n.length > 0);
  
  if (cleanSamples.length === 0) {
    return LOCALE_CONFIGS['en-US'].numberFormat;
  }
  
  // Count occurrences of potential separators
  let dotAsDecimal = 0;
  let commaAsDecimal = 0;
  let dotAsThousands = 0;
  let commaAsThousands = 0;
  let indianFormatCount = 0;
  
  for (const sample of cleanSamples) {
    // Pattern: Indian lakh/crore format (1,00,000.00 or 1,00,00,000.00)
    if (/^\d{1,2}(,\d{2})+(,\d{3})?\.\d{1,2}$/.test(sample)) {
      indianFormatCount++;
      dotAsDecimal++; // Indian format uses dot as decimal
    }
    // Pattern: European format (1.234,56 or 1 234,56)
    else if (/^\d{1,3}([.\s']\d{3})*,\d{2}$/.test(sample)) {
      commaAsDecimal++;
      if (sample.includes('.')) dotAsThousands++;
    }
    // Pattern: US/UK format (1,234.56)
    else if (/^\d{1,3}(,\d{3})*\.\d{2}$/.test(sample)) {
      dotAsDecimal++;
      commaAsThousands++;
    }
    // Pattern: Simple decimal with dot (1234.56)
    else if (/^\d+\.\d{2}$/.test(sample)) {
      dotAsDecimal++;
    }
    // Pattern: Simple decimal with comma (1234,56)
    else if (/^\d+,\d{2}$/.test(sample)) {
      commaAsDecimal++;
    }
  }
  
  // Check if majority are Indian format
  if (indianFormatCount > cleanSamples.length * 0.3) {
    console.log('[NumberParser] Detected Indian lakh/crore format');
    return {
      thousandsSeparator: ',' as const, // Will be handled specially in parseNumber
      decimalSeparator: '.',
      currencyPosition: 'prefix',
      // Note: We use ',' but the parser will detect Indian format specifically
    };
  }
  
  // Determine format based on patterns
  if (commaAsDecimal > dotAsDecimal) {
    return {
      thousandsSeparator: dotAsThousands > 0 ? '.' : ' ',
      decimalSeparator: ',',
      currencyPosition: 'suffix',
    };
  }
  
  return {
    thousandsSeparator: ',',
    decimalSeparator: '.',
    currencyPosition: 'prefix',
  };
}

// =============================================================================
// NUMBER PARSING
// =============================================================================

/**
 * Parse a number string according to the specified format
 */
export function parseNumber(
  value: string,
  format: NumberFormat
): number | null {
  if (!value || value.trim().length === 0) return null;
  
  let cleaned = value.trim();
  
  // Remove currency symbols
  cleaned = cleaned.replace(/[$€£¥₹₽₩฿₪₫₱₦₵AEDSARًQAR]/gi, '');
  cleaned = cleaned.replace(/[A-Za-z]/g, '');
  
  // Handle parentheses as negative (accounting notation)
  const isNegative = cleaned.includes('(') && cleaned.includes(')');
  cleaned = cleaned.replace(/[()]/g, '');
  
  // Handle explicit minus signs
  const hasExplicitMinus = cleaned.startsWith('-') || cleaned.includes('-');
  cleaned = cleaned.replace(/-/g, '');
  
  // Handle CR/DR indicators
  const isCreditIndicator = /CR$/i.test(value.trim());
  const isDebitIndicator = /DR$/i.test(value.trim());
  cleaned = cleaned.replace(/[CD]R$/i, '');
  
  cleaned = cleaned.trim();
  
  if (cleaned.length === 0) return null;
  
  // Remove thousands separators
  if (format.thousandsSeparator === '.') {
    // European: 1.234.567,89
    cleaned = cleaned.replace(/\./g, '');
    cleaned = cleaned.replace(',', '.');
  } else if (format.thousandsSeparator === ',') {
    // US/UK: 1,234,567.89
    cleaned = cleaned.replace(/,/g, '');
  } else if (format.thousandsSeparator === ' ') {
    // French/Swiss: 1 234 567,89
    cleaned = cleaned.replace(/\s/g, '');
    cleaned = cleaned.replace(',', '.');
  } else if (format.thousandsSeparator === "'") {
    // Swiss: 1'234'567.89
    cleaned = cleaned.replace(/'/g, '');
  }
  
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) return null;
  
  // Apply sign
  const sign = (isNegative || hasExplicitMinus || isDebitIndicator) ? -1 : 1;
  
  return Math.abs(parsed) * sign;
}

/**
 * Parse a number string with auto-detected format
 */
export function parseNumberAuto(value: string): number | null {
  const format = detectNumberFormat([value]);
  return parseNumber(value, format);
}

// =============================================================================
// DATE PARSING
// =============================================================================

const DATE_PATTERNS: Array<{ pattern: RegExp; format: string }> = [
  // ISO format: 2025-01-15
  { pattern: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, format: 'YYYY-MM-DD' },
  // US format: 01/15/2025 or 1/15/2025
  { pattern: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: 'MM/DD/YYYY' },
  // UK/EU format: 15/01/2025 or 15-01-2025
  { pattern: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, format: 'DD/MM/YYYY' },
  // German format: 15.01.2025
  { pattern: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, format: 'DD.MM.YYYY' },
  // Short year: 15/01/25
  { pattern: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/, format: 'DD/MM/YY' },
  // Written month: 15 Jan 2025, January 15, 2025
  { pattern: /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/, format: 'DD MMM YYYY' },
  { pattern: /^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/, format: 'MMM DD YYYY' },
];

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1, ene: 1, enero: 1, janv: 1, janvier: 1,
  feb: 2, february: 2, febr: 2, febrero: 2, févr: 2, février: 2,
  mar: 3, march: 3, marzo: 3, mars: 3,
  apr: 4, april: 4, abr: 4, abril: 4, avr: 4, avril: 4,
  may: 5, mayo: 5, mai: 5,
  jun: 6, june: 6, junio: 6, juin: 6,
  jul: 7, july: 7, julio: 7, juil: 7, juillet: 7,
  aug: 8, august: 8, ago: 8, agosto: 8, août: 8,
  sep: 9, sept: 9, september: 9, septiembre: 9, septembre: 9,
  oct: 10, october: 10, octubre: 10, octobre: 10,
  nov: 11, november: 11, noviembre: 11, novembre: 11,
  dec: 12, december: 12, dic: 12, diciembre: 12, déc: 12, décembre: 12,
};

/**
 * Parse a date string and return in YYYY-MM-DD format
 */
export function parseDate(
  dateStr: string,
  locale: Locale = 'auto'
): string | null {
  const cleaned = dateStr.trim();
  
  for (const { pattern, format } of DATE_PATTERNS) {
    const match = cleaned.match(pattern);
    if (!match) continue;
    
    let year: number, month: number, day: number;
    
    switch (format) {
      case 'YYYY-MM-DD':
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
        break;
        
      case 'MM/DD/YYYY':
        // Ambiguous - use locale hint
        if (locale === 'en-US') {
          month = parseInt(match[1]);
          day = parseInt(match[2]);
        } else {
          day = parseInt(match[1]);
          month = parseInt(match[2]);
        }
        year = parseInt(match[3]);
        break;
        
      case 'DD/MM/YYYY':
      case 'DD.MM.YYYY':
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]);
        break;
        
      case 'DD/MM/YY':
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]) + 2000;
        break;
        
      case 'DD MMM YYYY':
        day = parseInt(match[1]);
        month = MONTH_NAMES[match[2].toLowerCase()] ?? 1;
        year = parseInt(match[3]);
        break;
        
      case 'MMM DD YYYY':
        month = MONTH_NAMES[match[1].toLowerCase()] ?? 1;
        day = parseInt(match[2]);
        year = parseInt(match[3]);
        break;
        
      default:
        continue;
    }
    
    // Validate date components
    if (month < 1 || month > 12) continue;
    if (day < 1 || day > 31) continue;
    if (year < 1900 || year > 2100) continue;
    
    // Return in YYYY-MM-DD format
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return null;
}

/**
 * Validate a parsed date
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// =============================================================================
// AMOUNT NORMALIZATION
// =============================================================================

/**
 * Normalize an amount to positive float
 * Handles negative indicators and returns absolute value with sign indicator
 */
export function normalizeAmount(
  rawAmount: string,
  format: NumberFormat
): { value: number; isNegative: boolean } | null {
  const parsed = parseNumber(rawAmount, format);
  
  if (parsed === null) {
    return null;
  }
  
  return {
    value: Math.abs(parsed),
    isNegative: parsed < 0,
  };
}

/**
 * Determine if a raw amount represents a debit or credit
 * based on context clues and formatting
 */
export function determineAmountType(
  rawAmount: string,
  columnHint?: 'debit' | 'credit'
): 'debit' | 'credit' | 'unknown' {
  const upper = rawAmount.toUpperCase();
  
  // Explicit indicators
  if (upper.includes('DR') || upper.includes('DEBIT')) return 'debit';
  if (upper.includes('CR') || upper.includes('CREDIT')) return 'credit';
  
  // Parentheses typically indicate debit (expense)
  if (rawAmount.includes('(') && rawAmount.includes(')')) return 'debit';
  
  // Negative sign typically indicates debit
  if (rawAmount.startsWith('-')) return 'debit';
  
  // Use column hint if available
  if (columnHint) return columnHint;
  
  return 'unknown';
}

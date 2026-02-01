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
 * Handles US/UK, European, and Indian lakh/crore formats
 */
export function parseNumber(
  value: string,
  format: NumberFormat
): number | null {
  if (!value || value.trim().length === 0) return null;
  
  let cleaned = value.trim();
  
  // Check for Indian format FIRST (before removing currency symbols)
  if (isIndianNumberFormat(value)) {
    const indianParsed = parseIndianNumber(value);
    if (indianParsed !== null) {
      // Check for negative indicators
      const isNegative = value.includes('(') && value.includes(')');
      const hasExplicitMinus = value.startsWith('-') || value.includes('-');
      const isDebitIndicator = /DR$/i.test(value.trim());
      
      const sign = (isNegative || hasExplicitMinus || isDebitIndicator) ? -1 : 1;
      return Math.abs(indianParsed) * sign;
    }
  }
  
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
  
  // NEW: Ordinal dates (15th Jan 2025, 1st February 2024)
  { pattern: /^(\d{1,2})(?:st|nd|rd|th)\s+([A-Za-z]{3,9})\s+(\d{4})$/, format: 'DD_ORD MMM YYYY' },
  { pattern: /^([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th),?\s+(\d{4})$/, format: 'MMM DD_ORD YYYY' },
  
  // NEW: Japanese format (2025年1月15日)
  { pattern: /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, format: 'YYYY年MM月DD日' },
  
  // NEW: German written (15. Januar 2025)
  { pattern: /^(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\s+(\d{4})$/, format: 'DD. MMMM YYYY' },
  
  // NEW: Short month formats (15-Jan-25, Jan-15-25)
  { pattern: /^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/, format: 'DD-MMM-YY' },
  { pattern: /^([A-Za-z]{3})-(\d{1,2})-(\d{2})$/, format: 'MMM-DD-YY' },
  
  // NEW: Day without year (15 Jan, Jan 15) - will infer year
  { pattern: /^(\d{1,2})\s+([A-Za-z]{3,9})$/, format: 'DD MMM' },
  { pattern: /^([A-Za-z]{3,9})\s+(\d{1,2})$/, format: 'MMM DD' },
];

const MONTH_NAMES: Record<string, number> = {
  // English
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
  
  // Spanish
  ene: 1, enero: 1, febr: 2, febrero: 2, marzo: 3, abr: 4, abril: 4,
  mayo: 5, junio: 6, julio: 7, ago: 8, agosto: 8, septiembre: 9,
  octubre: 10, noviembre: 11, dic: 12, diciembre: 12,
  
  // French
  janv: 1, janvier: 1, févr: 2, février: 2, mars: 3, avr: 4, avril: 4,
  mai: 5, juin: 6, juil: 7, juillet: 7, août: 8, septembre: 9,
  octobre: 10, novembre: 11, déc: 12, décembre: 12,
  
  // German
  januar: 1, februar: 2, märz: 3, marz: 3, april: 4, juni: 6, juli: 7,
  august: 8, september: 9, oktober: 10, november: 11, dezember: 12,
  
  // Italian
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
  
  // Portuguese
  janeiro: 1, fevereiro: 2, março: 3, maio: 5, junho: 6, julho: 7,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  
  // Dutch
  januari: 1, februari: 2, maart: 3, mei: 5, augustus: 8,
  
  // Malay
  januari: 1, februari: 2, mac: 3, april: 4, mei: 5, jun: 6, julai: 7,
  ogos: 8, september: 9, oktober: 10, november: 11, disember: 12,
  
  // Hindi (romanized)
  janavari: 1, faravari: 2, maarch: 3, aprail: 4, mae: 5, joon: 6,
  julai: 7, agast: 8, sitambar: 9, aktoobar: 10, navambar: 11, disambar: 12,
  
  // Arabic (romanized)
  yanayir: 1, fibrayir: 2, maris: 3, abril: 4, mayu: 5, yunyu: 6,
  yulyu: 7, aghustus: 8, sibtambir: 9, uktubar: 10, nufimbir: 11, disambir: 12,
};

/**
 * Parse a date string and return in YYYY-MM-DD format
 * Applies OCR correction before parsing
 */
export function parseDate(
  dateStr: string,
  locale: Locale = 'auto'
): string | null {
  // Apply OCR correction first (handles O->0, l->1, etc.)
  const corrected = correctOCRDate(dateStr.trim());
  
  for (const { pattern, format } of DATE_PATTERNS) {
    const match = corrected.match(pattern);
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
        
      // NEW: Ordinal date formats
      case 'DD_ORD MMM YYYY':
        day = parseInt(match[1]);
        month = MONTH_NAMES[match[2].toLowerCase()] ?? 1;
        year = parseInt(match[3]);
        break;
        
      case 'MMM DD_ORD YYYY':
        month = MONTH_NAMES[match[1].toLowerCase()] ?? 1;
        day = parseInt(match[2]);
        year = parseInt(match[3]);
        break;
        
      // NEW: Japanese format
      case 'YYYY年MM月DD日':
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
        break;
        
      // NEW: German written format
      case 'DD. MMMM YYYY':
        day = parseInt(match[1]);
        month = MONTH_NAMES[match[2].toLowerCase()] ?? 1;
        year = parseInt(match[3]);
        break;
        
      // NEW: Short formats with hyphen
      case 'DD-MMM-YY':
        day = parseInt(match[1]);
        month = MONTH_NAMES[match[2].toLowerCase()] ?? 1;
        year = parseInt(match[3]) + 2000;
        break;
        
      case 'MMM-DD-YY':
        month = MONTH_NAMES[match[1].toLowerCase()] ?? 1;
        day = parseInt(match[2]);
        year = parseInt(match[3]) + 2000;
        break;
        
      // NEW: Day without year - infer current year
      case 'DD MMM':
        day = parseInt(match[1]);
        month = MONTH_NAMES[match[2].toLowerCase()] ?? 1;
        year = new Date().getFullYear();
        break;
        
      case 'MMM DD':
        month = MONTH_NAMES[match[1].toLowerCase()] ?? 1;
        day = parseInt(match[2]);
        year = new Date().getFullYear();
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

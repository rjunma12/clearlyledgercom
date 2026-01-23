/**
 * Multi-Currency Detection & Conversion Handler
 * Detects per-transaction currencies and converts to local currency
 */

import type { ParsedTransaction } from './types';
import { EXCHANGE_RATES, getExchangeRate, convertAmount } from './exchangeRates';

// =============================================================================
// TYPES
// =============================================================================

export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CNY' | 'AUD' | 'CAD'
  | 'CHF' | 'HKD' | 'SGD' | 'AED' | 'SAR' | 'ZAR' | 'MYR' | 'THB'
  | 'PHP' | 'IDR' | 'KRW' | 'NZD' | 'SEK' | 'NOK' | 'DKK' | 'PLN'
  | 'BRL' | 'MXN' | 'RUB' | 'TRY' | 'EGP' | 'NGN' | 'KES'
  | 'UNKNOWN';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

export interface CurrencyDetectionResult {
  currency: CurrencyCode;
  confidence: number;
  matchedPattern: string;
  position: 'prefix' | 'suffix' | 'inline';
}

export interface MultiCurrencyTransaction {
  id: string;
  rowIndex: number;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category?: string;
  categoryConfidence?: number;
  validationStatus: 'valid' | 'error' | 'warning' | 'unchecked';
  validationMessage?: string;
  sourcePageNumbers: number[];
  isStitchedRow: boolean;
  originalLines: string[];
  notes?: string[];
  originalCurrency?: CurrencyCode;
  originalDebit?: number | null;
  originalCredit?: number | null;
  exchangeRate?: number;
  localCurrency?: CurrencyCode;
}

// =============================================================================
// CURRENCY DEFINITIONS
// =============================================================================

export const CURRENCY_INFO: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', decimalPlaces: 2 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimalPlaces: 2 },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimalPlaces: 2 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimalPlaces: 2 },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimalPlaces: 2 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimalPlaces: 2 },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimalPlaces: 2 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimalPlaces: 0 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', decimalPlaces: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
  MXN: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', decimalPlaces: 2 },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimalPlaces: 2 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimalPlaces: 2 },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', decimalPlaces: 2 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimalPlaces: 2 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimalPlaces: 2 },
  UNKNOWN: { code: 'UNKNOWN', symbol: '', name: 'Unknown', decimalPlaces: 2 },
};

// =============================================================================
// CURRENCY DETECTION PATTERNS
// =============================================================================

interface CurrencyPattern {
  code: CurrencyCode;
  patterns: RegExp[];
  symbolPatterns?: RegExp[];
}

const CURRENCY_PATTERNS: CurrencyPattern[] = [
  {
    code: 'USD',
    patterns: [/\bUSD\b/i, /\bUS\s*Dollar/i, /\bU\.?S\.?\s*\$/i],
    symbolPatterns: [/\$\s*[\d,]+\.?\d*/],
  },
  {
    code: 'EUR',
    patterns: [/\bEUR\b/i, /\bEuro\b/i],
    symbolPatterns: [/€\s*[\d,]+\.?\d*/],
  },
  {
    code: 'GBP',
    patterns: [/\bGBP\b/i, /\bSterling\b/i, /\bBritish\s*Pound/i],
    symbolPatterns: [/£\s*[\d,]+\.?\d*/],
  },
  {
    code: 'INR',
    patterns: [/\bINR\b/i, /\bRupees?\b/i, /\bRs\.?\s*[\d,]+/],
    symbolPatterns: [/₹\s*[\d,]+\.?\d*/],
  },
  {
    code: 'JPY',
    patterns: [/\bJPY\b/i, /\bYen\b/i, /\bJapanese\s*Yen/i],
    symbolPatterns: [/¥\s*[\d,]+/],
  },
  {
    code: 'CNY',
    patterns: [/\bCNY\b/i, /\bRMB\b/i, /\bYuan\b/i, /\bChinese\s*Yuan/i],
  },
  {
    code: 'AUD',
    patterns: [/\bAUD\b/i, /\bAustralian\s*Dollar/i],
    symbolPatterns: [/A\$\s*[\d,]+\.?\d*/],
  },
  {
    code: 'CAD',
    patterns: [/\bCAD\b/i, /\bCanadian\s*Dollar/i],
    symbolPatterns: [/C\$\s*[\d,]+\.?\d*/],
  },
  {
    code: 'CHF',
    patterns: [/\bCHF\b/i, /\bSwiss\s*Franc/i],
    symbolPatterns: [/Fr\.?\s*[\d,]+\.?\d*/],
  },
  {
    code: 'AED',
    patterns: [/\bAED\b/i, /\bDirham\b/i, /\bUAE\s*Dirham/i],
  },
  {
    code: 'SAR',
    patterns: [/\bSAR\b/i, /\bSaudi\s*Riyal/i],
  },
  {
    code: 'SGD',
    patterns: [/\bSGD\b/i, /\bSingapore\s*Dollar/i],
    symbolPatterns: [/S\$\s*[\d,]+\.?\d*/],
  },
  {
    code: 'MYR',
    patterns: [/\bMYR\b/i, /\bRinggit\b/i, /\bMalaysian\s*Ringgit/i],
    symbolPatterns: [/RM\s*[\d,]+\.?\d*/],
  },
  {
    code: 'ZAR',
    patterns: [/\bZAR\b/i, /\bSouth\s*African\s*Rand/i, /\bRand\b/i],
  },
  {
    code: 'HKD',
    patterns: [/\bHKD\b/i, /\bHong\s*Kong\s*Dollar/i],
    symbolPatterns: [/HK\$\s*[\d,]+\.?\d*/],
  },
  {
    code: 'NZD',
    patterns: [/\bNZD\b/i, /\bNew\s*Zealand\s*Dollar/i],
    symbolPatterns: [/NZ\$\s*[\d,]+\.?\d*/],
  },
  {
    code: 'BRL',
    patterns: [/\bBRL\b/i, /\bBrazilian\s*Real/i],
    symbolPatterns: [/R\$\s*[\d,]+\.?\d*/],
  },
  {
    code: 'MXN',
    patterns: [/\bMXN\b/i, /\bMexican\s*Peso/i],
  },
  {
    code: 'KRW',
    patterns: [/\bKRW\b/i, /\bKorean\s*Won/i],
    symbolPatterns: [/₩\s*[\d,]+/],
  },
  {
    code: 'THB',
    patterns: [/\bTHB\b/i, /\bThai\s*Baht/i, /\bBaht\b/i],
    symbolPatterns: [/฿\s*[\d,]+\.?\d*/],
  },
];

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Detect currency from transaction description or amount string
 */
export function detectCurrencyInText(text: string): CurrencyDetectionResult | null {
  if (!text || text.trim().length === 0) return null;
  
  const normalizedText = text.trim();
  
  for (const currencyPattern of CURRENCY_PATTERNS) {
    // Check code patterns first (higher confidence)
    for (const pattern of currencyPattern.patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        return {
          currency: currencyPattern.code,
          confidence: 0.95,
          matchedPattern: match[0],
          position: 'inline',
        };
      }
    }
    
    // Check symbol patterns
    if (currencyPattern.symbolPatterns) {
      for (const pattern of currencyPattern.symbolPatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          const isPrefix = match.index === 0;
          return {
            currency: currencyPattern.code,
            confidence: 0.85,
            matchedPattern: match[0],
            position: isPrefix ? 'prefix' : 'suffix',
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Detect currency from amount string
 */
export function detectCurrencyFromAmount(rawAmount: string): CurrencyCode {
  const result = detectCurrencyInText(rawAmount);
  return result?.currency ?? 'UNKNOWN';
}

/**
 * Detect currency from description
 */
export function detectCurrencyFromDescription(description: string): CurrencyCode | null {
  const result = detectCurrencyInText(description);
  return result?.currency ?? null;
}

// =============================================================================
// CONVERSION FUNCTIONS
// =============================================================================

/**
 * Convert transaction amounts to local currency
 */
export function convertTransactionToLocal(
  transaction: ParsedTransaction,
  detectedCurrency: CurrencyCode,
  localCurrency: CurrencyCode
): MultiCurrencyTransaction {
  if (detectedCurrency === localCurrency || detectedCurrency === 'UNKNOWN') {
    return {
      ...transaction,
      localCurrency,
    } as MultiCurrencyTransaction;
  }
  
  const exchangeRate = getExchangeRate(detectedCurrency, localCurrency);
  
  // Store original values
  const originalDebit = transaction.debit;
  const originalCredit = transaction.credit;
  
  // Convert to local currency
  const convertedDebit = originalDebit !== null ? convertAmount(originalDebit, detectedCurrency, localCurrency) : null;
  const convertedCredit = originalCredit !== null ? convertAmount(originalCredit, detectedCurrency, localCurrency) : null;
  
  return {
    ...transaction,
    debit: convertedDebit,
    credit: convertedCredit,
    originalCurrency: detectedCurrency,
    originalDebit,
    originalCredit,
    exchangeRate,
    localCurrency,
  } as MultiCurrencyTransaction;
}

/**
 * Process all transactions for multi-currency handling
 */
export function processMultiCurrencyTransactions(
  transactions: ParsedTransaction[],
  localCurrency: CurrencyCode,
  enableDetection: boolean = true
): MultiCurrencyTransaction[] {
  return transactions.map(tx => {
    if (!enableDetection) {
      return { ...tx, localCurrency } as MultiCurrencyTransaction;
    }
    
    // Try to detect currency from description
    const detectedCurrency = detectCurrencyFromDescription(tx.description) ?? 'UNKNOWN';
    
    if (detectedCurrency !== 'UNKNOWN' && detectedCurrency !== localCurrency) {
      return convertTransactionToLocal(tx, detectedCurrency, localCurrency);
    }
    
    return { ...tx, localCurrency } as MultiCurrencyTransaction;
  });
}

/**
 * Get currency summary for a document
 */
export function getCurrencySummary(
  transactions: MultiCurrencyTransaction[]
): Map<CurrencyCode, { count: number; totalDebit: number; totalCredit: number }> {
  const summary = new Map<CurrencyCode, { count: number; totalDebit: number; totalCredit: number }>();
  
  for (const tx of transactions) {
    const currency = tx.originalCurrency ?? tx.localCurrency ?? 'UNKNOWN';
    const existing = summary.get(currency) ?? { count: 0, totalDebit: 0, totalCredit: 0 };
    
    summary.set(currency, {
      count: existing.count + 1,
      totalDebit: existing.totalDebit + (tx.originalDebit ?? tx.debit ?? 0),
      totalCredit: existing.totalCredit + (tx.originalCredit ?? tx.credit ?? 0),
    });
  }
  
  return summary;
}

/**
 * Check if document has multiple currencies
 */
export function isMultiCurrencyDocument(transactions: MultiCurrencyTransaction[]): boolean {
  const currencies = new Set<CurrencyCode>();
  
  for (const tx of transactions) {
    if (tx.originalCurrency) {
      currencies.add(tx.originalCurrency);
    }
    if (tx.localCurrency) {
      currencies.add(tx.localCurrency);
    }
  }
  
  // Filter out UNKNOWN
  currencies.delete('UNKNOWN');
  
  return currencies.size > 1;
}

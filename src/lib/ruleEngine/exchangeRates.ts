/**
 * Exchange Rate Provider
 * Static fallback rates for currency conversion
 * 
 * Note: These are approximate rates and should be overridden
 * with live rates for production accuracy
 */

import type { CurrencyCode } from './currencyHandler';

// =============================================================================
// TYPES
// =============================================================================

export interface ExchangeRateTable {
  [fromCurrency: string]: {
    [toCurrency: string]: number;
  };
}

// =============================================================================
// STATIC EXCHANGE RATES
// Base currency: USD (rates as of a reference date)
// =============================================================================

/**
 * Rates relative to USD (1 USD = X currency)
 */
const USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 149.5,
  CNY: 7.25,
  AUD: 1.54,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  AED: 3.67,
  SAR: 3.75,
  ZAR: 18.5,
  MYR: 4.72,
  THB: 35.5,
  PHP: 56.0,
  IDR: 15600,
  KRW: 1330,
  NZD: 1.68,
  SEK: 10.5,
  NOK: 10.7,
  DKK: 6.88,
  PLN: 4.0,
  BRL: 4.95,
  MXN: 17.2,
  RUB: 92.0,
  TRY: 32.0,
  EGP: 50.0,
  NGN: 1550,
  KES: 153,
};

// =============================================================================
// EXCHANGE RATE FUNCTIONS
// =============================================================================

/**
 * Get the exchange rate from one currency to another
 */
export function getExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) return 1.0;
  if (fromCurrency === 'UNKNOWN' || toCurrency === 'UNKNOWN') return 1.0;
  
  const fromRate = USD_RATES[fromCurrency];
  const toRate = USD_RATES[toCurrency];
  
  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return 1.0;
  }
  
  // Calculate cross rate through USD
  // If 1 USD = fromRate FROM and 1 USD = toRate TO
  // Then 1 FROM = (toRate / fromRate) TO
  return toRate / fromRate;
}

/**
 * Convert an amount from one currency to another
 */
export function convertAmount(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get all available exchange rates for a currency
 */
export function getRatesForCurrency(
  currency: CurrencyCode
): Record<string, number> {
  const rates: Record<string, number> = {};
  
  for (const targetCurrency of Object.keys(USD_RATES)) {
    rates[targetCurrency] = getExchangeRate(currency, targetCurrency as CurrencyCode);
  }
  
  return rates;
}

/**
 * Format amount with currency
 */
export function formatWithCurrency(
  amount: number,
  currency: CurrencyCode
): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    AED: 'AED',
    SAR: 'SAR',
    ZAR: 'R',
    MYR: 'RM',
    SGD: 'S$',
    HKD: 'HK$',
    THB: '฿',
    KRW: '₩',
    BRL: 'R$',
  };
  
  const symbol = symbols[currency] ?? currency;
  const decimals = ['JPY', 'KRW', 'IDR'].includes(currency) ? 0 : 2;
  
  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * Get the complete exchange rate table
 */
export const EXCHANGE_RATES = USD_RATES;

/**
 * Check if a currency is supported
 */
export function isCurrencySupported(currency: string): currency is CurrencyCode {
  return currency in USD_RATES || currency === 'UNKNOWN';
}

/**
 * Get list of all supported currencies
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return Object.keys(USD_RATES) as CurrencyCode[];
}

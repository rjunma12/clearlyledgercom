/**
 * Bank Profile Types
 * Defines the structure for bank-specific parsing configurations
 */

import type { Locale, NumberFormat } from '../types';

// =============================================================================
// BANK IDENTIFICATION
// =============================================================================

export interface BankIdentification {
  /** Bank name patterns to search for in document text */
  logoPatterns: string[];
  /** Account number format regex patterns */
  accountPatterns?: RegExp[];
  /** Unique identifiers like SWIFT codes, routing numbers */
  uniqueIdentifiers?: string[];
  /** Minimum confidence threshold for detection (0-1) */
  confidenceThreshold: number;
}

// =============================================================================
// COLUMN CONFIGURATION
// =============================================================================

export type ColumnOrder = 'date-desc-debit-credit-balance' 
  | 'date-desc-amount-balance'
  | 'date-desc-credit-debit-balance'
  | 'date-ref-desc-debit-credit-balance'
  | 'custom';

export interface ColumnConfiguration {
  /** Standard column order for this bank */
  columnOrder: ColumnOrder;
  /** Custom column order when columnOrder is 'custom' */
  customOrder?: string[];
  /** Does this bank merge debit/credit into single "Amount" column? */
  mergedDebitCredit: boolean;
  /** Indicators for debit in merged column */
  debitIndicators?: string[];
  /** Indicators for credit in merged column */
  creditIndicators?: string[];
  /** Position of balance column (helps with alignment) */
  balancePosition: 'left' | 'right' | 'none';
  /** Does this bank include a reference/check number column? */
  hasReferenceColumn?: boolean;
  /** Typical X-coordinate ranges for columns (percentage of page width) */
  columnHints?: {
    date?: [number, number];
    description?: [number, number];
    debit?: [number, number];
    credit?: [number, number];
    balance?: [number, number];
  };
}

// =============================================================================
// SPECIAL PARSING RULES
// =============================================================================

export interface AmountFormatting {
  /** Currency symbol used */
  currencySymbol?: string;
  /** Position of currency symbol */
  symbolPosition?: 'prefix' | 'suffix';
  /** How negative amounts are shown */
  negativeFormat?: 'minus' | 'parentheses' | 'suffix-dr' | 'suffix-cr' | 'red';
  /** Number format override */
  numberFormat?: NumberFormat;
}

export interface DateFormatting {
  /** Preferred date format patterns (in priority order) */
  dateFormats: string[];
  /** Date separator character */
  dateSeparator?: string;
  /** How the bank handles year in dates */
  yearFormat?: '2-digit' | '4-digit' | 'both';
}

export interface SpecialRules {
  /** Date formatting rules */
  dateFormatting: DateFormatting;
  /** Amount formatting rules */
  amountFormatting?: AmountFormatting;
  /** Patterns that indicate a row should be skipped */
  skipPatterns?: RegExp[];
  /** Patterns that indicate opening balance row */
  openingBalancePatterns?: RegExp[];
  /** Patterns that indicate closing balance row */
  closingBalancePatterns?: RegExp[];
  /** Does this bank use multi-line descriptions frequently? */
  multiLineDescriptions?: boolean;
  /** Maximum lines for a single transaction description */
  maxDescriptionLines?: number;
  /** Patterns that mark continuation lines (not new transactions) */
  continuationPatterns?: RegExp[];
  /** Patterns that mark page headers to skip */
  pageHeaderPatterns?: RegExp[];
  /** Patterns that mark page footers to skip */
  pageFooterPatterns?: RegExp[];
}

// =============================================================================
// BANK PROFILE
// =============================================================================

export interface BankProfile {
  /** Unique identifier for the bank */
  id: string;
  /** Display name of the bank */
  name: string;
  /** Country/region code */
  region: string;
  /** Default locale for this bank */
  defaultLocale: Locale;
  /** Bank identification patterns */
  identification: BankIdentification;
  /** Column configuration */
  columnConfig: ColumnConfiguration;
  /** Special parsing rules */
  specialRules: SpecialRules;
  /** Version of the profile (for updates) */
  version: string;
  /** Last updated timestamp */
  lastUpdated: string;
}

// =============================================================================
// DETECTION RESULT
// =============================================================================

export interface BankDetectionResult {
  /** Detected bank profile (null if no match) */
  profile: BankProfile | null;
  /** Detection confidence (0-1) */
  confidence: number;
  /** Matched patterns that led to detection */
  matchedPatterns: string[];
  /** Was this an exact match or fuzzy? */
  matchType: 'exact' | 'fuzzy' | 'fallback';
}

// =============================================================================
// PROFILE REGISTRY TYPES
// =============================================================================

export interface ProfileRegistry {
  /** Get all registered profiles */
  getAll(): BankProfile[];
  /** Get profile by ID */
  getById(id: string): BankProfile | undefined;
  /** Get profiles by region */
  getByRegion(region: string): BankProfile[];
  /** Detect bank from document content */
  detectBank(textContent: string[], fileName?: string): BankDetectionResult;
  /** Register a custom profile */
  register(profile: BankProfile): void;
  /** Get the generic fallback profile */
  getGenericProfile(): BankProfile;
}

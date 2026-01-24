/**
 * Citibank (US) Profile
 * Citigroup - United States / Global
 */

import type { BankProfile } from '../types';

export const citibankUSProfile: BankProfile = {
  id: 'citibank-us',
  name: 'Citibank',
  region: 'US',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'Citibank',
      'CITIBANK',
      'Citi',
      'CITI',
      'citibank.com',
      'Citigroup',
      'citi.com',
    ],
    accountPatterns: [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Standard format
      /\bAccount\s*#?\s*\d{10,14}\b/i,
    ],
    uniqueIdentifiers: ['CITIUS33', 'CITIUSXX'], // SWIFT codes
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'DEBIT'],
    creditIndicators: ['+', 'CR', 'CREDIT'],
    balancePosition: 'right',
    hasReferenceColumn: false,
    columnHints: {
      date: [0, 15],
      description: [15, 55],
      debit: [55, 70],
      credit: [70, 85],
      balance: [85, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM/DD/YY', 'MMM DD, YYYY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '$',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
    skipPatterns: [
      /^account\s+summary/i,
      /^transaction\s+detail/i,
      /^previous\s+statement/i,
      /^total\s+credits/i,
      /^total\s+debits/i,
      /^account\s+activity/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
      /^opening\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^closing\s+balance/i,
      /^current\s+balance/i,
    ],
    pageHeaderPatterns: [
      /^citibank\s+statement/i,
      /^account\s+statement/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^member\s+fdic/i,
    ],
    continuationPatterns: [
      /^ref\s*#?\s*\d+/i,
      /^confirmation\s*#?\s*\d+/i,
    ],
  },
};

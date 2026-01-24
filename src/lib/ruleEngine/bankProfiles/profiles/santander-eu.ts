/**
 * Santander Bank Profile
 * Banco Santander - Spain/UK/Europe
 */

import type { BankProfile } from '../types';

export const santanderEUProfile: BankProfile = {
  id: 'santander-eu',
  name: 'Santander',
  region: 'EU',
  defaultLocale: 'en-GB', // UK format as primary, also supports ES
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'Santander',
      'SANTANDER',
      'santander.com',
      'Banco Santander',
      'santander.co.uk',
      'santander.es',
    ],
    accountPatterns: [
      /\b\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/, // UK sort code
      /\b\d{8}\b/, // UK account number
      /\bES\d{22}\b/, // Spanish IBAN
    ],
    uniqueIdentifiers: ['BSCHGB2L', 'BSCHESMM'], // UK and Spain SWIFT codes
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'D'],
    creditIndicators: ['+', 'CR', 'C'],
    balancePosition: 'right',
    hasReferenceColumn: false,
    columnHints: {
      date: [0, 12],
      description: [12, 55],
      debit: [55, 70],
      credit: [70, 85],
      balance: [85, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD MMM YYYY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '£', // Default to GBP, EUR also supported
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '£',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
    skipPatterns: [
      /^account\s+summary/i,
      /^transaction\s+history/i,
      /^your\s+transactions/i,
      /^money\s+in/i,
      /^money\s+out/i,
      /^total\s+in/i,
      /^total\s+out/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
      /^saldo\s+anterior/i, // Spanish
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^saldo\s+actual/i, // Spanish
    ],
    pageHeaderPatterns: [
      /^santander/i,
      /^banco\s+santander/i,
      /^statement/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^santander\s+uk\s+plc/i,
    ],
    continuationPatterns: [
      /^ref\s*:?\s*\w+/i,
    ],
  },
};

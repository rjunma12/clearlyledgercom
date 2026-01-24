/**
 * Lloyds Bank (UK) Profile
 * Lloyds Banking Group - United Kingdom
 */

import type { BankProfile } from '../types';

export const lloydsUKProfile: BankProfile = {
  id: 'lloyds-uk',
  name: 'Lloyds Bank',
  region: 'UK',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'Lloyds Bank',
      'LLOYDS',
      'Lloyds Banking Group',
      'lloydsbank.com',
      'Lloyds TSB',
    ],
    accountPatterns: [
      /\b\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/, // UK sort code
      /\b\d{8}\b/, // UK account number
    ],
    uniqueIdentifiers: ['LOYDGB2L', 'LOYDGB21'], // SWIFT codes
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'OUT'],
    creditIndicators: ['+', 'CR', 'IN'],
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
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY', 'DD MMM YYYY', 'DD MMM YY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '£',
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
      /^your\s+transactions/i,
      /^date\s+description/i,
      /^money\s+out/i,
      /^money\s+in/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
    ],
    pageHeaderPatterns: [
      /^lloyds\s+bank/i,
      /^statement/i,
      /^sort\s+code/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^lloyds\s+bank\s+plc/i,
    ],
    continuationPatterns: [
      /^ref\s*:?\s*\d+/i,
    ],
  },
};

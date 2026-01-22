/**
 * Barclays Bank (UK) Profile
 * Barclays PLC - United Kingdom
 */

import type { BankProfile } from '../types';

export const barclaysUKProfile: BankProfile = {
  id: 'barclays-uk',
  name: 'Barclays Bank',
  region: 'GB',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-01-22',
  
  identification: {
    logoPatterns: [
      'Barclays',
      'BARCLAYS',
      'Barclays Bank',
      'barclays.co.uk',
    ],
    accountPatterns: [
      /\b\d{8}\b/, // 8-digit account number
      /\b\d{2}-\d{2}-\d{2}\b/, // Sort code
    ],
    uniqueIdentifiers: ['BARCGB22'], // SWIFT code
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
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
      dateFormats: ['DD MMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
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
    maxDescriptionLines: 2,
    skipPatterns: [
      /^sort\s+code/i,
      /^account\s+number/i,
      /^iban/i,
      /^bic/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
    ],
    pageHeaderPatterns: [
      /^your\s+statement/i,
      /^current\s+account/i,
    ],
    pageFooterPatterns: [
      /^barclays\s+bank/i,
      /^registered\s+in\s+england/i,
    ],
    continuationPatterns: [
      /^ref\s*:?\s*\w+/i,
    ],
  },
};

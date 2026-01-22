/**
 * Bank of America (US) Profile
 * Bank of America Corporation - United States
 */

import type { BankProfile } from '../types';

export const bofaUSProfile: BankProfile = {
  id: 'bofa-us',
  name: 'Bank of America',
  region: 'US',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-01-22',
  
  identification: {
    logoPatterns: [
      'Bank of America',
      'BANK OF AMERICA',
      'bankofamerica.com',
      'BofA',
    ],
    accountPatterns: [
      /\b\d{12}\b/, // 12-digit account number
      /\b\d{4}\s*\d{4}\s*\d{4}\b/,
    ],
    uniqueIdentifiers: ['BOFAUS3N'], // SWIFT code
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true, // BofA uses single Amount column
    debitIndicators: ['-', '−'],
    creditIndicators: ['+'],
    balancePosition: 'right',
    hasReferenceColumn: false,
    columnHints: {
      date: [0, 12],
      description: [12, 65],
      debit: [65, 82], // Merged amount
      balance: [82, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM/DD/YY'],
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
      /^deposits?\s+and\s+other\s+credits/i,
      /^withdrawals?\s+and\s+other\s+debits/i,
      /^beginning\s+balance/i,
      /^ending\s+balance/i,
      /^total\s+(deposits|withdrawals)/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+statement\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
    ],
    pageHeaderPatterns: [
      /^bank\s+of\s+america/i,
      /^account\s+statement/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+/i,
      /^member\s+fdic/i,
    ],
    continuationPatterns: [
      /^confirmation\s*#?\s*\d+/i,
      /^ref\s*#?\s*\d+/i,
    ],
  },
};

/**
 * Standard Chartered Bank Profile
 * Standard Chartered PLC - UK/Asia/Middle East
 */

import type { BankProfile } from '../types';

export const standardCharteredProfile: BankProfile = {
  id: 'standard-chartered',
  name: 'Standard Chartered',
  region: 'GLOBAL',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'Standard Chartered',
      'STANDARD CHARTERED',
      'sc.com',
      'StanChart',
      'SCB',
    ],
    accountPatterns: [
      /\b\d{11,14}\b/, // Various account formats
      /\b\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/, // UK sort code
    ],
    uniqueIdentifiers: ['SCBLGB2L', 'SCBLHKHH', 'SCBLSGSG'], // UK, HK, SG SWIFT codes
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'DEBIT'],
    creditIndicators: ['+', 'CR', 'CREDIT'],
    balancePosition: 'right',
    hasReferenceColumn: true,
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY', 'DD MMM YY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '$', // Multi-currency, default to USD
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
      /^transaction\s+details/i,
      /^account\s+activity/i,
      /^total\s+debits/i,
      /^total\s+credits/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
      /^b\/f/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^c\/f/i,
    ],
    pageHeaderPatterns: [
      /^standard\s+chartered/i,
      /^statement\s+of\s+account/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^standard\s+chartered\s+bank/i,
    ],
    continuationPatterns: [
      /^ref\s*:?\s*\w+/i,
      /^transaction\s+ref/i,
    ],
  },
};

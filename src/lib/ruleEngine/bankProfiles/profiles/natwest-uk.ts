/**
 * NatWest Bank (UK) Profile
 * NatWest Group (formerly RBS) - United Kingdom
 */

import type { BankProfile } from '../types';

export const natwestUKProfile: BankProfile = {
  id: 'natwest-uk',
  name: 'NatWest',
  region: 'UK',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'NatWest',
      'NATWEST',
      'natwest.com',
      'National Westminster',
      'RBS',
      'Royal Bank of Scotland',
    ],
    accountPatterns: [
      /\b\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/, // UK sort code
      /\b\d{8}\b/, // UK account number
    ],
    uniqueIdentifiers: ['NWBKGB2L', 'RBOSGB2L'], // SWIFT codes for NatWest and RBS
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
      date: [0, 15],
      description: [15, 55],
      debit: [55, 70],
      credit: [70, 85],
      balance: [85, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY', 'DD MMM YYYY', 'DD-MMM-YY'],
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
      /^statement\s+summary/i,
      /^your\s+transactions/i,
      /^transaction\s+list/i,
      /^total\s+paid\s+in/i,
      /^total\s+paid\s+out/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
      /^balance\s+b\/f/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^balance\s+c\/f/i,
    ],
    pageHeaderPatterns: [
      /^natwest/i,
      /^royal\s+bank\s+of\s+scotland/i,
      /^statement\s+of\s+account/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^natwest\s+group/i,
    ],
    continuationPatterns: [
      /^ref\s*:?\s*\w+/i,
    ],
  },
};

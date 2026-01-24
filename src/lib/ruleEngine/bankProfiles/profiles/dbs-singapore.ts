/**
 * DBS Bank (Singapore) Profile
 * DBS Group Holdings - Singapore / Southeast Asia
 */

import type { BankProfile } from '../types';

export const dbsSingaporeProfile: BankProfile = {
  id: 'dbs-singapore',
  name: 'DBS Bank',
  region: 'SG',
  defaultLocale: 'en-US', // Singapore uses US-style dates in banking
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'DBS Bank',
      'DBS',
      'dbs.com',
      'DBS Group',
      'POSB', // DBS-owned brand
      'posb.com.sg',
    ],
    accountPatterns: [
      /\b\d{3}[\s-]?\d{6}[\s-]?\d{1}\b/, // DBS account format
      /\b\d{10}\b/, // Standard 10-digit
    ],
    uniqueIdentifiers: ['DBSSSGSG', 'DBSSSGSGXXX'], // SWIFT codes
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
      dateFormats: ['DD MMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: 'S$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: 'S$',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
    skipPatterns: [
      /^account\s+summary/i,
      /^transaction\s+history/i,
      /^statement\s+of\s+account/i,
      /^total\s+debits/i,
      /^total\s+credits/i,
      /^account\s+details/i,
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
      /^dbs\s+bank/i,
      /^posb/i,
      /^statement\s+date/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^dbs\s+bank\s+ltd/i,
    ],
    continuationPatterns: [
      /^ref\s*:?\s*\w+/i,
      /^trans\s*ref/i,
    ],
  },
};

/**
 * HSBC Bank (UK) Profile
 * HSBC Holdings plc - United Kingdom
 */

import type { BankProfile } from '../types';

export const hsbcUKProfile: BankProfile = {
  id: 'hsbc-uk',
  name: 'HSBC Bank',
  region: 'GB',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-01-22',
  
  identification: {
    logoPatterns: [
      'HSBC',
      'HSBC Bank',
      'HSBC UK',
      'hsbc.co.uk',
      'Hongkong and Shanghai',
    ],
    accountPatterns: [
      /\b\d{8}\b/, // 8-digit account number
      /\b\d{2}-\d{2}-\d{2}\b/, // Sort code
    ],
    uniqueIdentifiers: ['MIDLGB22'], // SWIFT code
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
      dateFormats: ['DD MMM YY', 'DD MMM YYYY', 'DD/MM/YYYY'],
      dateSeparator: ' ',
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
      /^sort\s+code/i,
      /^account\s+number/i,
      /^swift/i,
      /^iban/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+at\s+end/i,
    ],
    pageHeaderPatterns: [
      /^statement\s+details/i,
      /^account\s+summary/i,
    ],
    pageFooterPatterns: [
      /^hsbc\s+bank\s+plc/i,
      /^registered\s+office/i,
    ],
    continuationPatterns: [
      /^mandate\s*:?\s*\w+/i,
      /^reference\s*:?\s*\w+/i,
    ],
  },
};

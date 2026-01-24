/**
 * Wells Fargo Bank (US) Profile
 * Wells Fargo & Company - United States
 */

import type { BankProfile } from '../types';

export const wellsFargoUSProfile: BankProfile = {
  id: 'wells-fargo-us',
  name: 'Wells Fargo',
  region: 'US',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'Wells Fargo',
      'WELLS FARGO',
      'wellsfargo.com',
      'WellsFargo',
      'Wells Fargo Bank',
      'Wells Fargo & Company',
    ],
    accountPatterns: [
      /\b\d{4}\s*\d{4}\s*\d{4}\b/, // Standard account format
      /\bAccount\s*#?\s*\d{10,12}\b/i, // Account number
    ],
    uniqueIdentifiers: ['WFBIUS6S', 'WFBIUS6WFFX'], // SWIFT codes
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR'],
    creditIndicators: ['+', 'CR'],
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
      dateFormats: ['MM/DD/YYYY', 'MM/DD/YY', 'MM/DD'],
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
      /^daily\s+balance\s+summary/i,
      /^account\s+activity/i,
      /^transaction\s+history/i,
      /^withdrawals/i,
      /^deposits/i,
      /^checks\s+paid/i,
      /^other\s+withdrawals/i,
      /^account\s+summary/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^opening\s+balance/i,
      /^balance\s+forward/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^closing\s+balance/i,
    ],
    pageHeaderPatterns: [
      /^wells\s+fargo\s+bank/i,
      /^account\s+statement/i,
      /^statement\s+period/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^member\s+fdic/i,
      /^equal\s+housing\s+lender/i,
    ],
    continuationPatterns: [
      /^confirmation\s*#?\s*\d+/i,
      /^ref\s*#?\s*\d+/i,
    ],
  },
};

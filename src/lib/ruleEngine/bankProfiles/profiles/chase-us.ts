/**
 * Chase Bank (US) Profile
 * JPMorgan Chase - United States
 */

import type { BankProfile } from '../types';

export const chaseUSProfile: BankProfile = {
  id: 'chase-us',
  name: 'Chase Bank',
  region: 'US',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-01-22',
  
  identification: {
    logoPatterns: [
      'JPMorgan Chase',
      'CHASE',
      'Chase Bank',
      'chase.com',
      'JPMORGAN',
    ],
    accountPatterns: [
      /\b\d{4}\s*\d{4}\s*\d{4}\b/, // Account format
    ],
    uniqueIdentifiers: ['CHASUS33'], // SWIFT code
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true, // Chase uses single Amount column
    debitIndicators: ['-', '−', 'DR', 'DEBIT'],
    creditIndicators: ['+', 'CR', 'CREDIT'],
    balancePosition: 'right',
    hasReferenceColumn: false,
    columnHints: {
      date: [0, 15],
      description: [15, 65],
      debit: [65, 85], // Merged amount column
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
    maxDescriptionLines: 4,
    skipPatterns: [
      /^account\s+activity/i,
      /^transaction\s+type/i,
      /^beginning\s+balance/i,
      /^ending\s+balance/i,
      /^deposits?\s+and\s+additions/i,
      /^electronic\s+withdrawals/i,
      /^atm\s+&\s+debit\s+card/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^new\s+balance/i,
    ],
    pageHeaderPatterns: [
      /^checking\s+summary/i,
      /^savings\s+summary/i,
      /^account\s+number/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^member\s+fdic/i,
    ],
    continuationPatterns: [
      /^card\s+\d{4}/i, // Card number continuation
      /^ref\s*#?\s*\d+/i, // Reference number
    ],
  },
};

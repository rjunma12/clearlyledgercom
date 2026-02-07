/**
 * Capital One (United States) Profile
 * Major credit card issuer and bank
 */

import type { BankProfile } from '../types';

export const capitaloneUSProfile: BankProfile = {
  id: 'capitalone-us',
  name: 'Capital One',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['CAPITAL ONE', 'capitalone.com', 'CAPITAL ONE BANK', 'Capital One, N.A.'],
    accountPatterns: [/\b\d{10,16}\b/],
    uniqueIdentifiers: ['HIBKUS3N', 'NFBKUS33'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'Purchase', 'Payment'],
    creditIndicators: ['+', 'Credit', 'Refund'],
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM/DD/YY', 'MMM DD, YYYY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^account\s+ending/i,
      /^statement\s+period/i,
      /^statement\s+date/i,
      /^page\s+\d+/i,
      /^payment\s+due/i,
      /^minimum\s+payment/i,
    ],
    openingBalancePatterns: [
      /^previous\s+balance/i,
      /^beginning\s+balance/i,
      /^balance\s+forward/i,
    ],
    closingBalancePatterns: [
      /^new\s+balance/i,
      /^ending\s+balance/i,
      /^current\s+balance/i,
      /^statement\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

/**
 * Goldman Sachs Bank US Profile
 * #6 by assets, Investment bank
 */

import type { BankProfile } from '../types';

export const goldmanUsProfile: BankProfile = {
  id: 'goldman-us',
  name: 'Goldman Sachs Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['GOLDMAN SACHS', 'GOLDMAN', 'GS BANK', 'Marcus by Goldman Sachs', 'marcus.com'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['GOLDUS33', 'GSBANK'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit', 'Withdrawal'],
    creditIndicators: ['+', 'CR', 'Credit', 'Deposit'],
    balancePosition: 'right',
    hasReferenceColumn: true,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM-DD-YYYY', 'MMM DD, YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^routing\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^interest\s+rate/i,
      /^annual\s+percentage/i,
      /^apy/i,
      /^high[\s-]yield\s+savings/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
      /^starting\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
      /^available\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};

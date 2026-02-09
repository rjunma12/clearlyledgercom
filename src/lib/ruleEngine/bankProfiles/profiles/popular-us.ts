/**
 * Popular Bank US Profile
 * Puerto Rico / Northeast regional
 */

import type { BankProfile } from '../types';

export const popularUsProfile: BankProfile = {
  id: 'popular-us',
  name: 'Popular Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['POPULAR BANK', 'POPULAR', 'popularbank.com', 'BANCO POPULAR'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['BPPRPRSX', 'POPULAR'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit', 'Débito'],
    creditIndicators: ['+', 'CR', 'Credit', 'Crédito'],
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'DD/MM/YYYY', 'MMM DD, YYYY'],
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
      /^número\s+de\s+cuenta/i,
      /^routing\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
      /^balance\s+anterior/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
      /^balance\s+actual/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};

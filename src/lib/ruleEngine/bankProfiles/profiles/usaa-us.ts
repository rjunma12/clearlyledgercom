/**
 * USAA Federal Savings Bank US Profile
 * Military banking with multi-product statements
 */

import type { BankProfile } from '../types';

export const usaaUsProfile: BankProfile = {
  id: 'usaa-us',
  name: 'USAA Federal Savings Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['USAA', 'usaa.com', 'USAA FEDERAL SAVINGS', 'USAA BANK'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['USAAUS44', 'USAAFSB'],
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
      /^insurance\s+premium/i,
      /^auto\s+policy/i,
      /^home\s+policy/i,
      /^life\s+insurance/i,
      /^member\s+since/i,
      /^military\s+affiliation/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
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

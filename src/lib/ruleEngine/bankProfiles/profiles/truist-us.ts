/**
 * Truist Bank US Profile
 * BB&T + SunTrust merger
 */

import type { BankProfile } from '../types';

export const truistUsProfile: BankProfile = {
  id: 'truist-us',
  name: 'Truist Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['TRUIST', 'TRUIST BANK', 'truist.com', 'BB&T', 'SUNTRUST'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['BRBTUS33', 'BRBT'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit'],
    creditIndicators: ['+', 'CR', 'Credit'],
    balancePosition: 'right',
    hasReferenceColumn: false,
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
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

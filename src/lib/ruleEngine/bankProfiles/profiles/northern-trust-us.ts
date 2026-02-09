/**
 * Northern Trust US Profile
 * Wealth management / institutional
 */

import type { BankProfile } from '../types';

export const northernTrustUsProfile: BankProfile = {
  id: 'northern-trust-us',
  name: 'Northern Trust',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['NORTHERN TRUST', 'northerntrust.com', 'NTRS'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['CNORUS44', 'NTRUST'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'Debit'],
    creditIndicators: ['+', 'CR', 'Credit'],
    balancePosition: 'right',
    hasReferenceColumn: true,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'parentheses',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^wealth\s+management/i,
      /^trust\s+services/i,
      /^investment\s+management/i,
      /^fiduciary/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^opening\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^closing\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};

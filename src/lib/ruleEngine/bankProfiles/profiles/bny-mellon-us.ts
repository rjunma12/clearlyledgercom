/**
 * Bank of New York Mellon US Profile
 * Custody / institutional banking
 */

import type { BankProfile } from '../types';

export const bnyMellonUsProfile: BankProfile = {
  id: 'bny-mellon-us',
  name: 'Bank of New York Mellon',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['BNY MELLON', 'BANK OF NEW YORK', 'bnymellon.com', 'BNY'],
    accountPatterns: [/\b\d{10,14}\b/, /\b[A-Z]{2}\d{10}\b/],
    uniqueIdentifiers: ['IRVTUS3N', 'BNYMLLN'],
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
      dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'],
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
      /^custody\s+services/i,
      /^asset\s+servicing/i,
      /^securities\s+lending/i,
      /^corporate\s+trust/i,
      /^wealth\s+management/i,
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

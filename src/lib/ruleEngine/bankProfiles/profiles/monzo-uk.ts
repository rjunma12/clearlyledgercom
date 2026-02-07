/**
 * Monzo UK Profile
 * Digital challenger bank
 */

import type { BankProfile } from '../types';

export const monzoUkProfile: BankProfile = {
  id: 'monzo-uk',
  name: 'Monzo',
  region: 'UK',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['MONZO', 'monzo.com', 'MONZO BANK'],
    accountPatterns: [/\b\d{8}\b/, /\b\d{2}-\d{2}-\d{2}\b/],
    uniqueIdentifiers: ['MONZGB2L', 'MONZ'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-'],
    creditIndicators: ['+'],
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD MMM YYYY', 'DD-MM-YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '£',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^sort\s+code/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^starting\s+balance/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^ending\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

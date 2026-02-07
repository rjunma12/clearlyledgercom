/**
 * American Express US Profile
 * Card statements
 */

import type { BankProfile } from '../types';

export const amexUsProfile: BankProfile = {
  id: 'amex-us',
  name: 'American Express',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['AMERICAN EXPRESS', 'AMEX', 'americanexpress.com', 'MEMBERSHIP REWARDS'],
    accountPatterns: [/\b\d{15}\b/, /\b3\d{14}\b/],
    uniqueIdentifiers: ['AEABORIN', 'AMEX'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'CR'],
    creditIndicators: ['+'],
    balancePosition: 'right',
    hasReferenceColumn: true,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM-DD-YYYY', 'MMM DD, YYYY', 'MM/DD'],
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
      /^member\s+since/i,
      /^statement\s+closing/i,
      /^page\s+\d+/i,
      /^payment\s+due/i,
    ],
    openingBalancePatterns: [
      /^previous\s+balance/i,
      /^balance\s+from\s+last/i,
    ],
    closingBalancePatterns: [
      /^new\s+balance/i,
      /^total\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

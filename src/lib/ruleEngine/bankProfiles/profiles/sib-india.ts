/**
 * South Indian Bank Profile
 * South India-focused private bank
 */

import type { BankProfile } from '../types';

export const sibIndiaProfile: BankProfile = {
  id: 'sib-india',
  name: 'South Indian Bank',
  region: 'IN',
  defaultLocale: 'en-IN',
  identification: {
    logoPatterns: ['SOUTH INDIAN BANK', 'southindianbank.com', 'SIB'],
    accountPatterns: [/\b\d{14}\b/, /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{2}\b/],
    uniqueIdentifiers: ['SIABORIN', 'SIBL'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: true,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY', 'DD-MMM-YYYY'],
      dateSeparator: '-',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '₹',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^ifsc\s+code/i,
      /^micr\s+code/i,
      /^branch\s+code/i,
      /^customer\s+id/i,
      /^statement\s+of\s+account/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^b\/f/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^c\/f/i,
      /^carried\s+forward/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

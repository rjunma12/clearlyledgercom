/**
 * Santander UK Profile
 * Major UK retail bank
 */

import type { BankProfile } from '../types';

export const santanderUkProfile: BankProfile = {
  id: 'santander-uk',
  name: 'Santander UK',
  region: 'UK',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['SANTANDER', 'santander.co.uk', 'SANTANDER UK'],
    accountPatterns: [/\b\d{8}\b/, /\b\d{2}-\d{2}-\d{2}\b/],
    uniqueIdentifiers: ['ABBYGB2L', 'ABBY'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY'],
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
      /^statement\s+period/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

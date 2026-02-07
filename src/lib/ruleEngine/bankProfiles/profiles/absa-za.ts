/**
 * ABSA Bank South Africa Profile
 * Major retail bank in South Africa
 */

import type { BankProfile } from '../types';

export const absaZaProfile: BankProfile = {
  id: 'absa-za',
  name: 'ABSA Bank',
  region: 'ZA',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['ABSA', 'ABSA BANK', 'absa.co.za', 'ABSA GROUP'],
    accountPatterns: [/\b\d{10,11}\b/, /\b4\d{9}\b/],
    uniqueIdentifiers: ['ABSAZAJJ', 'ABSA'],
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
      dateFormats: ['DD/MM/YYYY', 'YYYY/MM/DD', 'DD MMM YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'R',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^branch\s+code/i,
      /^statement\s+period/i,
      /^swift\s+code/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^available\s+balance/i,
      /^carried\s+forward/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

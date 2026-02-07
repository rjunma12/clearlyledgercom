/**
 * Standard Bank South Africa Profile
 * Largest bank in Africa
 */

import type { BankProfile } from '../types';

export const standardbankZaProfile: BankProfile = {
  id: 'standardbank-za',
  name: 'Standard Bank',
  region: 'ZA',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['STANDARD BANK', 'standardbank.co.za', 'STANBIC', 'STANDARD BANK GROUP'],
    accountPatterns: [/\b\d{9,11}\b/, /\b\d{6}\s*\d{5}\b/],
    uniqueIdentifiers: ['SBZAZAJJ', 'SBZA'],
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
      numberFormat: 'en-ZA',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^branch\s+code/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^swift\s+code/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+c\/f/i,
      /^carried\s+forward/i,
      /^available\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

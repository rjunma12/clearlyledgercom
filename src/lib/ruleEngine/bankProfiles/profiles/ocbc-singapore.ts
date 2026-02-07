/**
 * OCBC Singapore Profile
 * 2nd largest bank in Singapore
 */

import type { BankProfile } from '../types';

export const ocbcSingaporeProfile: BankProfile = {
  id: 'ocbc-singapore',
  name: 'OCBC Bank',
  region: 'SG',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['OCBC', 'OCBC BANK', 'ocbc.com', 'OVERSEA-CHINESE BANKING'],
    accountPatterns: [/\b\d{10,12}\b/, /\b\d{3}-\d{6}-\d{3}\b/],
    uniqueIdentifiers: ['OCBCSGSG', 'OCBC'],
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
      dateFormats: ['DD MMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'],
      dateSeparator: ' ',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'S$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^statement\s+date/i,
      /^page\s+\d+/i,
      /^branch\s+code/i,
    ],
    openingBalancePatterns: [
      /^balance\s+b\/f/i,
      /^opening\s+balance/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^balance\s+c\/f/i,
      /^closing\s+balance/i,
      /^carried\s+forward/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

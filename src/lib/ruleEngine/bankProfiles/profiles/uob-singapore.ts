/**
 * UOB Singapore Profile
 * 3rd largest bank in Singapore
 */

import type { BankProfile } from '../types';

export const uobSingaporeProfile: BankProfile = {
  id: 'uob-singapore',
  name: 'UOB',
  region: 'SG',
  defaultLocale: 'en-SG',
  identification: {
    logoPatterns: ['UOB', 'UNITED OVERSEAS BANK', 'uob.com.sg', 'UOB GROUP'],
    accountPatterns: [/\b\d{10,13}\b/, /\b\d{3}-\d{6}-\d{1}\b/],
    uniqueIdentifiers: ['UOVBSGSG', 'UOVB'],
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
      numberFormat: 'en-SG',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^statement\s+date/i,
      /^page\s+\d+/i,
      /^branch/i,
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

/**
 * Access Bank Nigeria Profile
 * Major retail bank in Nigeria
 */

import type { BankProfile } from '../types';

export const accessNgProfile: BankProfile = {
  id: 'access-ng',
  name: 'Access Bank',
  region: 'NG',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['ACCESS BANK', 'accessbankplc.com', 'ACCESS BANK PLC'],
    accountPatterns: [/\b\d{10}\b/],
    uniqueIdentifiers: ['ABNGNGLA', 'ABNG'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '₦',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^sort\s+code/i,
      /^statement\s+of\s+account/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^ledger\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

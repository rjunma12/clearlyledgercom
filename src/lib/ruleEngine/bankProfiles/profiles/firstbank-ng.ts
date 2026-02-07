/**
 * First Bank of Nigeria Profile
 * Oldest Nigerian bank
 */

import type { BankProfile } from '../types';

export const firstbankNgProfile: BankProfile = {
  id: 'firstbank-ng',
  name: 'First Bank of Nigeria',
  region: 'NG',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['FIRST BANK OF NIGERIA', 'FIRST BANK', 'firstbanknigeria.com', 'FBN'],
    accountPatterns: [/\b\d{10}\b/],
    uniqueIdentifiers: ['FBNINGLA', 'FBIN'],
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

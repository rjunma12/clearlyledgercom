/**
 * National Bank of Egypt Profile
 * Oldest African bank
 */

import type { BankProfile } from '../types';

export const nbeEgProfile: BankProfile = {
  id: 'nbe-eg',
  name: 'National Bank of Egypt',
  region: 'EG',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['NATIONAL BANK OF EGYPT', 'NBE', 'nbe.com.eg', 'البنك الأهلي المصري'],
    accountPatterns: [/\b\d{13,16}\b/],
    uniqueIdentifiers: ['NBEGEGCX', 'NBEG'],
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
      currencySymbol: 'E£',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^رقم\s+الحساب/i,
      /^statement\s+of\s+account/i,
      /^كشف\s+حساب/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^الرصيد\s+الافتتاحي/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^الرصيد\s+الختامي/i,
      /^available\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

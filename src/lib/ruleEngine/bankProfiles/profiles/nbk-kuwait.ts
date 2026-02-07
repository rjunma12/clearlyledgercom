/**
 * National Bank of Kuwait (NBK) Profile
 * Largest bank in Kuwait
 */

import type { BankProfile } from '../types';

export const nbkKuwaitProfile: BankProfile = {
  id: 'nbk-kuwait',
  name: 'National Bank of Kuwait',
  region: 'KW',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['NBK', 'NATIONAL BANK OF KUWAIT', 'بنك الكويت الوطني', 'nbk.com'],
    accountPatterns: [/\b\d{12}\b/, /\bKW\d{28}\b/],
    uniqueIdentifiers: ['NABORIN', 'NBOK'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'KWD',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: 'KWD',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^كشف\s+حساب/i,
      /^رقم\s+الحساب/i,
      /^page\s+\d+/i,
      /^account\s+statement/i,
    ],
    openingBalancePatterns: [/^الرصيد\s+الافتتاحي/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^الرصيد\s+الختامي/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

/**
 * Al Rajhi Bank Profile
 * Largest Islamic bank in the world (Saudi Arabia)
 */

import type { BankProfile } from '../types';

export const alrajhiSaProfile: BankProfile = {
  id: 'alrajhi-sa',
  name: 'Al Rajhi Bank',
  region: 'SA',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['AL RAJHI', 'مصرف الراجحي', 'alrajhibank.com.sa', 'Al Rajhi Banking'],
    accountPatterns: [/\b\d{15}\b/, /\bSA\d{22}\b/],
    uniqueIdentifiers: ['RJHISARI'],
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
      currencySymbol: 'SAR',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: 'SAR',
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

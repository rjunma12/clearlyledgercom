/**
 * Hang Seng Bank Profile
 * Major bank in Hong Kong
 */

import type { BankProfile } from '../types';

export const hangsengHkProfile: BankProfile = {
  id: 'hangseng-hk',
  name: 'Hang Seng Bank',
  region: 'HK',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['HANG SENG', '恒生銀行', 'hangseng.com', 'Hang Seng Bank'],
    accountPatterns: [/\b\d{9}\b/, /\b\d{3}-\d{6}\b/],
    uniqueIdentifiers: ['HASEHKHH'],
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
      currencySymbol: 'HK$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: 'HK$',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^交易紀錄/i,
      /^賬戶號碼/i,
      /^page\s+\d+/i,
      /^statement/i,
    ],
    openingBalancePatterns: [/^上期結餘/i, /^opening\s+balance/i, /^brought\s+forward/i],
    closingBalancePatterns: [/^本期結餘/i, /^closing\s+balance/i, /^balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

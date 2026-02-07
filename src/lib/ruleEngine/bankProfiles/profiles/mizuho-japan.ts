/**
 * Mizuho Bank Profile
 * 3rd largest Japanese bank
 */

import type { BankProfile } from '../types';

export const mizuhoJapanProfile: BankProfile = {
  id: 'mizuho-japan',
  name: 'Mizuho Bank',
  region: 'JP',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['MIZUHO', 'みずほ', 'Mizuho Bank', 'mizuhobank.co.jp', 'みずほ銀行'],
    accountPatterns: [/\b\d{7}\b/, /\b\d{3}-\d{7}\b/],
    uniqueIdentifiers: ['MHCBJPJT'],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: false,
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['YYYY/MM/DD', 'YYYY年MM月DD日', 'MM/DD'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '¥',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '¥',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^取引明細/i,
      /^お取引明細/i,
      /^ページ/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [/^前回残高/i, /^繰越残高/i],
    closingBalancePatterns: [/^現在残高/i, /^残高/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

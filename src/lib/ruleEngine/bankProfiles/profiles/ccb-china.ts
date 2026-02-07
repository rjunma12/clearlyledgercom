/**
 * CCB (China Construction Bank) Profile
 * 2nd largest bank globally by assets ($4.5T)
 */

import type { BankProfile } from '../types';

export const ccbChinaProfile: BankProfile = {
  id: 'ccb-china',
  name: 'China Construction Bank',
  region: 'CN',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['CCB', '建设银行', '中国建设银行', 'ccb.com', 'China Construction Bank'],
    accountPatterns: [/\b\d{19}\b/, /\b6227\d{15}\b/],
    uniqueIdentifiers: ['PCBCCNBJ'],
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
      dateFormats: ['YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY年MM月DD日'],
      dateSeparator: '-',
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
      /^交易明细/i,
      /^账户明细/i,
      /^page\s+\d+/i,
      /^页码/i,
    ],
    openingBalancePatterns: [/^期初余额/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^期末余额/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

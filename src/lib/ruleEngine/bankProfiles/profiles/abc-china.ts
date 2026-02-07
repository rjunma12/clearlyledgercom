/**
 * ABC (Agricultural Bank of China) Profile
 * 3rd largest bank globally by assets ($4.2T)
 */

import type { BankProfile } from '../types';

export const abcChinaProfile: BankProfile = {
  id: 'abc-china',
  name: 'Agricultural Bank of China',
  region: 'CN',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['ABC', '农业银行', '中国农业银行', 'abchina.com', 'Agricultural Bank of China'],
    accountPatterns: [/\b\d{19}\b/, /\b6228\d{15}\b/],
    uniqueIdentifiers: ['ABOCCNBJ'],
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
      /^账户流水/i,
      /^page\s+\d+/i,
      /^页码/i,
    ],
    openingBalancePatterns: [/^期初余额/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^期末余额/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

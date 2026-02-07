/**
 * ICBC (Industrial & Commercial Bank of China) Profile
 * World's largest bank by assets ($5.7T)
 */

import type { BankProfile } from '../types';

export const icbcChinaProfile: BankProfile = {
  id: 'icbc-china',
  name: 'Industrial and Commercial Bank of China',
  region: 'CN',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['ICBC', '工商银行', '中国工商银行', 'icbc.com.cn', 'Industrial and Commercial Bank'],
    accountPatterns: [/\b\d{19}\b/, /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{3}\b/],
    uniqueIdentifiers: ['ICBKCNBJ'],
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
      /^account\s+statement/i,
      /^页码/i,
      /^page\s+\d+/i,
      /^打印时间/i,
    ],
    openingBalancePatterns: [/^期初余额/i, /^opening\s+balance/i, /^上期余额/i],
    closingBalancePatterns: [/^期末余额/i, /^closing\s+balance/i, /^本期余额/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

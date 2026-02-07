/**
 * Bank of China Profile
 * One of China's Big Four state-owned banks
 */

import type { BankProfile } from '../types';

export const bocChinaProfile: BankProfile = {
  id: 'boc-china',
  name: 'Bank of China',
  region: 'CN',
  defaultLocale: 'zh-CN',
  identification: {
    logoPatterns: ['BANK OF CHINA', '中国银行', 'boc.cn', 'BOC'],
    accountPatterns: [/\b\d{16,19}\b/, /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4,7}\b/],
    uniqueIdentifiers: ['BKCHCNBJ', 'BKCH'],
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
      numberFormat: 'zh-CN',
    },
    skipPatterns: [
      /^账户号码/i,
      /^account\s+number/i,
      /^交易明细/i,
      /^页码/i,
      /^page\s+\d+/i,
      /^网点/i,
    ],
    openingBalancePatterns: [
      /^期初余额/i,
      /^opening\s+balance/i,
      /^上期余额/i,
    ],
    closingBalancePatterns: [
      /^期末余额/i,
      /^closing\s+balance/i,
      /^本期余额/i,
      /^账户余额/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

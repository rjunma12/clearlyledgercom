/**
 * Hana Bank Profile
 * Major South Korean bank
 */

import type { BankProfile } from '../types';

export const hanaKoreaProfile: BankProfile = {
  id: 'hana-korea',
  name: 'Hana Bank',
  region: 'KR',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['HANA', '하나은행', 'Hana Bank', 'hanabank.com', '하나'],
    accountPatterns: [/\b\d{14}\b/, /\b\d{3}-\d{6}-\d{5}\b/],
    uniqueIdentifiers: ['HNBNKRSE', 'KOABORIN'],
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
      dateFormats: ['YYYY.MM.DD', 'YYYY-MM-DD', 'YYYY년 MM월 DD일'],
      dateSeparator: '.',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '₩',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '₩',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^거래내역/i,
      /^계좌번호/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [/^전일잔액/i, /^이월잔액/i],
    closingBalancePatterns: [/^현재잔액/i, /^잔액/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

/**
 * KB Kookmin Bank Profile
 * Largest South Korean bank
 */

import type { BankProfile } from '../types';

export const kookminKoreaProfile: BankProfile = {
  id: 'kookmin-korea',
  name: 'KB Kookmin Bank',
  region: 'KR',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['KB', '국민은행', 'Kookmin', 'kbstar.com', 'KB Kookmin Bank', 'KB국민은행'],
    accountPatterns: [/\b\d{12}\b/, /\b\d{3}-\d{2}-\d{6}\b/, /\b\d{6}-\d{2}-\d{6}\b/],
    uniqueIdentifiers: ['CZNBKRSE'],
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
      /^페이지/i,
    ],
    openingBalancePatterns: [/^전일잔액/i, /^이월잔액/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^현재잔액/i, /^잔액/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

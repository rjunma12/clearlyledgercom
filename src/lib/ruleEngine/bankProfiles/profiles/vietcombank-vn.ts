/**
 * Vietcombank Profile
 * Largest bank in Vietnam
 */

import type { BankProfile } from '../types';

export const vietcombankVnProfile: BankProfile = {
  id: 'vietcombank-vn',
  name: 'Vietcombank',
  region: 'VN',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['VIETCOMBANK', 'VCB', 'vietcombank.com.vn', 'Ngân hàng TMCP Ngoại thương'],
    accountPatterns: [/\b\d{13}\b/, /\b\d{10}\b/],
    uniqueIdentifiers: ['BFTVVNVX'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD/MM/YY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '₫',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: '₫',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^sao\s+kê/i,
      /^số\s+tài\s+khoản/i,
      /^page\s+\d+/i,
      /^trang/i,
    ],
    openingBalancePatterns: [/^số\s+dư\s+đầu\s+kỳ/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^số\s+dư\s+cuối\s+kỳ/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

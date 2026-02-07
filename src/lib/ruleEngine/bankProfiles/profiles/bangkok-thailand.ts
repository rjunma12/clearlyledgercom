/**
 * Bangkok Bank Profile
 * Largest bank in Thailand
 */

import type { BankProfile } from '../types';

export const bangkokThailandProfile: BankProfile = {
  id: 'bangkok-thailand',
  name: 'Bangkok Bank',
  region: 'TH',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BANGKOK BANK', 'ธนาคารกรุงเทพ', 'bangkokbank.com', 'BBL'],
    accountPatterns: [/\b\d{10}\b/, /\b\d{3}-\d{1}-\d{5}-\d{1}\b/],
    uniqueIdentifiers: ['BKKBTHBK'],
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
      currencySymbol: '฿',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '฿',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^รายการเคลื่อนไหว/i,
      /^เลขที่บัญชี/i,
      /^page\s+\d+/i,
      /^statement/i,
    ],
    openingBalancePatterns: [/^ยอดยกมา/i, /^opening\s+balance/i, /^brought\s+forward/i],
    closingBalancePatterns: [/^ยอดคงเหลือ/i, /^closing\s+balance/i, /^balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

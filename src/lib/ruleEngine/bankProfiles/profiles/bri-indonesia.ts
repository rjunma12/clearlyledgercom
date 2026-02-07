/**
 * Bank Rakyat Indonesia (BRI) Profile
 * 3rd largest bank in Indonesia
 */

import type { BankProfile } from '../types';

export const briIndonesiaProfile: BankProfile = {
  id: 'bri-indonesia',
  name: 'Bank Rakyat Indonesia',
  region: 'ID',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BRI', 'BANK RAKYAT INDONESIA', 'bri.co.id', 'PT Bank Rakyat Indonesia'],
    accountPatterns: [/\b\d{15}\b/, /\b\d{4}\d{2}\d{9}\b/],
    uniqueIdentifiers: ['BABORIN', 'BRINIDJA'],
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
      currencySymbol: 'Rp',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: 'Rp',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^mutasi\s+rekening/i,
      /^nomor\s+rekening/i,
      /^page\s+\d+/i,
      /^halaman/i,
    ],
    openingBalancePatterns: [/^saldo\s+awal/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^saldo\s+akhir/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

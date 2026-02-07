/**
 * Bank Central Asia (BCA) Profile
 * Largest bank in Indonesia
 */

import type { BankProfile } from '../types';

export const bcaIndonesiaProfile: BankProfile = {
  id: 'bca-indonesia',
  name: 'Bank Central Asia',
  region: 'ID',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BCA', 'BANK CENTRAL ASIA', 'bca.co.id', 'Bank Central Asia'],
    accountPatterns: [/\b\d{10}\b/, /\b\d{3}\d{7}\b/],
    uniqueIdentifiers: ['CENAIDJA'],
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

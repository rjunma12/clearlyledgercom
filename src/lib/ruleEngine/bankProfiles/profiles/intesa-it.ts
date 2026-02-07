/**
 * Intesa Sanpaolo Italy Profile
 * Largest Italian bank
 */

import type { BankProfile } from '../types';

export const intesaItProfile: BankProfile = {
  id: 'intesa-it',
  name: 'Intesa Sanpaolo',
  region: 'IT',
  defaultLocale: 'it-IT',
  identification: {
    logoPatterns: ['INTESA SANPAOLO', 'intesasanpaolo.com', 'INTESA', 'SANPAOLO'],
    accountPatterns: [/\bIT\d{25}\b/, /\b\d{5}\s*\d{5}\s*\d{12}\b/],
    uniqueIdentifiers: ['BCITITMM', 'BCIT'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '€',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: '€',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^estratto\s+conto/i,
      /^iban/i,
      /^bic/i,
      /^pagina\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^saldo\s+precedente/i,
      /^saldo\s+iniziale/i,
    ],
    closingBalancePatterns: [
      /^saldo\s+attuale/i,
      /^saldo\s+finale/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

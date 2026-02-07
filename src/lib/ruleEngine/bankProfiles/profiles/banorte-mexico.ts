/**
 * Banorte Profile
 * 2nd largest bank in Mexico
 */

import type { BankProfile } from '../types';

export const banorteMexicoProfile: BankProfile = {
  id: 'banorte-mexico',
  name: 'Banorte',
  region: 'MX',
  defaultLocale: 'es-ES',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BANORTE', 'banorte.com', 'Grupo Financiero Banorte', 'GFNorte'],
    accountPatterns: [/\b\d{11}\b/, /\b\d{4}\s*\d{4}\s*\d{3}\b/],
    uniqueIdentifiers: ['MENOMXMT'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD/MMM/YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '$',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^estado\s+de\s+cuenta/i,
      /^número\s+de\s+cuenta/i,
      /^página\s+\d+/i,
      /^sucursal/i,
    ],
    openingBalancePatterns: [/^saldo\s+anterior/i, /^saldo\s+inicial/i],
    closingBalancePatterns: [/^saldo\s+actual/i, /^saldo\s+final/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

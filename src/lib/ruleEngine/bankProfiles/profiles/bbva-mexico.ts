/**
 * BBVA Mexico Profile
 * Largest bank in Mexico (formerly Bancomer)
 */

import type { BankProfile } from '../types';

export const bbvaMexicoProfile: BankProfile = {
  id: 'bbva-mexico',
  name: 'BBVA Mexico',
  region: 'MX',
  defaultLocale: 'es-ES',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BBVA', 'BBVA MEXICO', 'BANCOMER', 'bbva.mx', 'BBVA Bancomer'],
    accountPatterns: [/\b\d{10}\b/, /\b\d{4}\s*\d{4}\s*\d{2}\b/],
    uniqueIdentifiers: ['BCMRMXMM'],
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

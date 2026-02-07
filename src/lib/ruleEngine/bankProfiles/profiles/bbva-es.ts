/**
 * BBVA Spain Profile
 * 2nd largest Spanish bank
 */

import type { BankProfile } from '../types';

export const bbvaEsProfile: BankProfile = {
  id: 'bbva-es',
  name: 'BBVA',
  region: 'ES',
  defaultLocale: 'es-ES',
  identification: {
    logoPatterns: ['BBVA', 'bbva.es', 'BANCO BILBAO VIZCAYA'],
    accountPatterns: [/\bES\d{22}\b/, /\b\d{4}\s*\d{4}\s*\d{2}\s*\d{10}\b/],
    uniqueIdentifiers: ['BBVAESMM', 'BBVA'],
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
      /^extracto\s+de\s+cuenta/i,
      /^iban/i,
      /^titular/i,
      /^página\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^saldo\s+anterior/i,
      /^saldo\s+inicial/i,
    ],
    closingBalancePatterns: [
      /^saldo\s+actual/i,
      /^saldo\s+final/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

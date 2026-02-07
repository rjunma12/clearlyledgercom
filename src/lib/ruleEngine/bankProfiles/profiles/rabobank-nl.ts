/**
 * Rabobank Netherlands Profile
 * Cooperative bank
 */

import type { BankProfile } from '../types';

export const rabobankNlProfile: BankProfile = {
  id: 'rabobank-nl',
  name: 'Rabobank',
  region: 'NL',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['RABOBANK', 'rabobank.nl', 'RABOBANK NEDERLAND'],
    accountPatterns: [/\bNL\d{16}\b/, /\b\d{9}\b/],
    uniqueIdentifiers: ['RABONL2U', 'RABO'],
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
      dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY'],
      dateSeparator: '-',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '€',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: '€',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^rekeningoverzicht/i,
      /^iban/i,
      /^bic/i,
      /^pagina\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^beginsaldo/i,
      /^vorig\s+saldo/i,
    ],
    closingBalancePatterns: [
      /^eindsaldo/i,
      /^nieuw\s+saldo/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

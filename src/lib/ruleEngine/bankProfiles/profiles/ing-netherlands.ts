/**
 * ING Netherlands Profile
 * Dutch banking giant
 */

import type { BankProfile } from '../types';

export const ingNetherlandsProfile: BankProfile = {
  id: 'ing-netherlands',
  name: 'ING Bank Netherlands',
  region: 'NL',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['ING BANK', 'ING', 'ing.nl', 'ING GROEP'],
    accountPatterns: [/\b\d{10}\b/, /\bNL\d{2}\s*INGB\s*\d{10}\b/],
    uniqueIdentifiers: ['INGBNL2A', 'INGB'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['Af', 'Bij'],
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      dateSeparator: '-',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '€',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: 'nl-NL',
    },
    skipPatterns: [
      /^rekeningnummer/i,
      /^iban/i,
      /^bic/i,
      /^afschrift/i,
      /^pagina\s+\d+/i,
      /^datum/i,
    ],
    openingBalancePatterns: [
      /^beginsaldo/i,
      /^vorig\s+saldo/i,
      /^saldo\s+vorige/i,
    ],
    closingBalancePatterns: [
      /^eindsaldo/i,
      /^nieuw\s+saldo/i,
      /^huidig\s+saldo/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

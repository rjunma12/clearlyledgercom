/**
 * CaixaBank Spain Profile
 * Largest Spanish bank by network
 */

import type { BankProfile } from '../types';

export const caixabankEsProfile: BankProfile = {
  id: 'caixabank-es',
  name: 'CaixaBank',
  region: 'ES',
  defaultLocale: 'es-ES',
  identification: {
    logoPatterns: ['CAIXABANK', 'caixabank.es', 'LA CAIXA', 'CAIXA'],
    accountPatterns: [/\bES\d{22}\b/, /\b\d{4}\s*\d{4}\s*\d{2}\s*\d{10}\b/],
    uniqueIdentifiers: ['CABORIN', 'CAIX'],
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

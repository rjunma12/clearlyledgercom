/**
 * Millennium BCP Portugal Profile
 * Largest Portuguese bank
 */

import type { BankProfile } from '../types';

export const bcpPtProfile: BankProfile = {
  id: 'bcp-pt',
  name: 'Millennium BCP',
  region: 'PT',
  defaultLocale: 'pt-PT',
  identification: {
    logoPatterns: ['MILLENNIUM BCP', 'millenniumbcp.pt', 'BCP', 'BANCO COMERCIAL PORTUGUÊS'],
    accountPatterns: [/\bPT\d{23}\b/, /\b\d{4}\s*\d{4}\s*\d{11}\s*\d{2}\b/],
    uniqueIdentifiers: ['BCOMPTPL', 'BCOM'],
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
      /^extrato\s+de\s+conta/i,
      /^iban/i,
      /^nib/i,
      /^página\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^saldo\s+anterior/i,
      /^saldo\s+inicial/i,
    ],
    closingBalancePatterns: [
      /^saldo\s+atual/i,
      /^saldo\s+final/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

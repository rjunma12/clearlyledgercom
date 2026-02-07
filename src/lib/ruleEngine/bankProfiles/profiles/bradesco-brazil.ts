/**
 * Bradesco Profile
 * 3rd largest bank in Brazil
 */

import type { BankProfile } from '../types';

export const bradescoBrazilProfile: BankProfile = {
  id: 'bradesco-brazil',
  name: 'Bradesco',
  region: 'BR',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BRADESCO', 'bradesco.com.br', 'Banco Bradesco', 'Bradesco S.A.'],
    accountPatterns: [/\b\d{7}-\d{1}\b/, /\b\d{4}\s*\d{7}-\d{1}\b/],
    uniqueIdentifiers: ['BBDEBRSP'],
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
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: 'R$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: 'R$',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^extrato\s+de\s+conta/i,
      /^agência/i,
      /^conta\s+corrente/i,
      /^página\s+\d+/i,
    ],
    openingBalancePatterns: [/^saldo\s+anterior/i, /^saldo\s+inicial/i],
    closingBalancePatterns: [/^saldo\s+atual/i, /^saldo\s+final/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

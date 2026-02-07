/**
 * Société Générale France Profile
 * 3rd largest French bank
 */

import type { BankProfile } from '../types';

export const socgenFranceProfile: BankProfile = {
  id: 'socgen-france',
  name: 'Société Générale',
  region: 'FR',
  defaultLocale: 'fr-FR',
  identification: {
    logoPatterns: ['SOCIÉTÉ GÉNÉRALE', 'SOCIETE GENERALE', 'societegenerale.fr', 'SG'],
    accountPatterns: [/\bFR\d{25}\b/, /\b\d{5}\s*\d{5}\s*\d{11}\s*\d{2}\b/],
    uniqueIdentifiers: ['SOGEFRPP', 'SOGE'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD.MM.YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '€',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: ' ',
        currencySymbol: '€',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^relevé\s+de\s+compte/i,
      /^iban/i,
      /^bic/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^solde\s+précédent/i,
      /^ancien\s+solde/i,
    ],
    closingBalancePatterns: [
      /^nouveau\s+solde/i,
      /^solde\s+actuel/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

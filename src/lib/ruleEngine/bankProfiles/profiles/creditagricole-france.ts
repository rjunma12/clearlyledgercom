/**
 * Crédit Agricole (France) Profile
 * Major French banking group
 */

import type { BankProfile } from '../types';

export const creditagricoleFranceProfile: BankProfile = {
  id: 'creditagricole-france',
  name: 'Crédit Agricole',
  region: 'FR',
  defaultLocale: 'fr-FR',
  identification: {
    logoPatterns: ['CRÉDIT AGRICOLE', 'CREDIT AGRICOLE', 'credit-agricole.fr', 'CA'],
    accountPatterns: [/\b\d{11}\b/, /\bFR\d{2}\s*\d{5}\s*\d{5}\s*\d{11}\s*\d{2}\b/],
    uniqueIdentifiers: ['AGRIFRPP', 'AGRI'],
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
      dateFormats: ['DD/MM/YYYY', 'DD.MM.YYYY', 'DD-MM-YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '€',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^numéro\s+de\s+compte/i,
      /^iban/i,
      /^bic/i,
      /^relevé\s+de\s+compte/i,
      /^page\s+\d+/i,
      /^caisse\s+régionale/i,
    ],
    openingBalancePatterns: [
      /^solde\s+précédent/i,
      /^solde\s+initial/i,
      /^ancien\s+solde/i,
      /^solde\s+au/i,
    ],
    closingBalancePatterns: [
      /^nouveau\s+solde/i,
      /^solde\s+final/i,
      /^solde\s+actuel/i,
      /^solde\s+en\s+votre\s+faveur/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

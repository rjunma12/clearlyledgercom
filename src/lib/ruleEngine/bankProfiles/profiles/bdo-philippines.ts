/**
 * BDO Unibank Profile
 * Largest bank in the Philippines
 */

import type { BankProfile } from '../types';

export const bdoPhilippinesProfile: BankProfile = {
  id: 'bdo-philippines',
  name: 'BDO Unibank',
  region: 'PH',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BDO', 'BDO UNIBANK', 'bdo.com.ph', 'Banco de Oro'],
    accountPatterns: [/\b\d{10}\b/, /\b\d{12}\b/],
    uniqueIdentifiers: ['ABORIN', 'ABORINPH'],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: true,
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM-DD-YYYY', 'MMM DD, YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '₱',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '₱',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^account\s+statement/i,
      /^account\s+number/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [/^beginning\s+balance/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^ending\s+balance/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

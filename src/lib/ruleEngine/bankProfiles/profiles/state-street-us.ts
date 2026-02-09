/**
 * State Street Bank US Profile
 * Institutional / custody banking
 */

import type { BankProfile } from '../types';

export const stateStreetUsProfile: BankProfile = {
  id: 'state-street-us',
  name: 'State Street Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['STATE STREET', 'STATE STREET BANK', 'statestreet.com', 'STATE STREET CORPORATION'],
    accountPatterns: [/\b\d{10,14}\b/, /\b[A-Z]{2}\d{10}\b/],
    uniqueIdentifiers: ['SBOSUS33', 'STSTREET'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'Debit'],
    creditIndicators: ['+', 'CR', 'Credit'],
    balancePosition: 'right',
    hasReferenceColumn: true,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'parentheses',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^custody\s+account/i,
      /^securities\s+held/i,
      /^market\s+value/i,
      /^asset\s+allocation/i,
      /^fund\s+administration/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^opening\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^closing\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};

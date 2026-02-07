/**
 * BMO Bank of Montreal (Canada) Profile
 * One of Canada's Big Five banks
 */

import type { BankProfile } from '../types';

export const bmoCanadaProfile: BankProfile = {
  id: 'bmo-canada',
  name: 'BMO Bank of Montreal',
  region: 'CA',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['BMO', 'BANK OF MONTREAL', 'bmo.com', 'BMO BANK OF MONTREAL'],
    accountPatterns: [/\b\d{7}\b/, /\b\d{4}-\d{7}\b/],
    uniqueIdentifiers: ['BOFMCAM2', 'BOFM'],
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
      dateFormats: ['MMM DD, YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY'],
      dateSeparator: '-',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^transit/i,
      /^institution/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^previous\s+balance/i,
      /^balance\s+brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^ending\s+balance/i,
      /^balance\s+carried\s+forward/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

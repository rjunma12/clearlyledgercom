/**
 * Scotiabank (Canada) Profile
 * One of Canada's Big Five banks
 */

import type { BankProfile } from '../types';

export const scotiabankCanadaProfile: BankProfile = {
  id: 'scotiabank-canada',
  name: 'Scotiabank',
  region: 'CA',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['SCOTIABANK', 'BANK OF NOVA SCOTIA', 'scotiabank.com', 'SCOTIA'],
    accountPatterns: [/\b\d{7}\b/, /\b\d{5}-\d{7}\b/],
    uniqueIdentifiers: ['NOSCCATT', 'NOSC'],
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
      dateFormats: ['MMM DD, YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'],
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
      /^transit\s+number/i,
      /^institution\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^previous\s+balance/i,
      /^balance\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^ending\s+balance/i,
      /^current\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};

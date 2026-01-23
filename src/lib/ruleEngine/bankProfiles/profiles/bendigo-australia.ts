/**
 * Bendigo Bank Australia Profile
 * Community-focused bank with regional presence
 */

import { BankProfile } from '../types';

export const bendigoAustraliaProfile: BankProfile = {
  id: 'bendigo-australia',
  name: 'Bendigo Bank',
  region: 'AU',
  defaultLocale: 'en-AU',
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  
  identification: {
    logoPatterns: [
      'Bendigo Bank',
      'Bendigo and Adelaide Bank',
      'bendigobank.com.au',
      'BENDIGO BANK',
      'Community Bank', // Franchise branding
      'Adelaide Bank', // Part of group
    ],
    accountPatterns: [
      /\b\d{3}-\d{3}\s*\d{6,10}\b/,
      /\bBSB:?\s*\d{3}-?\d{3}\b/i,
      /\bAccount\s*(?:No|Number)?:?\s*\d{6,10}\b/i,
    ],
    uniqueIdentifiers: [
      'BENDAU3B', // SWIFT code
      'Bendigo',
    ],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    debitIndicators: ['DR', '-'],
    creditIndicators: ['CR', '+'],
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY', 'DD MMM YYYY'],
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
      /^balance\s+b\/f/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^balance\s+c\/f/i,
    ],
    skipPatterns: [
      /^bsb/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^date.*particulars.*debit.*credit/i,
      /^bendigobank\.com\.au/i,
      /^branch:?\s/i,
      /^community\s+bank/i,
    ],
    pageHeaderPatterns: [
      /^account\s+statement/i,
      /^statement\s+of\s+account/i,
    ],
    pageFooterPatterns: [
      /^bendigo\s+(and\s+adelaide\s+)?bank/i,
      /^abn\s+\d{2}/i,
    ],
    continuationPatterns: [
      /^\s{6,}/,
      /^[a-z]/,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};

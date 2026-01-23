/**
 * Westpac Banking Corporation Profile
 * One of Australia's "Big Four" banks
 */

import { BankProfile } from '../types';

export const westpacAustraliaProfile: BankProfile = {
  id: 'westpac-australia',
  name: 'Westpac Banking Corporation',
  region: 'AU',
  defaultLocale: 'en-AU',
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  
  identification: {
    logoPatterns: [
      'Westpac',
      'Westpac Banking Corporation',
      'westpac.com.au',
      'WESTPAC',
      'St.George', // Subsidiary
      'Bank of Melbourne', // Subsidiary
      'BankSA', // Subsidiary
    ],
    accountPatterns: [
      /\b\d{3}-\d{3}\s*\d{6,10}\b/,
      /\bBSB:?\s*\d{3}-?\d{3}\b/i,
      /\bAccount\s*(?:No|Number)?:?\s*\d{6,10}\b/i,
    ],
    uniqueIdentifiers: [
      'WPACAU2S', // SWIFT code
      'Westpac',
    ],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
  },

  specialRules: {
    dateFormatting: {
      // Westpac often uses DD MMM YY format
      dateFormats: ['DD MMM YY', 'DD MMM YYYY', 'DD/MM/YYYY', 'DD/MM/YY'],
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
      /^b\/fwd/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^c\/fwd/i,
    ],
    skipPatterns: [
      /^bsb/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+\s+of\s+\d+/i,
      /^date.*narrative.*debit.*credit/i,
      /^westpac\.com\.au/i,
      /^abn\s+\d{2}/i,
    ],
    pageHeaderPatterns: [
      /^account\s+statement/i,
      /^transaction\s+history/i,
    ],
    pageFooterPatterns: [
      /^westpac\s+banking\s+corporation/i,
      /^continued\s+over/i,
    ],
    continuationPatterns: [
      /^\s{6,}/,
      /^ref:?\s/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
};

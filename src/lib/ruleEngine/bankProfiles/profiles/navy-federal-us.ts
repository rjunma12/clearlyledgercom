/**
 * Navy Federal Credit Union US Profile
 * Largest credit union in the US
 */

import type { BankProfile } from '../types';

export const navyFederalUsProfile: BankProfile = {
  id: 'navy-federal-us',
  name: 'Navy Federal Credit Union',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['NAVY FEDERAL', 'NFCU', 'navyfederal.org', 'NAVY FEDERAL CREDIT UNION'],
    accountPatterns: [/\b\d{10,14}\b/],
    uniqueIdentifiers: ['NFCUUS33', 'NAVYFED'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit', 'Withdrawal'],
    creditIndicators: ['+', 'CR', 'Credit', 'Deposit'],
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
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^member\s+number/i,
      /^account\s+number/i,
      /^routing\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^share\s+savings/i,
      /^share\s+draft/i,
      /^dividend\s+rate/i,
      /^apy/i,
      /^serving\s+those\s+who\s+serve/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
      /^opening\s+share\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
      /^closing\s+share\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};

/**
 * State Bank of India (SBI) Profile
 * State Bank of India - India
 */

import type { BankProfile } from '../types';

export const sbiIndiaProfile: BankProfile = {
  id: 'sbi-india',
  name: 'State Bank of India',
  region: 'IN',
  defaultLocale: 'en-IN',
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'State Bank of India',
      'SBI',
      'STATE BANK OF INDIA',
      'sbi.co.in',
      'onlinesbi.com',
      'SBI Bank',
    ],
    accountPatterns: [
      /\b\d{11}\b/, // SBI account number (11 digits)
      /\b\d{17}\b/, // SBI account number (17 digits)
      /\bIFSC\s*:?\s*SBIN\d{7}\b/i, // IFSC code
    ],
    uniqueIdentifiers: ['SBININBB', 'SBIN'], // SWIFT code prefix
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'Dr', 'D'],
    creditIndicators: ['+', 'CR', 'Cr', 'C'],
    balancePosition: 'right',
    hasReferenceColumn: true,
    columnHints: {
      date: [0, 12],
      description: [12, 50],
      debit: [50, 65],
      credit: [65, 80],
      balance: [80, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD/MM/YY', 'DD MMM YYYY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '₹',
      symbolPosition: 'prefix',
      negativeFormat: 'suffix-dr',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '₹',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 4,
    skipPatterns: [
      /^account\s+statement/i,
      /^transaction\s+details/i,
      /^account\s+number/i,
      /^ifsc\s+code/i,
      /^branch\s+name/i,
      /^customer\s+id/i,
      /^cif\s+no/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+c\/f/i,
    ],
    pageHeaderPatterns: [
      /^state\s+bank\s+of\s+india/i,
      /^sbi\s+statement/i,
      /^account\s+statement/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^this\s+is\s+a\s+computer\s+generated/i,
    ],
    continuationPatterns: [
      /^ref\s*no\s*:?\s*\d+/i,
      /^txn\s*id\s*:?\s*\d+/i,
      /^utr\s*:?\s*\w+/i,
    ],
  },
};

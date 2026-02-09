

# USA Bank Profiles Expansion Plan

## Executive Summary
Adding 25 additional US bank profiles to expand coverage of the American banking market. The current implementation has 14 US banks; this plan adds the next tier of major regional and specialty banks.

---

## Current Coverage (14 banks)
Already implemented:
1. JPMorgan Chase - #1 by assets
2. Bank of America - #2
3. Citibank - #3
4. Wells Fargo - #4
5. US Bank - #5
6. Capital One - #7
7. PNC Bank - #8
8. Truist - #9
9. TD Bank (US) - #10
10. Fifth Third - #11
11. Ally Bank - Online bank
12. Charles Schwab - Brokerage banking
13. Discover - Card issuer
14. American Express - Card issuer

---

## Banks to Add (25 New Profiles)

### Tier 1: Investment Banks & Large Regionals (5 banks)
| Bank | Assets | Priority | Notes |
|------|--------|----------|-------|
| Goldman Sachs Bank | $644B | Critical | Investment bank, #6 by assets |
| Morgan Stanley Bank | $418B | Critical | Investment bank, unique statement format |
| Citizens Bank | $221B | High | Major Northeast regional |
| First Citizens Bank | $213B | High | Acquired SVB |
| M&T Bank | $211B | High | Major Northeast regional |

### Tier 2: Large Regional Banks (10 banks)
| Bank | Assets | Priority | Notes |
|------|--------|----------|-------|
| Huntington Bank | $196B | High | Midwest regional |
| KeyBank | $188B | High | Cleveland-based |
| Regions Bank | $154B | High | Southeast regional |
| USAA | $153B | High | Military banking |
| Synchrony Bank | $117B | High | Card issuer |
| State Street Bank | $297B | High | Institutional banking |
| BNY Mellon | $311B | High | Custody bank |
| Northern Trust | $152B | Medium | Wealth management |
| Comerica | $82B | Medium | Texas/California |
| Zions Bank | $87B | Medium | Mountain West |

### Tier 3: Super-Regional & Specialty Banks (10 banks)
| Bank | Assets | Priority | Notes |
|------|--------|----------|-------|
| Popular Bank | $72B | Medium | Puerto Rico/Northeast |
| BMO USA | $274B | Medium | Canadian bank, US operations |
| East West Bank | $71B | Medium | Asian-American focused |
| Webster Bank | $76B | Medium | Northeast regional |
| First Horizon | $81B | Medium | Tennessee-based |
| Frost Bank | $52B | Medium | Texas regional |
| UMB Bank | $43B | Medium | Kansas City-based |
| Flagstar Bank | $124B | Medium | Mortgage specialist |
| Synovus | $59B | Medium | Southeast regional |
| Navy Federal CU | $175B | High | Largest credit union |

---

## Implementation Details

### Files to Create (25 new profile files)

Location: `src/lib/ruleEngine/bankProfiles/profiles/`

1. `goldman-us.ts` - Goldman Sachs Bank
2. `morgan-stanley-us.ts` - Morgan Stanley Bank
3. `citizens-us.ts` - Citizens Bank
4. `first-citizens-us.ts` - First Citizens Bank
5. `mt-us.ts` - M&T Bank
6. `huntington-us.ts` - Huntington National Bank
7. `keybank-us.ts` - KeyBank
8. `regions-us.ts` - Regions Bank
9. `usaa-us.ts` - USAA Federal Savings Bank
10. `synchrony-us.ts` - Synchrony Bank
11. `state-street-us.ts` - State Street Bank
12. `bny-mellon-us.ts` - Bank of New York Mellon
13. `northern-trust-us.ts` - Northern Trust
14. `comerica-us.ts` - Comerica Bank
15. `zions-us.ts` - Zions Bank
16. `popular-us.ts` - Popular Bank
17. `bmo-us.ts` - BMO USA
18. `east-west-us.ts` - East West Bank
19. `webster-us.ts` - Webster Bank
20. `first-horizon-us.ts` - First Horizon Bank
21. `frost-us.ts` - Frost Bank
22. `umb-us.ts` - UMB Bank
23. `flagstar-us.ts` - Flagstar Bank
24. `synovus-us.ts` - Synovus Bank
25. `navy-federal-us.ts` - Navy Federal Credit Union

### Registry Update

File: `src/lib/ruleEngine/bankProfiles/index.ts`

Add imports and register all 25 new profiles in the `defaultProfiles` array under the US Banks section.

---

## Profile Template (US Standard)

All US profiles will follow this consistent structure:

```typescript
export const bankNameProfile: BankProfile = {
  id: 'bank-us',
  name: 'Bank Name',
  region: 'US',
  defaultLocale: 'en-US',
  
  identification: {
    logoPatterns: ['BANK NAME', 'bankname.com'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['SWIFTCODE'],
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit'],
    creditIndicators: ['+', 'CR', 'Credit'],
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM-DD-YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^routing\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};
```

---

## Bank-Specific Customizations

### Investment Banks (Goldman, Morgan Stanley)
- Different statement formats (transaction registers vs. activity summaries)
- May have brokerage-related terminology
- Unique skip patterns for investment-related headers

### Credit Union (Navy Federal)
- Member-focused terminology ("Member Number" vs "Account Number")
- Share/Draft account terminology
- Different footer patterns

### Military Bank (USAA)
- Military-specific terminology
- Multi-product statements (insurance + banking)
- Additional skip patterns for insurance sections

### Card Issuers (Synchrony)
- Credit card statement format
- APR/Interest sections to skip
- Payment due patterns

### Custody/Institutional (State Street, BNY Mellon, Northern Trust)
- Institutional statement formats
- May have different column layouts
- Custody-related terminology

---

## Expected Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **US Bank Profiles** | 14 | 39 | +178% |
| **US Market Coverage** | ~65% | ~90% | +38% |
| **Regional Coverage** | Limited | Comprehensive | +150% |
| **Specialty Banks** | 4 | 12 | +200% |

---

## File Changes Summary

| Action | Count | Files |
|--------|-------|-------|
| Create | 25 | New bank profile files |
| Modify | 1 | `index.ts` (imports + registry) |
| **Total** | **26** | files affected |


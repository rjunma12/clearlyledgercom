
# Critical Bank Profiles Implementation - Phase 1

## Executive Summary
Implementing only the **Critical priority** banks from the comprehensive expansion plan (~30 banks) that represent the world's largest and most essential banking institutions. These are the banks handling the majority of retail banking transactions globally.

---

## Critical Banks by Region (30 Total)

### Asia-Pacific (23 Banks) - HIGHEST PRIORITY
**Critical banks are the world's largest by assets and transaction volume**

#### China (3 Banks) - World's 3 Largest Banks
- **ICBC** (Industrial & Commercial Bank of China) - $5.7T assets
- **CCB** (China Construction Bank) - $4.5T assets  
- **ABC** (Agricultural Bank of China) - $4.2T assets

#### Japan (3 Banks) - Megabanks
- **MUFG** (Mitsubishi UFJ) - Largest Japanese bank
- **SMBC** (Sumitomo Mitsui) - 2nd largest
- **Mizuho** - 3rd largest

#### South Korea (4 Banks)
- **KB Kookmin** - Largest Korean bank
- **Shinhan Bank**
- **Woori Bank**
- **Hana Bank**

#### Southeast Asia (13 Banks)

**Thailand (3)**
- **Bangkok Bank** - Largest Thai bank
- **Kasikornbank** - 2nd largest
- **Siam Commercial Bank** - 3rd largest

**Indonesia (3)**
- **BCA** (Bank Central Asia) - Largest Indonesian bank
- **Bank Mandiri** - 2nd largest
- **Bank Rakyat Indonesia** - 3rd largest

**Philippines (2)**
- **BDO Unibank** - Largest PH bank
- **Bank of Philippine Islands** - 2nd largest

**Vietnam (2)**
- **Vietcombank** - Largest Vietnamese bank
- **BIDV** (Bank for Investment & Development) - 2nd largest

**Hong Kong (2)**
- **Hang Seng Bank** - Major local bank
- **Bank of East Asia** - Established bank

---

### Latin America (6 Banks)

#### Brazil (4)
- **Itaú Unibanco** - Largest Latin American bank by assets
- **Banco do Brasil** - 2nd largest Brazilian bank
- **Bradesco** - 3rd largest
- **Caixa Econômica Federal** - 4th largest

#### Mexico (2)
- **BBVA Mexico** (formerly Bancomer) - Largest Mexican bank
- **Banorte** - 2nd largest

---

### Middle East (4 Banks)

**Saudi Arabia (2)**
- **Al Rajhi Bank** - Largest Islamic bank in the world
- **Saudi National Bank**

**Qatar (1)**
- **Qatar National Bank** - Largest Qatari bank

**Kuwait (1)**
- **National Bank of Kuwait** - Largest Kuwaiti bank

---

## Implementation Plan

### Phase 1A: Create Critical Bank Profile Files (30 files)

**Files to create in `src/lib/ruleEngine/bankProfiles/profiles/`:**

#### China (3 files)
1. `icbc-china.ts` - ICBC
2. `ccb-china.ts` - China Construction Bank
3. `abc-china.ts` - Agricultural Bank of China

#### Japan (3 files)
4. `mufg-japan.ts` - MUFG Bank
5. `smbc-japan.ts` - Sumitomo Mitsui Banking
6. `mizuho-japan.ts` - Mizuho Bank

#### Korea (4 files)
7. `kookmin-korea.ts` - KB Kookmin
8. `shinhan-korea.ts` - Shinhan Bank
9. `woori-korea.ts` - Woori Bank
10. `hana-korea.ts` - Hana Bank

#### Southeast Asia (13 files)
**Thailand:**
11. `bangkok-thailand.ts` - Bangkok Bank
12. `kbank-thailand.ts` - Kasikornbank
13. `scb-thailand.ts` - Siam Commercial Bank

**Indonesia:**
14. `bca-indonesia.ts` - Bank Central Asia
15. `mandiri-indonesia.ts` - Bank Mandiri
16. `bri-indonesia.ts` - Bank Rakyat Indonesia

**Philippines:**
17. `bdo-philippines.ts` - BDO Unibank
18. `bpi-philippines.ts` - Bank of Philippine Islands

**Vietnam:**
19. `vietcombank-vn.ts` - Vietcombank
20. `bidv-vn.ts` - BIDV

**Hong Kong:**
21. `hangseng-hk.ts` - Hang Seng Bank
22. `bea-hk.ts` - Bank of East Asia

#### Latin America (6 files)
**Brazil:**
23. `itau-brazil.ts` - Itaú Unibanco
24. `bb-brazil.ts` - Banco do Brasil
25. `bradesco-brazil.ts` - Bradesco
26. `caixa-brazil.ts` - Caixa Econômica Federal

**Mexico:**
27. `bbva-mexico.ts` - BBVA Mexico
28. `banorte-mexico.ts` - Banorte

#### Middle East (4 files)
29. `alrajhi-sa.ts` - Al Rajhi Bank (Saudi Arabia)
30. `snb-sa.ts` - Saudi National Bank
31. `qnb-qatar.ts` - Qatar National Bank
32. `nbk-kuwait.ts` - National Bank of Kuwait

---

### Phase 1B: Update Registry

**File to modify: `src/lib/ruleEngine/bankProfiles/index.ts`**

Add imports for all 30 new profiles at the top:
```typescript
// China Banks
import { icbcChinaProfile } from './profiles/icbc-china';
import { ccbChinaProfile } from './profiles/ccb-china';
import { abcChinaProfile } from './profiles/abc-china';

// Japan Banks
import { mufgJapanProfile } from './profiles/mufg-japan';
import { smbcJapanProfile } from './profiles/smbc-japan';
import { mizuhoJapanProfile } from './profiles/mizuho-japan';

// ... (continue for all 30 banks)
```

Add all 30 profiles to the `defaultProfiles` array in proper regional order.

---

## Profile Structure (Standard Template)

Each profile will follow the established `BankProfile` interface:

```typescript
export const bankProfile: BankProfile = {
  id: 'bank-country-code',
  name: 'Full Bank Name',
  region: 'XX', // ISO country code
  defaultLocale: 'xx-XX', // Appropriate locale
  
  identification: {
    logoPatterns: ['BANK NAME', 'bank.domain.com', 'Alternative Name'],
    accountPatterns: [/\b\d{10}\b/, /\b\d{4}\s*\d{5}\b/],
    uniqueIdentifiers: ['SWIFTCODE', 'ALT_ID'],
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance' | 'date-desc-amount-balance',
    mergedDebitCredit: boolean,
    debitIndicators?: ['-', 'DR'],
    creditIndicators?: ['+', 'CR'],
    balancePosition: 'right',
    hasReferenceColumn: boolean,
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '¥',
      symbolPosition: 'prefix' | 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
      },
    },
    skipPatterns: [/^pattern/i],
    openingBalancePatterns: [/^opening/i],
    closingBalancePatterns: [/^closing/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
```

---

## Regional Configuration Reference

### Currency & Format Mappings

```
China:         ¥ (CNY)  | YYYY-MM-DD | . decimal, , thousands
Japan:         ¥ (JPY)  | YYYY/MM/DD | . decimal, , thousands
Korea:         ₩ (KRW)  | YYYY.MM.DD | . decimal, , thousands
Thailand:      ฿ (THB)  | DD/MM/YYYY | . decimal, , thousands
Indonesia:     Rp (IDR) | DD/MM/YYYY | , decimal, . thousands
Philippines:   ₱ (PHP)  | MM/DD/YYYY | . decimal, , thousands
Vietnam:       ₫ (VND)  | DD/MM/YYYY | , decimal, . thousands
Hong Kong:     HK$ (HKD)| DD/MM/YYYY | . decimal, , thousands
Brazil:        R$ (BRL) | DD/MM/YYYY | , decimal, . thousands
Mexico:        $ (MXN)  | DD/MM/YYYY | . decimal, , thousands
Saudi Arabia:  SAR      | DD/MM/YYYY | . decimal, , thousands
Qatar:         QAR      | DD/MM/YYYY | . decimal, , thousands
Kuwait:        KWD      | DD/MM/YYYY | . decimal, , thousands
```

### Account Number Patterns by Region

- **China**: 19 digits (e.g., `6227 0012 0000 0000 000`)
- **Japan**: 7-12 digits depending on bank
- **Korea**: 10-12 digits (various formats)
- **Southeast Asia**: 10-16 digits varies by country
- **Latin America**: 8-20 digits varies by bank
- **Middle East**: 10-23 digits (IBAN format + traditional)

---

## Expected Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Total Profiles** | 100 | 130 | +30% |
| **China Coverage** | 1 | 4 | +300% |
| **Japan Coverage** | 0 | 3 | NEW |
| **Korea Coverage** | 0 | 4 | NEW |
| **SE Asia Coverage** | 5 | 18 | +260% |
| **Latin America Coverage** | 0 | 6 | NEW |
| **Middle East Coverage** | 2 | 6 | +200% |
| **Global Asset Coverage** | ~40% | ~70% | +75% |

---

## Benefits

1. **Major Banking Markets**: Covers the world's 3 largest banks (ICBC, CCB, ABC)
2. **Critical Regions**: Adds all megabanks for Japan (highest adoption rate of digital statements)
3. **Fastest Growing**: Adds major banks in Southeast Asia (rapidly growing market with high digitalization)
4. **Emerging Markets**: Covers critical banks in Brazil, Mexico, Middle East
5. **Global Coverage**: After this phase, system will auto-detect ~70% of global retail banking statements

---

## Technical Notes

1. **Locale Support**: Will use closest supported locale where exact locale not available
2. **Currency Handler**: May need minor updates to support all regional currencies
3. **Header Aliases**: Will need to add language-specific header terms for China, Japan, Korea, Southeast Asia
4. **No Breaking Changes**: All updates are additive; existing functionality unchanged
5. **Batch Processing**: These 30 profiles can be created in parallel

---

## Next Steps (After Approval)

1. Create all 30 profile files
2. Update registry with imports and array entries
3. Test with sample statements from each region
4. Collect user feedback on detection accuracy
5. Phase 2: Implement remaining High-priority banks (European, Africa, Additional Americas)


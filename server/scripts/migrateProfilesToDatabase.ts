/**
 * Migrate Hardcoded Bank Profiles to Database
 * Reads all profiles from the in-memory registry and upserts them into bank_profiles.
 */

import { getAllProfiles } from '../../src/lib/ruleEngine/bankProfiles/index.js';
import { supabase } from '../lib/supabaseClient.js';

// =============================================================================
// REGION / CURRENCY MAPPING
// =============================================================================

const regionToCountryCode: Record<string, string> = {
  US: 'US', UK: 'GB', AU: 'AU', IN: 'IN', CA: 'CA', SG: 'SG', MY: 'MY',
  JP: 'JP', KR: 'KR', TH: 'TH', ID: 'ID', PH: 'PH', VN: 'VN', HK: 'HK',
  CN: 'CN', BR: 'BR', MX: 'MX', SA: 'SA', AE: 'AE', QA: 'QA', KW: 'KW',
  ZA: 'ZA', NG: 'NG', KE: 'KE', EG: 'EG', MA: 'MA', DE: 'DE', FR: 'FR',
  NL: 'NL', CH: 'CH', ES: 'ES', IT: 'IT', BE: 'BE', AT: 'AT', PT: 'PT',
  PL: 'PL', EU: 'EU', GLOBAL: 'XX',
};

const countryToCurrency: Record<string, string> = {
  US: 'USD', GB: 'GBP', AU: 'AUD', IN: 'INR', CA: 'CAD', SG: 'SGD',
  MY: 'MYR', JP: 'JPY', KR: 'KRW', TH: 'THB', ID: 'IDR', PH: 'PHP',
  VN: 'VND', HK: 'HKD', CN: 'CNY', BR: 'BRL', MX: 'MXN', SA: 'SAR',
  AE: 'AED', QA: 'QAR', KW: 'KWD', ZA: 'ZAR', NG: 'NGN', KE: 'KES',
  EG: 'EGP', MA: 'MAD', DE: 'EUR', FR: 'EUR', NL: 'EUR', CH: 'CHF',
  ES: 'EUR', IT: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', PL: 'PLN',
  EU: 'EUR', XX: 'USD',
};

function mapCountryCode(region: string): string {
  const upper = region.toUpperCase();
  return regionToCountryCode[upper] ?? upper.substring(0, 2).toUpperCase();
}

function mapCurrency(countryCode: string): string {
  return countryToCurrency[countryCode] ?? 'USD';
}

// =============================================================================
// MIGRATION
// =============================================================================

export async function migrateProfiles(): Promise<void> {
  const profiles = getAllProfiles();
  console.log(`Found ${profiles.length} hardcoded profiles to migrate\n`);

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    const label = `[${i + 1}/${profiles.length}] ${p.id}`;
    const countryCode = mapCountryCode(p.region);
    const currencyCode = mapCurrency(countryCode);

    const row = {
      bank_code: p.id,
      bank_name: p.name,
      display_name: p.name,
      country_code: countryCode,
      currency_code: currencyCode,
      swift_code: p.identification.uniqueIdentifiers?.[0] ?? null,
      version: parseInt(p.version, 10) || 1,
      is_active: true,
      is_verified: true,
      confidence_threshold: p.identification.confidenceThreshold ?? 0.60,
      source: 'official',
      detect_patterns: {
        logoPatterns: p.identification.logoPatterns,
        uniqueIdentifiers: p.identification.uniqueIdentifiers ?? [],
        accountPatterns: p.identification.accountPatterns?.map((r: RegExp) => r.source) ?? [],
        confidenceThreshold: p.identification.confidenceThreshold,
      },
      transaction_patterns: {
        dateFormats: p.specialRules.dateFormatting.dateFormats,
        dateSeparator: p.specialRules.dateFormatting.dateSeparator,
        yearFormat: p.specialRules.dateFormatting.yearFormat,
        columnOrder: p.columnConfig.columnOrder,
        mergedDebitCredit: p.columnConfig.mergedDebitCredit,
        debitIndicators: p.columnConfig.debitIndicators ?? [],
        creditIndicators: p.columnConfig.creditIndicators ?? [],
        balancePosition: p.columnConfig.balancePosition,
        hasReferenceColumn: p.columnConfig.hasReferenceColumn ?? false,
        amountFormatting: p.specialRules.amountFormatting ?? null,
        multiLineDescriptions: p.specialRules.multiLineDescriptions ?? false,
        maxDescriptionLines: p.specialRules.maxDescriptionLines ?? 1,
      },
      column_config: {
        columnOrder: p.columnConfig.columnOrder,
        customOrder: p.columnConfig.customOrder ?? null,
        mergedDebitCredit: p.columnConfig.mergedDebitCredit,
        balancePosition: p.columnConfig.balancePosition,
        hasReferenceColumn: p.columnConfig.hasReferenceColumn ?? false,
        columnHints: p.columnConfig.columnHints ?? null,
      },
      validation_rules: {
        skipPatterns: p.specialRules.skipPatterns?.map((r: RegExp) => r.source) ?? [],
        openingBalancePatterns: p.specialRules.openingBalancePatterns?.map((r: RegExp) => r.source) ?? [],
        closingBalancePatterns: p.specialRules.closingBalancePatterns?.map((r: RegExp) => r.source) ?? [],
        pageHeaderPatterns: p.specialRules.pageHeaderPatterns?.map((r: RegExp) => r.source) ?? [],
        pageFooterPatterns: p.specialRules.pageFooterPatterns?.map((r: RegExp) => r.source) ?? [],
        continuationPatterns: p.specialRules.continuationPatterns?.map((r: RegExp) => r.source) ?? [],
      },
      regional_config: {
        defaultLocale: p.defaultLocale,
        currencySymbol: p.specialRules.amountFormatting?.currencySymbol ?? null,
        symbolPosition: p.specialRules.amountFormatting?.symbolPosition ?? null,
        negativeFormat: p.specialRules.amountFormatting?.negativeFormat ?? null,
        numberFormat: p.specialRules.amountFormatting?.numberFormat ?? null,
      },
    };

    const { error } = await supabase
      .from('bank_profiles')
      .upsert(row, { onConflict: 'bank_code' });

    if (error) {
      failed++;
      console.log(`${label} FAILED - ${error.message}`);
    } else {
      imported++;
      console.log(`${label} OK`);
    }
  }

  console.log(`\nMigration complete: ${imported} imported, ${failed} failed`);
}

// Run immediately
migrateProfiles().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

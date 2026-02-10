/**
 * Bank Profile Importer
 * Bulk-imports bank profiles from CSV files or JSON arrays,
 * merging with reusable templates from bank_profile_templates.
 */

import { readFileSync } from 'fs';
import { supabase } from './supabaseClient';

// =============================================================================
// TYPES
// =============================================================================

interface CSVRow {
  bank_code: string;
  bank_name: string;
  country_code: string;
  currency_code?: string;
  swift_code?: string;
  template_name?: string;
  notes?: string;
  custom_patterns?: string; // JSON string in CSV
}

interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

interface JSONProfileInput {
  bank_code: string;
  bank_name: string;
  country_code: string;
  currency_code?: string;
  swift_code?: string;
  template_name?: string;
  notes?: string;
  custom_patterns?: Record<string, any>;
  [key: string]: any;
}

// =============================================================================
// TEMPLATE CACHE
// =============================================================================

const templateCache = new Map<string, Record<string, any>>();

async function fetchTemplate(templateName: string): Promise<Record<string, any> | null> {
  if (templateCache.has(templateName)) return templateCache.get(templateName)!;

  const { data, error } = await supabase
    .from('bank_profile_templates')
    .select('template_patterns')
    .eq('template_name', templateName)
    .maybeSingle();

  if (error || !data) return null;

  templateCache.set(templateName, data.template_patterns ?? {});
  return data.template_patterns ?? {};
}

function deepMerge(base: Record<string, any>, override: Record<string, any>): Record<string, any> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key]) &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

// =============================================================================
// CSV PARSER (simple, no external dep)
// =============================================================================

function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

// =============================================================================
// CORE IMPORT LOGIC
// =============================================================================

async function importProfiles(rows: JSONProfileInput[]): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const label = `[${i + 1}/${rows.length}] ${row.bank_code}`;

    if (!row.bank_code || !row.bank_name || !row.country_code) {
      result.failed++;
      result.errors.push(`${label}: missing required fields (bank_code, bank_name, country_code)`);
      console.log(`${label} SKIPPED - missing required fields`);
      continue;
    }

    try {
      // Fetch template patterns if specified
      let patterns: Record<string, any> = {};
      if (row.template_name) {
        const tmpl = await fetchTemplate(row.template_name);
        if (tmpl) {
          patterns = { ...tmpl };
        } else {
          console.log(`${label} WARNING - template "${row.template_name}" not found, using empty`);
        }
      }

      // Merge custom patterns over template
      const custom = typeof row.custom_patterns === 'string'
        ? JSON.parse(row.custom_patterns || '{}')
        : (row.custom_patterns ?? {});

      const merged = deepMerge(patterns, custom);

      const profileRow = {
        bank_code: row.bank_code,
        bank_name: row.bank_name,
        display_name: row.bank_name,
        country_code: row.country_code,
        currency_code: row.currency_code || null,
        swift_code: row.swift_code || null,
        version: 1,
        is_active: true,
        is_verified: false,
        confidence_threshold: 0.60,
        detect_patterns: merged.detect_patterns ?? null,
        transaction_patterns: merged.transaction_patterns ?? null,
        validation_rules: merged.validation_rules ?? null,
        regional_config: merged.regional_config ?? null,
        column_config: merged.column_config ?? null,
        source: 'bulk_import',
      };

      const { error } = await supabase
        .from('bank_profiles')
        .upsert(profileRow, { onConflict: 'bank_code', ignoreDuplicates: true });

      if (error) {
        result.failed++;
        result.errors.push(`${label}: ${error.message}`);
        console.log(`${label} FAILED - ${error.message}`);
      } else {
        result.imported++;
        console.log(`${label} OK`);
      }
    } catch (err: any) {
      result.failed++;
      result.errors.push(`${label}: ${err.message}`);
      console.log(`${label} ERROR - ${err.message}`);
    }
  }

  console.log(`\nImport complete: ${result.imported} imported, ${result.failed} failed`);
  return result;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Import bank profiles from a CSV file.
 * CSV columns: bank_code, bank_name, country_code, currency_code, swift_code, template_name, notes
 * Optionally include a custom_patterns column with a JSON string for per-bank overrides.
 *
 * @param csvPath - Path to the CSV file
 * @returns Import result with counts and errors
 */
export async function importBankProfilesCSV(csvPath: string): Promise<ImportResult> {
  console.log(`Importing bank profiles from CSV: ${csvPath}`);
  const content = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content) as unknown as JSONProfileInput[];
  return importProfiles(rows);
}

/**
 * Import bank profiles from a pre-parsed JSON array.
 * Each object should have at minimum: bank_code, bank_name, country_code.
 * Optionally include template_name and custom_patterns for merging.
 *
 * @param profiles - Array of profile objects
 * @returns Import result with counts and errors
 */
export async function importBankProfilesJSON(profiles: object[]): Promise<ImportResult> {
  console.log(`Importing ${profiles.length} bank profiles from JSON`);
  return importProfiles(profiles as JSONProfileInput[]);
}

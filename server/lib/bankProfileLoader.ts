/**
 * Bank Profile Loader
 * Loads bank profiles from the database with caching and fallback logic.
 */

import { supabase } from './supabaseClient';

// =============================================================================
// TYPES
// =============================================================================

/** Bank profile as stored in the database */
export interface BankProfile {
  id: string;
  bank_code: string;
  bank_name: string;
  display_name: string;
  country_code: string;
  currency_code: string | null;
  swift_code: string | null;
  version: number;
  is_active: boolean;
  is_verified: boolean;
  confidence_threshold: number;
  detect_patterns: Record<string, any> | null;
  transaction_patterns: Record<string, any> | null;
  validation_rules: Record<string, any> | null;
  regional_config: Record<string, any> | null;
  column_config: Record<string, any> | null;
  created_by: string | null;
  source: string | null;
  usage_count: number;
  success_rate: number | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CACHE
// =============================================================================

const CACHE_TTL = 300_000; // 5 minutes

interface CacheEntry {
  data: BankProfile[];
  timestamp: number;
  country?: string;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(country?: string): string {
  return country ?? '__all__';
}

function getCached(country?: string): BankProfile[] | null {
  const entry = cache.get(cacheKey(country));
  if (!entry) return null;
  if (Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  return null;
}

function getStaleCached(country?: string): BankProfile[] | null {
  return cache.get(cacheKey(country))?.data ?? null;
}

function setCache(data: BankProfile[], country?: string): void {
  cache.set(cacheKey(country), { data, timestamp: Date.now(), country });
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Load active, verified bank profiles from the database.
 * Results are cached in-memory for 5 minutes. Falls back to stale cache on DB errors.
 *
 * @param options.country  - Filter by country_code (e.g. "US", "IN")
 * @param options.forceRefresh - Bypass cache and reload from DB
 * @returns Array of bank profiles ordered by usage_count descending
 */
export async function loadBankProfiles(
  options?: { country?: string; forceRefresh?: boolean }
): Promise<BankProfile[]> {
  const { country, forceRefresh } = options ?? {};

  if (!forceRefresh) {
    const cached = getCached(country);
    if (cached) return cached;
  }

  try {
    let query = supabase
      .from('bank_profiles')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('usage_count', { ascending: false });

    if (country) {
      query = query.eq('country_code', country);
    }

    const { data, error } = await query;

    if (error) throw error;

    const profiles = (data ?? []) as BankProfile[];
    setCache(profiles, country);
    return profiles;
  } catch (err) {
    console.error('[bankProfileLoader] DB load failed, using stale cache:', err);
    const stale = getStaleCached(country);
    if (stale) return stale;
    return [];
  }
}

/**
 * Retrieve a single bank profile by its unique bank_code.
 *
 * @param bankCode - Unique bank code (e.g. "chase-us", "hdfc-india")
 * @returns The matching profile or null if not found
 */
export async function getBankProfile(bankCode: string): Promise<BankProfile | null> {
  const { data, error } = await supabase
    .from('bank_profiles')
    .select('*')
    .eq('bank_code', bankCode)
    .maybeSingle();

  if (error) {
    console.error('[bankProfileLoader] getBankProfile error:', error);
    return null;
  }

  return data as BankProfile | null;
}

/**
 * Search bank profiles by name, display name, or alias.
 * Performs case-insensitive partial matching and returns up to 20 results.
 *
 * @param query - Search string
 * @returns Matching bank profiles
 */
export async function searchBankProfiles(query: string): Promise<BankProfile[]> {
  const pattern = `%${query}%`;

  // Search aliases for matching profile IDs
  const { data: aliasMatches } = await supabase
    .from('bank_aliases')
    .select('bank_profile_id')
    .ilike('alias_name', pattern);

  const aliasIds = (aliasMatches ?? []).map((a: any) => a.bank_profile_id);

  // Build main query with OR conditions
  let dbQuery = supabase
    .from('bank_profiles')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('usage_count', { ascending: false })
    .limit(20);

  if (aliasIds.length > 0) {
    dbQuery = dbQuery.or(
      `bank_name.ilike.${pattern},display_name.ilike.${pattern},id.in.(${aliasIds.join(',')})`
    );
  } else {
    dbQuery = dbQuery.or(`bank_name.ilike.${pattern},display_name.ilike.${pattern}`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('[bankProfileLoader] searchBankProfiles error:', error);
    return [];
  }

  return (data ?? []) as BankProfile[];
}

/**
 * Track that a bank profile was used for parsing.
 * Atomically increments usage_count and updates success_rate via DB function.
 *
 * @param bankProfileId - UUID of the bank profile
 * @param success - Whether the parsing was successful
 * @param extractedTransactions - Number of transactions extracted
 */
export async function trackProfileUsage(
  bankProfileId: string,
  success: boolean,
  extractedTransactions: number
): Promise<void> {
  const { error } = await supabase.rpc('increment_profile_usage', {
    profile_id: bankProfileId,
    was_successful: success,
    transaction_count: extractedTransactions,
  });

  if (error) {
    console.error('[bankProfileLoader] trackProfileUsage rpc error:', error);
  }
}

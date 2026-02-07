/**
 * Bank Profile Registry
 * Central registry for bank-specific parsing configurations
 */

import type { BankProfile, BankDetectionResult, ProfileRegistry } from './types';

// Import all bank profiles
import { genericProfile } from './profiles/generic';
// US Banks
import { chaseUSProfile } from './profiles/chase-us';
import { bofaUSProfile } from './profiles/bofa-us';
import { wellsFargoUSProfile } from './profiles/wells-fargo-us';
import { citibankUSProfile } from './profiles/citibank-us';
import { usbankUSProfile } from './profiles/usbank-us';
import { capitaloneUSProfile } from './profiles/capitalone-us';
// UK Banks
import { barclaysUKProfile } from './profiles/barclays-uk';
import { hsbcUKProfile } from './profiles/hsbc-uk';
import { lloydsUKProfile } from './profiles/lloyds-uk';
import { natwestUKProfile } from './profiles/natwest-uk';
// European Banks
import { santanderEUProfile } from './profiles/santander-eu';
import { deutscheBankDEProfile } from './profiles/deutsche-bank-de';
import { bnpFranceProfile } from './profiles/bnp-france';
import { creditagricoleFranceProfile } from './profiles/creditagricole-france';
import { ingNetherlandsProfile } from './profiles/ing-netherlands';
import { ubsSwitzerlandProfile } from './profiles/ubs-switzerland';
// India Banks
import { hdfcIndiaProfile } from './profiles/hdfc-india';
import { iciciIndiaProfile } from './profiles/icici-india';
import { sbiIndiaProfile } from './profiles/sbi-india';
import { axisIndiaProfile } from './profiles/axis-india';
import { kotakIndiaProfile } from './profiles/kotak-india';
import { pnbIndiaProfile } from './profiles/pnb-india';
// Australian Banks
import { cbaAustraliaProfile } from './profiles/cba-australia';
import { anzAustraliaProfile } from './profiles/anz-australia';
import { westpacAustraliaProfile } from './profiles/westpac-australia';
import { nabAustraliaProfile } from './profiles/nab-australia';
import { ingAustraliaProfile } from './profiles/ing-australia';
import { macquarieAustraliaProfile } from './profiles/macquarie-australia';
import { bendigoAustraliaProfile } from './profiles/bendigo-australia';
// Asia-Pacific Banks
import { dbsSingaporeProfile } from './profiles/dbs-singapore';
import { ocbcSingaporeProfile } from './profiles/ocbc-singapore';
import { uobSingaporeProfile } from './profiles/uob-singapore';
import { maybankMalaysiaProfile } from './profiles/maybank-malaysia';
import { cimbMalaysiaProfile } from './profiles/cimb-malaysia';
import { bocChinaProfile } from './profiles/boc-china';
// Canada Banks
import { tdCanadaProfile } from './profiles/td-canada';
import { rbcCanadaProfile } from './profiles/rbc-canada';
import { bmoCanadaProfile } from './profiles/bmo-canada';
import { scotiabankCanadaProfile } from './profiles/scotiabank-canada';
// Middle East Banks
import { enbdUaeProfile } from './profiles/enbd-uae';
import { adcbUaeProfile } from './profiles/adcb-uae';
// Africa Banks
import { standardbankZaProfile } from './profiles/standardbank-za';
// Global Banks
import { standardCharteredProfile } from './profiles/standard-chartered';

// Re-export types
export * from './types';

// =============================================================================
// PROFILE REGISTRY
// =============================================================================

const registeredProfiles: Map<string, BankProfile> = new Map();

// Register default profiles
const defaultProfiles: BankProfile[] = [
  // US Banks
  chaseUSProfile,
  bofaUSProfile,
  wellsFargoUSProfile,
  citibankUSProfile,
  // UK Banks
  hsbcUKProfile,
  barclaysUKProfile,
  lloydsUKProfile,
  natwestUKProfile,
  // European Banks
  santanderEUProfile,
  deutscheBankDEProfile,
  // India Banks
  hdfcIndiaProfile,
  iciciIndiaProfile,
  sbiIndiaProfile,
  // Australian Banks
  cbaAustraliaProfile,
  anzAustraliaProfile,
  westpacAustraliaProfile,
  nabAustraliaProfile,
  ingAustraliaProfile,
  macquarieAustraliaProfile,
  bendigoAustraliaProfile,
  // Asia-Pacific Banks
  dbsSingaporeProfile,
  // Canada Banks
  tdCanadaProfile,
  // Global Banks
  standardCharteredProfile,
  // Fallback
  genericProfile, // Always last as fallback
];

defaultProfiles.forEach(profile => {
  registeredProfiles.set(profile.id, profile);
});

// =============================================================================
// REGISTRY FUNCTIONS
// =============================================================================

/**
 * Get all registered bank profiles
 */
export function getAllProfiles(): BankProfile[] {
  return Array.from(registeredProfiles.values());
}

/**
 * Get a profile by its ID
 */
export function getProfileById(id: string): BankProfile | undefined {
  return registeredProfiles.get(id);
}

/**
 * Get profiles by region code
 */
export function getProfilesByRegion(region: string): BankProfile[] {
  return Array.from(registeredProfiles.values()).filter(
    p => p.region === region || p.region === 'GLOBAL'
  );
}

/**
 * Register a custom bank profile
 */
export function registerProfile(profile: BankProfile): void {
  registeredProfiles.set(profile.id, profile);
}

/**
 * Get the generic fallback profile
 */
export function getGenericProfile(): BankProfile {
  return genericProfile;
}

// =============================================================================
// BANK DETECTION
// =============================================================================

/**
 * Calculate match score for a profile against document content
 */
function calculateMatchScore(
  profile: BankProfile,
  textContent: string[],
  fileName?: string
): { score: number; matchedPatterns: string[] } {
  const matchedPatterns: string[] = [];
  let score = 0;
  
  // Combine all text for searching
  const fullText = textContent.join(' ').toLowerCase();
  const fileNameLower = (fileName ?? '').toLowerCase();
  
  // Check logo patterns (highest weight)
  for (const pattern of profile.identification.logoPatterns) {
    const patternLower = pattern.toLowerCase();
    if (fullText.includes(patternLower) || fileNameLower.includes(patternLower)) {
      score += 0.4;
      matchedPatterns.push(`logo:${pattern}`);
    }
  }
  
  // Check unique identifiers (high weight)
  for (const identifier of profile.identification.uniqueIdentifiers ?? []) {
    if (fullText.includes(identifier.toLowerCase())) {
      score += 0.3;
      matchedPatterns.push(`identifier:${identifier}`);
    }
  }
  
  // Check account patterns (medium weight)
  for (const regex of profile.identification.accountPatterns ?? []) {
    if (regex.test(fullText)) {
      score += 0.15;
      matchedPatterns.push(`account:${regex.source}`);
    }
  }
  
  // Regional bonus if currency symbol matches
  const currencySymbol = profile.specialRules.amountFormatting?.currencySymbol;
  if (currencySymbol && fullText.includes(currencySymbol)) {
    score += 0.1;
    matchedPatterns.push(`currency:${currencySymbol}`);
  }
  
  return { score: Math.min(score, 1), matchedPatterns };
}

/**
 * Detect the bank from document content
 */
export function detectBank(
  textContent: string[],
  fileName?: string
): BankDetectionResult {
  const profiles = Array.from(registeredProfiles.values()).filter(
    p => p.id !== 'generic'
  );
  
  let bestMatch: { profile: BankProfile; score: number; matchedPatterns: string[] } | null = null;
  
  for (const profile of profiles) {
    const { score, matchedPatterns } = calculateMatchScore(profile, textContent, fileName);
    
    if (score >= profile.identification.confidenceThreshold) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { profile, score, matchedPatterns };
      }
    }
  }
  
  if (bestMatch) {
    return {
      profile: bestMatch.profile,
      confidence: bestMatch.score,
      matchedPatterns: bestMatch.matchedPatterns,
      matchType: bestMatch.score >= 0.8 ? 'exact' : 'fuzzy',
    };
  }
  
  // Return generic profile as fallback
  return {
    profile: genericProfile,
    confidence: 0,
    matchedPatterns: [],
    matchType: 'fallback',
  };
}

/**
 * Get the best profile for a document
 */
export function getBestProfile(
  textContent: string[],
  fileName?: string,
  preferredProfileId?: string
): BankProfile {
  // If a preferred profile is specified, use it
  if (preferredProfileId) {
    const preferred = registeredProfiles.get(preferredProfileId);
    if (preferred) return preferred;
  }
  
  // Otherwise, auto-detect
  const detection = detectBank(textContent, fileName);
  return detection.profile ?? genericProfile;
}

// =============================================================================
// PROFILE HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a row should be skipped based on profile patterns
 */
export function shouldSkipRow(
  rowText: string,
  profile: BankProfile
): boolean {
  const text = rowText.toLowerCase().trim();
  
  // Check skip patterns
  const skipPatterns = profile.specialRules.skipPatterns ?? [];
  for (const pattern of skipPatterns) {
    if (pattern.test(text)) return true;
  }
  
  // Check page header patterns
  const headerPatterns = profile.specialRules.pageHeaderPatterns ?? [];
  for (const pattern of headerPatterns) {
    if (pattern.test(text)) return true;
  }
  
  // Check page footer patterns
  const footerPatterns = profile.specialRules.pageFooterPatterns ?? [];
  for (const pattern of footerPatterns) {
    if (pattern.test(text)) return true;
  }
  
  return false;
}

/**
 * Check if a row is an opening balance row
 */
export function isOpeningBalanceByProfile(
  rowText: string,
  profile: BankProfile
): boolean {
  const text = rowText.toLowerCase().trim();
  const patterns = profile.specialRules.openingBalancePatterns ?? [];
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Check if a row is a closing balance row
 */
export function isClosingBalanceByProfile(
  rowText: string,
  profile: BankProfile
): boolean {
  const text = rowText.toLowerCase().trim();
  const patterns = profile.specialRules.closingBalancePatterns ?? [];
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Check if a row is a continuation line
 */
export function isContinuationByProfile(
  rowText: string,
  profile: BankProfile
): boolean {
  const text = rowText.toLowerCase().trim();
  const patterns = profile.specialRules.continuationPatterns ?? [];
  return patterns.some(pattern => pattern.test(text));
}

// =============================================================================
// CREATE REGISTRY OBJECT
// =============================================================================

export const profileRegistry: ProfileRegistry = {
  getAll: getAllProfiles,
  getById: getProfileById,
  getByRegion: getProfilesByRegion,
  detectBank,
  register: registerProfile,
  getGenericProfile,
};

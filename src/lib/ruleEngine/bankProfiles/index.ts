/**
 * Bank Profile Registry
 * Central registry for bank-specific parsing configurations
 */

import type { BankProfile, BankDetectionResult, ProfileRegistry } from './types';

// Import all bank profiles
import { genericProfile } from './profiles/generic';
// US Banks - Major
import { chaseUSProfile } from './profiles/chase-us';
import { bofaUSProfile } from './profiles/bofa-us';
import { wellsFargoUSProfile } from './profiles/wells-fargo-us';
import { citibankUSProfile } from './profiles/citibank-us';
import { usbankUSProfile } from './profiles/usbank-us';
import { capitaloneUSProfile } from './profiles/capitalone-us';
import { pncUsProfile } from './profiles/pnc-us';
import { truistUsProfile } from './profiles/truist-us';
import { tdbankUsProfile } from './profiles/tdbank-us';
import { fifththirdUsProfile } from './profiles/fifththird-us';
import { allyUsProfile } from './profiles/ally-us';
import { schwabUsProfile } from './profiles/schwab-us';
import { discoverUsProfile } from './profiles/discover-us';
import { amexUsProfile } from './profiles/amex-us';
// US Banks - Investment & Large Regionals
import { goldmanUsProfile } from './profiles/goldman-us';
import { morganStanleyUsProfile } from './profiles/morgan-stanley-us';
import { citizensUsProfile } from './profiles/citizens-us';
import { firstCitizensUsProfile } from './profiles/first-citizens-us';
import { mtUsProfile } from './profiles/mt-us';
// US Banks - Regional Banks
import { huntingtonUsProfile } from './profiles/huntington-us';
import { keybankUsProfile } from './profiles/keybank-us';
import { regionsUsProfile } from './profiles/regions-us';
import { usaaUsProfile } from './profiles/usaa-us';
import { synchronyUsProfile } from './profiles/synchrony-us';
import { stateStreetUsProfile } from './profiles/state-street-us';
import { bnyMellonUsProfile } from './profiles/bny-mellon-us';
import { northernTrustUsProfile } from './profiles/northern-trust-us';
import { comericaUsProfile } from './profiles/comerica-us';
import { zionsUsProfile } from './profiles/zions-us';
// US Banks - Super-Regional & Specialty
import { popularUsProfile } from './profiles/popular-us';
import { bmoUsProfile } from './profiles/bmo-us';
import { eastWestUsProfile } from './profiles/east-west-us';
import { websterUsProfile } from './profiles/webster-us';
import { firstHorizonUsProfile } from './profiles/first-horizon-us';
import { frostUsProfile } from './profiles/frost-us';
import { umbUsProfile } from './profiles/umb-us';
import { flagstarUsProfile } from './profiles/flagstar-us';
import { synovusUsProfile } from './profiles/synovus-us';
import { navyFederalUsProfile } from './profiles/navy-federal-us';
// UK Banks
import { barclaysUKProfile } from './profiles/barclays-uk';
import { hsbcUKProfile } from './profiles/hsbc-uk';
import { lloydsUKProfile } from './profiles/lloyds-uk';
import { natwestUKProfile } from './profiles/natwest-uk';
import { santanderUkProfile } from './profiles/santander-uk';
import { tsbUkProfile } from './profiles/tsb-uk';
import { monzoUkProfile } from './profiles/monzo-uk';
import { revolutUkProfile } from './profiles/revolut-uk';
// European Banks
import { santanderEUProfile } from './profiles/santander-eu';
import { deutscheBankDEProfile } from './profiles/deutsche-bank-de';
import { bnpFranceProfile } from './profiles/bnp-france';
import { creditagricoleFranceProfile } from './profiles/creditagricole-france';
import { ingNetherlandsProfile } from './profiles/ing-netherlands';
import { ubsSwitzerlandProfile } from './profiles/ubs-switzerland';
import { socgenFranceProfile } from './profiles/socgen-france';
import { labanquepostaleFranceProfile } from './profiles/labanquepostale-france';
import { commerzbankDeProfile } from './profiles/commerzbank-de';
import { sparkasseDeProfile } from './profiles/sparkasse-de';
import { dkbDeProfile } from './profiles/dkb-de';
import { abnamroNlProfile } from './profiles/abnamro-nl';
import { rabobankNlProfile } from './profiles/rabobank-nl';
import { bbvaEsProfile } from './profiles/bbva-es';
import { caixabankEsProfile } from './profiles/caixabank-es';
import { intesaItProfile } from './profiles/intesa-it';
import { unicreditItProfile } from './profiles/unicredit-it';
import { kbcBeProfile } from './profiles/kbc-be';
import { bnpfortisBeProfile } from './profiles/bnpfortis-be';
import { ersteAtProfile } from './profiles/erste-at';
import { raiffeisenAtProfile } from './profiles/raiffeisen-at';
import { bcpPtProfile } from './profiles/bcp-pt';
import { pkoPlProfile } from './profiles/pko-pl';
import { mbankPlProfile } from './profiles/mbank-pl';
// India Banks
import { hdfcIndiaProfile } from './profiles/hdfc-india';
import { iciciIndiaProfile } from './profiles/icici-india';
import { sbiIndiaProfile } from './profiles/sbi-india';
import { axisIndiaProfile } from './profiles/axis-india';
import { kotakIndiaProfile } from './profiles/kotak-india';
import { pnbIndiaProfile } from './profiles/pnb-india';
import { bobIndiaProfile } from './profiles/bob-india';
import { canaraIndiaProfile } from './profiles/canara-india';
import { unionbankIndiaProfile } from './profiles/unionbank-india';
import { boiIndiaProfile } from './profiles/boi-india';
import { indianIndiaProfile } from './profiles/indian-india';
import { centralbankIndiaProfile } from './profiles/centralbank-india';
import { iobIndiaProfile } from './profiles/iob-india';
import { ucoIndiaProfile } from './profiles/uco-india';
import { yesIndiaProfile } from './profiles/yes-india';
import { idfcIndiaProfile } from './profiles/idfc-india';
import { indusindIndiaProfile } from './profiles/indusind-india';
import { federalIndiaProfile } from './profiles/federal-india';
import { sibIndiaProfile } from './profiles/sib-india';
import { bandhanIndiaProfile } from './profiles/bandhan-india';
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
import { fnbZaProfile } from './profiles/fnb-za';
import { absaZaProfile } from './profiles/absa-za';
import { nedbankZaProfile } from './profiles/nedbank-za';
import { capitecZaProfile } from './profiles/capitec-za';
import { firstbankNgProfile } from './profiles/firstbank-ng';
import { zenithNgProfile } from './profiles/zenith-ng';
import { gtbankNgProfile } from './profiles/gtbank-ng';
import { accessNgProfile } from './profiles/access-ng';
import { equityKeProfile } from './profiles/equity-ke';
import { kcbKeProfile } from './profiles/kcb-ke';
import { nbeEgProfile } from './profiles/nbe-eg';
import { attijariwafaMaProfile } from './profiles/attijariwafa-ma';
// Global Banks
import { standardCharteredProfile } from './profiles/standard-chartered';
// China Banks (Critical)
import { icbcChinaProfile } from './profiles/icbc-china';
import { ccbChinaProfile } from './profiles/ccb-china';
import { abcChinaProfile } from './profiles/abc-china';
// Japan Banks (Critical)
import { mufgJapanProfile } from './profiles/mufg-japan';
import { smbcJapanProfile } from './profiles/smbc-japan';
import { mizuhoJapanProfile } from './profiles/mizuho-japan';
// Korea Banks (Critical)
import { kookminKoreaProfile } from './profiles/kookmin-korea';
import { shinhanKoreaProfile } from './profiles/shinhan-korea';
import { wooriKoreaProfile } from './profiles/woori-korea';
import { hanaKoreaProfile } from './profiles/hana-korea';
// Thailand Banks (Critical)
import { bangkokThailandProfile } from './profiles/bangkok-thailand';
import { kbankThailandProfile } from './profiles/kbank-thailand';
import { scbThailandProfile } from './profiles/scb-thailand';
// Indonesia Banks (Critical)
import { bcaIndonesiaProfile } from './profiles/bca-indonesia';
import { mandiriIndonesiaProfile } from './profiles/mandiri-indonesia';
import { briIndonesiaProfile } from './profiles/bri-indonesia';
// Philippines Banks (Critical)
import { bdoPhilippinesProfile } from './profiles/bdo-philippines';
import { bpiPhilippinesProfile } from './profiles/bpi-philippines';
// Vietnam Banks (Critical)
import { vietcombankVnProfile } from './profiles/vietcombank-vn';
import { bidvVnProfile } from './profiles/bidv-vn';
// Hong Kong Banks (Critical)
import { hangsengHkProfile } from './profiles/hangseng-hk';
import { beaHkProfile } from './profiles/bea-hk';
// Brazil Banks (Critical)
import { itauBrazilProfile } from './profiles/itau-brazil';
import { bbBrazilProfile } from './profiles/bb-brazil';
import { bradescoBrazilProfile } from './profiles/bradesco-brazil';
import { caixaBrazilProfile } from './profiles/caixa-brazil';
// Mexico Banks (Critical)
import { bbvaMexicoProfile } from './profiles/bbva-mexico';
import { banorteMexicoProfile } from './profiles/banorte-mexico';
// Saudi Arabia Banks (Critical)
import { alrajhiSaProfile } from './profiles/alrajhi-sa';
import { snbSaProfile } from './profiles/snb-sa';
// Qatar Banks (Critical)
import { qnbQatarProfile } from './profiles/qnb-qatar';
// Kuwait Banks (Critical)
import { nbkKuwaitProfile } from './profiles/nbk-kuwait';

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
  usbankUSProfile,
  capitaloneUSProfile,
  pncUsProfile,
  truistUsProfile,
  tdbankUsProfile,
  fifththirdUsProfile,
  allyUsProfile,
  schwabUsProfile,
  discoverUsProfile,
  amexUsProfile,
  // UK Banks
  hsbcUKProfile,
  barclaysUKProfile,
  lloydsUKProfile,
  natwestUKProfile,
  santanderUkProfile,
  tsbUkProfile,
  monzoUkProfile,
  revolutUkProfile,
  // European Banks
  santanderEUProfile,
  deutscheBankDEProfile,
  bnpFranceProfile,
  creditagricoleFranceProfile,
  ingNetherlandsProfile,
  ubsSwitzerlandProfile,
  socgenFranceProfile,
  labanquepostaleFranceProfile,
  commerzbankDeProfile,
  sparkasseDeProfile,
  dkbDeProfile,
  abnamroNlProfile,
  rabobankNlProfile,
  bbvaEsProfile,
  caixabankEsProfile,
  intesaItProfile,
  unicreditItProfile,
  kbcBeProfile,
  bnpfortisBeProfile,
  ersteAtProfile,
  raiffeisenAtProfile,
  bcpPtProfile,
  pkoPlProfile,
  mbankPlProfile,
  // India Banks
  hdfcIndiaProfile,
  iciciIndiaProfile,
  sbiIndiaProfile,
  axisIndiaProfile,
  kotakIndiaProfile,
  pnbIndiaProfile,
  bobIndiaProfile,
  canaraIndiaProfile,
  unionbankIndiaProfile,
  boiIndiaProfile,
  indianIndiaProfile,
  centralbankIndiaProfile,
  iobIndiaProfile,
  ucoIndiaProfile,
  yesIndiaProfile,
  idfcIndiaProfile,
  indusindIndiaProfile,
  federalIndiaProfile,
  sibIndiaProfile,
  bandhanIndiaProfile,
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
  ocbcSingaporeProfile,
  uobSingaporeProfile,
  maybankMalaysiaProfile,
  cimbMalaysiaProfile,
  bocChinaProfile,
  // Canada Banks
  tdCanadaProfile,
  rbcCanadaProfile,
  bmoCanadaProfile,
  scotiabankCanadaProfile,
  // Middle East Banks
  enbdUaeProfile,
  adcbUaeProfile,
  // Africa Banks
  standardbankZaProfile,
  fnbZaProfile,
  absaZaProfile,
  nedbankZaProfile,
  capitecZaProfile,
  firstbankNgProfile,
  zenithNgProfile,
  gtbankNgProfile,
  accessNgProfile,
  equityKeProfile,
  kcbKeProfile,
  nbeEgProfile,
  attijariwafaMaProfile,
  // Global Banks
  standardCharteredProfile,
  // China Banks (Critical)
  icbcChinaProfile,
  ccbChinaProfile,
  abcChinaProfile,
  // Japan Banks (Critical)
  mufgJapanProfile,
  smbcJapanProfile,
  mizuhoJapanProfile,
  // Korea Banks (Critical)
  kookminKoreaProfile,
  shinhanKoreaProfile,
  wooriKoreaProfile,
  hanaKoreaProfile,
  // Thailand Banks (Critical)
  bangkokThailandProfile,
  kbankThailandProfile,
  scbThailandProfile,
  // Indonesia Banks (Critical)
  bcaIndonesiaProfile,
  mandiriIndonesiaProfile,
  briIndonesiaProfile,
  // Philippines Banks (Critical)
  bdoPhilippinesProfile,
  bpiPhilippinesProfile,
  // Vietnam Banks (Critical)
  vietcombankVnProfile,
  bidvVnProfile,
  // Hong Kong Banks (Critical)
  hangsengHkProfile,
  beaHkProfile,
  // Brazil Banks (Critical)
  itauBrazilProfile,
  bbBrazilProfile,
  bradescoBrazilProfile,
  caixaBrazilProfile,
  // Mexico Banks (Critical)
  bbvaMexicoProfile,
  banorteMexicoProfile,
  // Saudi Arabia Banks (Critical)
  alrajhiSaProfile,
  snbSaProfile,
  // Qatar Banks (Critical)
  qnbQatarProfile,
  // Kuwait Banks (Critical)
  nbkKuwaitProfile,
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

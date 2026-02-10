/**
 * Bank Profiles Routes
 * Contribution, search, and stats endpoints for the bank profile system.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticateUser, type AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();

// =============================================================================
// SCHEMAS
// =============================================================================

const contributeSchema = z.object({
  bank_name: z.string().trim().min(2, 'bank_name must be at least 2 characters').max(200),
  country_code: z.string().trim().length(2, 'country_code must be exactly 2 characters'),
  currency_code: z.string().trim().length(3, 'currency_code must be exactly 3 characters').optional(),
  swift_code: z.string().trim().max(11).optional(),
  proposed_profile: z.object({
    detect_patterns: z.record(z.any()),
    transaction_patterns: z.record(z.any()),
  }).passthrough(),
  sample_pdf_urls: z.array(z.string().url()).max(10).optional(),
  notes: z.string().trim().max(2000).optional(),
});

// =============================================================================
// POST /contribute
// =============================================================================

router.post('/contribute', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const parsed = contributeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { bank_name, country_code, currency_code, swift_code, proposed_profile, sample_pdf_urls, notes } = parsed.data;

  try {
    // Check for duplicate contribution by same user for same bank+country
    const { data: existing } = await supabase
      .from('bank_profile_contributions')
      .select('id')
      .eq('bank_name', bank_name)
      .eq('country_code', country_code)
      .eq('submitted_by', req.userId!)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      res.status(409).json({ error: 'You already have a pending contribution for this bank and country' });
      return;
    }

    const { data, error } = await supabase
      .from('bank_profile_contributions')
      .insert({
        bank_name,
        country_code,
        proposed_profile: { ...proposed_profile, currency_code, swift_code },
        submitted_by: req.userId!,
        contact_email: req.userEmail ?? null,
        sample_pdf_urls: sample_pdf_urls ?? null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[bankProfiles] contribute insert error:', error);
      res.status(500).json({ error: 'Failed to submit contribution' });
      return;
    }

    res.status(201).json({
      success: true,
      contributionId: data.id,
      message: 'Bank profile contribution submitted for review',
    });
  } catch (err: any) {
    console.error('[bankProfiles] contribute error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// GET /search
// =============================================================================

router.get('/search', async (req, res) => {
  const query = (req.query.query as string || '').trim();
  const country = (req.query.country as string || '').trim();
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);

  try {
    let dbQuery = supabase
      .from('bank_profiles')
      .select('id, bank_code, bank_name, display_name, country_code, currency_code, swift_code, usage_count, success_rate, confidence_threshold', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (query) {
      const pattern = `%${query}%`;
      dbQuery = dbQuery.or(`bank_name.ilike.${pattern},display_name.ilike.${pattern}`);
    }

    if (country) {
      dbQuery = dbQuery.eq('country_code', country.toUpperCase());
    }

    const { data, count, error } = await dbQuery;

    if (error) {
      console.error('[bankProfiles] search error:', error);
      res.status(500).json({ error: 'Search failed' });
      return;
    }

    res.json({ profiles: data ?? [], total: count ?? 0 });
  } catch (err: any) {
    console.error('[bankProfiles] search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// GET /stats
// =============================================================================

router.get('/stats', async (_req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('bank_profiles')
      .select('bank_name, country_code, usage_count, success_rate')
      .eq('is_active', true)
      .eq('is_verified', true);

    if (error) {
      console.error('[bankProfiles] stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
      return;
    }

    const all = profiles ?? [];
    const countryCodes = [...new Set(all.map(p => p.country_code))].sort();
    const mostUsed = [...all]
      .sort((a, b) => (b.usage_count ?? 0) - (a.usage_count ?? 0))
      .slice(0, 10)
      .map(p => ({
        bank_name: p.bank_name,
        usage_count: p.usage_count,
        success_rate: p.success_rate,
      }));

    res.json({
      totalProfiles: all.length,
      totalCountries: countryCodes.length,
      countryCodes,
      mostUsedProfiles: mostUsed,
    });
  } catch (err: any) {
    console.error('[bankProfiles] stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

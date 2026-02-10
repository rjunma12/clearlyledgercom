/**
 * Jobs API routes — CRUD for processing_jobs table.
 */

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, type AuthenticatedRequest } from '../middleware/auth.js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../lib/config.js';

const router = Router();

// List user's processing jobs (paginated, filterable)
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    const status = validStatuses.includes(req.query.status as string) ? req.query.status as string : null;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let countQuery = supabase
      .from('processing_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId!);
    if (status) countQuery = countQuery.eq('status', status);

    const { count, error: countErr } = await countQuery;

    if (countErr) {
      res.status(500).json({ error: 'Failed to fetch job count' });
      return;
    }

    let dataQuery = supabase
      .from('processing_jobs')
      .select('id, status, total_transactions, created_at, started_at, completed_at, updated_at')
      .eq('user_id', req.userId!);
    if (status) dataQuery = dataQuery.eq('status', status);

    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch processing jobs' });
      return;
    }

    const total = count ?? 0;
    res.json({
      jobs: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Server] Jobs endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single job with full transactions
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (error) {
      console.error('[Server] Failed to fetch job:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({ job: data });
  } catch (err) {
    console.error('[Server] Job detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job status
router.patch('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    const { status } = req.body || {};

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const updateData: Record<string, string> = { status };
    if (status === 'processing') updateData.started_at = new Date().toISOString();
    if (status === 'completed' || status === 'failed') updateData.completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('processing_jobs')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select('id, status, started_at, completed_at, updated_at')
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: 'Failed to update job' });
      return;
    }
    if (!data) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({ job: data });
  } catch (err) {
    console.error('[Server] Job patch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a completed/failed job
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: job, error: fetchErr } = await supabase
      .from('processing_jobs')
      .select('id, status')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (fetchErr) {
      res.status(500).json({ error: 'Failed to look up job' });
      return;
    }
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (job.status !== 'completed' && job.status !== 'failed') {
      res.status(400).json({ error: 'Only completed or failed jobs can be deleted' });
      return;
    }

    const { error: delErr } = await supabase
      .from('processing_jobs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId!);

    if (delErr) {
      res.status(500).json({ error: 'Failed to delete job' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Server] Job delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

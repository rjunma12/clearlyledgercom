/**
 * ClearlyLedger Express Server
 * Server-side PDF processing with authentication, validation, and rate limiting.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { authenticateUser, type AuthenticatedRequest } from './middleware/auth.js';
import { processPDFBuffer } from './lib/pdfProcessor.js';

// =============================================================================
// CONFIG
// =============================================================================

const PORT = parseInt(process.env.PORT || '3001', 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MIN_FILE_SIZE = 100; // 100 bytes
const PDF_MAGIC_BYTES = Buffer.from('%PDF');

// =============================================================================
// EXPRESS SETUP
// =============================================================================

const app = express();

// Security headers
app.use(helmet());

// CORS — configured origins only (not wildcard)
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// =============================================================================
// RATE LIMITING
// =============================================================================

// Upload endpoint: 20 uploads/hour per user
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req: any) => req.userId || req.ip,
  message: { error: 'Upload limit exceeded. Maximum 20 uploads per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API: 100 requests/15min
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req: any) => req.userId || req.ip,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// =============================================================================
// FILE UPLOAD (multer with temp directory)
// =============================================================================

const uploadDir = path.join(os.tmpdir(), 'clearlyledger-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, _file, cb) => cb(null, `${uuidv4()}.pdf`),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are accepted'));
      return;
    }
    cb(null, true);
  },
});

// =============================================================================
// PDF VALIDATION MIDDLEWARE
// =============================================================================

function validatePDF(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): void {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Check min file size
  if (file.size < MIN_FILE_SIZE) {
    cleanupFile(file.path);
    res.status(400).json({ error: 'File too small to be a valid PDF' });
    return;
  }

  // Read first bytes to check PDF magic bytes
  try {
    const fd = fs.openSync(file.path, 'r');
    const header = Buffer.alloc(5);
    fs.readSync(fd, header, 0, 5, 0);
    fs.closeSync(fd);

    if (!header.subarray(0, 4).equals(PDF_MAGIC_BYTES)) {
      cleanupFile(file.path);
      res.status(400).json({ error: 'File does not have valid PDF magic bytes (%PDF)' });
      return;
    }
  } catch {
    cleanupFile(file.path);
    res.status(400).json({ error: 'Failed to read uploaded file' });
    return;
  }

  // Check for JavaScript in PDF (basic security check)
  try {
    const content = fs.readFileSync(file.path);
    const contentStr = content.toString('latin1');
    if (/\/JavaScript\s/i.test(contentStr) || /\/JS\s/i.test(contentStr)) {
      cleanupFile(file.path);
      res.status(400).json({ error: 'PDF contains JavaScript, which is not allowed for security reasons' });
      return;
    }
  } catch {
    // If we can't check, continue cautiously
  }

  next();
}

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// List user's processing jobs
app.get('/api/jobs', authenticateUser, async (req: AuthenticatedRequest, res) => {
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
app.get('/api/jobs/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
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

// Delete a completed job
app.delete('/api/jobs/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify job exists, belongs to user, and is completed
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

// Update job status
app.patch('/api/jobs/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
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

// PDF Processing endpoint
app.post(
  '/api/process-pdf',
  authenticateUser,
  uploadLimiter,
  upload.single('pdf'),
  validatePDF,
  async (req: AuthenticatedRequest, res) => {
    const file = req.file!;
    const jobId = uuidv4();
    const startTime = Date.now();

    try {
      // Read PDF buffer
      const buffer = fs.readFileSync(file.path);

      // Parse options from request body
      const locale = req.body?.locale || 'auto';
      const confidenceThreshold = parseFloat(req.body?.confidenceThreshold) || 0.6;
      const maxPages = parseInt(req.body?.maxPages) || 0;

      // Process PDF
      const result = await processPDFBuffer(buffer, {
        fileName: file.originalname,
        locale,
        confidenceThreshold,
        maxPages: maxPages > 0 ? maxPages : undefined,
      });

      // Store result in Supabase processing_jobs
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        await supabase.from('processing_jobs').insert({
          id: jobId,
          user_id: req.userId!,
          status: result.success ? 'completed' : 'failed',
          transactions: result.document?.transactions || [],
          total_transactions: result.document?.totalTransactions || 0,
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.error('[Server] Failed to store processing job:', dbErr);
        // Don't fail the request if DB write fails
      }

      // Return result (sanitize — never expose internal errors to client)
      res.json({
        jobId,
        success: result.success,
        pdfType: result.pdfType,
        totalPages: result.totalPages,
        processingTimeMs: result.processingTimeMs,
        document: result.document || null,
        errors: result.errors.map(e => ({
          code: e.code,
          message: e.message,
          recoverable: e.recoverable,
        })),
        warnings: result.warnings,
      });
    } catch (err) {
      console.error('[Server] PDF processing failed:', err);
      res.status(500).json({
        jobId,
        success: false,
        error: 'PDF processing failed. Please try again or use client-side processing.',
      });
    } finally {
      // Always clean up temp file
      cleanupFile(file.path);
    }
  }
);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Multer error handler
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  if (err?.message === 'Only PDF files are accepted') {
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
});

// Global error handler — never leak internal errors
app.use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', _err);
  res.status(500).json({ error: 'Internal server error' });
});

// =============================================================================
// START
// =============================================================================

app.listen(PORT, () => {
  console.log(`[Server] ClearlyLedger PDF processing server running on port ${PORT}`);
  console.log(`[Server] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

// =============================================================================
// UTILITIES
// =============================================================================

function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    console.warn(`[Server] Failed to clean up temp file: ${filePath}`);
  }
}

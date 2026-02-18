/**
 * PDF processing API routes.
 */

import { Router } from 'express';
import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';

import { authenticateUser, type AuthenticatedRequest } from '../middleware/auth.js';
import { processPDFBuffer } from '../lib/pdfProcessor.js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY, MAX_FILE_SIZE, MIN_FILE_SIZE, PDF_MAGIC_BYTES } from '../lib/config.js';
import { processPdfBodySchema } from '../lib/validation.js';

const router = Router();

// =============================================================================
// SINGLETON SUPABASE CLIENT (module-level, reused across all requests)
// =============================================================================

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =============================================================================
// RATE LIMITING
// =============================================================================

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req: any) => req.userId || req.ip,
  message: { error: 'Upload limit exceeded. Maximum 20 uploads per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================================================
// FILE UPLOAD (multer with memoryStorage — no disk writes)
// =============================================================================

const upload = multer({
  storage: multer.memoryStorage(),
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
// PDF VALIDATION MIDDLEWARE (buffer-based, no disk I/O)
// =============================================================================

function validatePDF(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): void {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  if (file.size < MIN_FILE_SIZE) {
    res.status(400).json({ error: 'File too small to be a valid PDF' });
    return;
  }

  const buffer = file.buffer;

  // Check PDF magic bytes from buffer directly
  const header = buffer.subarray(0, 4);
  if (!header.equals(PDF_MAGIC_BYTES)) {
    res.status(400).json({ error: 'File does not have valid PDF magic bytes (%PDF)' });
    return;
  }

  // Check for embedded JavaScript (security)
  try {
    const contentStr = buffer.toString('latin1');
    if (/\/JavaScript\s/i.test(contentStr) || /\/JS\s/i.test(contentStr)) {
      res.status(400).json({ error: 'PDF contains JavaScript, which is not allowed for security reasons' });
      return;
    }
  } catch {
    // If we can't check, continue cautiously
  }

  next();
}

// =============================================================================
// MULTER ERROR HANDLER
// =============================================================================

export function multerErrorHandler(err: any, _req: express.Request, res: express.Response, next: express.NextFunction): void {
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
}

// =============================================================================
// ROUTE
// =============================================================================

router.post(
  '/',
  authenticateUser,
  uploadLimiter,
  upload.single('pdf'),
  validatePDF,
  async (req: AuthenticatedRequest, res) => {
    const file = req.file!;
    const buffer = file.buffer;
    const jobId = uuidv4();
    const startTime = Date.now();

    try {
      // Validate and parse form fields
      const parsed = processPdfBodySchema.safeParse(req.body || {});
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid processing options', details: parsed.error.flatten().fieldErrors });
        return;
      }

      const { locale, confidenceThreshold, maxPages } = parsed.data;

      // ── Cache check (SHA-256 dedup) — runs BEFORE quota to avoid double-charging ──
      const fileHash = createHash('sha256').update(buffer).digest('hex');
      let cacheHit = false;

      try {
        const { data: cached } = await supabaseAdmin
          .from('conversion_cache')
          .select('result')
          .eq('file_hash', fileHash)
          .eq('user_id', req.userId!)
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (cached?.result) {
          cacheHit = true;
          res.json({ ...cached.result, jobId, cached: true });
          return;
        }
      } catch {
        // Cache miss or cache table doesn't exist — continue with conversion
      }

      // ── Quota check via RPC (only reached on cache miss) ──
      try {
        const { data: quotaResult, error: quotaErr } = await supabaseAdmin.rpc('check_and_reserve_pages', {
          p_user_id: req.userId!,
          p_pages: 1,
        });

        if (quotaErr) {
          console.warn('[Server] Quota RPC not available, continuing:', quotaErr.message);
        } else if (quotaResult && quotaResult.allowed === false) {
          res.status(402).json({
            error: 'Page quota exceeded. Please upgrade your plan.',
            quotaExceeded: true,
            remaining: quotaResult.remaining,
          });
          return;
        }
      } catch (quotaCheckErr) {
        console.error('[Server] Quota check unavailable — blocking request:', quotaCheckErr);
        res.status(503).json({ error: 'Service temporarily unavailable. Please retry in a moment.', retryable: true });
        return;
      }

      // ── Process PDF (with 120s timeout) ──
      const CONVERSION_TIMEOUT_MS = 120_000;
      const result = await Promise.race([
        processPDFBuffer(buffer, {
          fileName: file.originalname,
          locale,
          confidenceThreshold,
          maxPages: maxPages > 0 ? maxPages : undefined,
        }),
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Conversion timeout after 120s')), CONVERSION_TIMEOUT_MS)
        ),
      ]);

      // ── Block 200 OK when validation failed ──
      if (result.success && result.document?.overallValidation === 'error') {
        res.status(422).json({
          jobId,
          success: false,
          error: 'Validation failed — output may be incomplete. Try re-uploading or use the client-side processor.',
          pdfType: result.pdfType,
          totalPages: result.totalPages,
          details: result.errors ?? [],
        });
        return;
      }

      // Extract transactions: prefer rawTransactions, fallback to segment flatMap
      const transactions = result.document?.rawTransactions
        || result.document?.segments?.flatMap(s => s.transactions)
        || [];
      const totalTransactions = transactions.length
        || result.document?.totalTransactions
        || 0;

      const header = result.document?.extractedHeader;

      const responsePayload = {
        jobId,
        success: result.success,
        pdfType: result.pdfType,
        totalPages: result.totalPages,
        processingTimeMs: result.processingTimeMs,
        transactions,
        totalTransactions,
        document: result.document || null,
        result: {
          pages: result.totalPages,
          transactions: transactions.map((t: any) => ({
            date: t.date ?? '',
            description: t.description ?? '',
            debit: t.debit ?? null,
            credit: t.credit ?? null,
            balance: t.balance ?? null,
            category: t.category ?? null,
          })),
          accountHolder: header?.accountHolder ?? null,
          accountNumber: header?.accountNumberMasked ?? null,
          bankDetected: header?.bankName ?? null,
          statementPeriod: {
            from: header?.statementPeriodFrom ?? null,
            to: header?.statementPeriodTo ?? null,
          },
          currency: header?.currency ?? null,
          totalTransactions,
          confidence: result.confidence ?? null,
        },
        errors: result.errors?.length > 0 ? result.errors.map(e => ({
          code: e.code,
          message: e.message,
          recoverable: e.recoverable,
        })) : [],
        warnings: result.warnings || [],
      };

      // ── DB insert for processing_jobs (BEFORE sending response) ──
      const { error: dbErr } = await supabaseAdmin.from('processing_jobs').insert({
        id: jobId,
        user_id: req.userId!,
        status: result.success ? 'completed' : 'failed',
        filename: file.originalname,
        file_size: file.size,
        transactions,
        total_transactions: totalTransactions,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
      });

      if (dbErr) {
        console.error('[Server] Failed to store processing job:', dbErr.message);
      }

      // ── Cache the result (non-blocking, errors logged) ──
      if (!cacheHit) {
        supabaseAdmin.from('conversion_cache').insert({
          file_hash: fileHash,
          user_id: req.userId!,
          result: responsePayload,
        }).then(({ error: cacheErr }) => {
          if (cacheErr) {
            console.error('[Server] Failed to cache conversion result:', cacheErr.message);
          }
        });
      }

      res.json(responsePayload);
    } catch (err) {
      console.error('[Server] PDF processing failed:', err);
      res.status(500).json({
        jobId,
        success: false,
        error: 'PDF processing failed. Please try again or use client-side processing.',
      });
    }
    // No finally/cleanup needed — memoryStorage, no disk files
  }
);

export default router;

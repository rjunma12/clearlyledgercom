/**
 * PDF processing API routes.
 */

import { Router } from 'express';
import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';
import rateLimit from 'express-rate-limit';

import { authenticateUser, type AuthenticatedRequest } from '../middleware/auth.js';
import { processPDFBuffer } from '../lib/pdfProcessor.js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY, MAX_FILE_SIZE, MIN_FILE_SIZE, PDF_MAGIC_BYTES } from '../lib/config.js';
import { cleanupFile } from '../lib/utils.js';
import { processPdfBodySchema } from '../lib/validation.js';

const router = Router();

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

  if (file.size < MIN_FILE_SIZE) {
    cleanupFile(file.path);
    res.status(400).json({ error: 'File too small to be a valid PDF' });
    return;
  }

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
    const jobId = uuidv4();
    const startTime = Date.now();

    try {
      const buffer = fs.readFileSync(file.path);

      // Validate and parse form fields
      const parsed = processPdfBodySchema.safeParse(req.body || {});
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid processing options', details: parsed.error.flatten().fieldErrors });
        return;
      }

      const { locale, confidenceThreshold, maxPages } = parsed.data;

      const result = await processPDFBuffer(buffer, {
        fileName: file.originalname,
        locale,
        confidenceThreshold,
        maxPages: maxPages > 0 ? maxPages : undefined,
      });

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
      }

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
      cleanupFile(file.path);
    }
  }
);

export default router;

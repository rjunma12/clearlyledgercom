/**
 * ClearlyLedger Express Server
 * Server-side PDF processing with authentication, validation, and rate limiting.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { PORT, ALLOWED_ORIGINS } from './lib/config.js';
import { requestLogger } from './middleware/requestLogger.js';
import jobsRouter from './routes/jobs.js';
import pdfRouter, { multerErrorHandler } from './routes/pdf.js';
import bankProfilesRouter from './routes/bankProfiles.js';

// =============================================================================
// EXPRESS SETUP
// =============================================================================

const app = express();

app.use(helmet());

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(requestLogger);

// General API rate limit: 100 requests/15min
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req: any) => (req as any).userId || req.ip,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// =============================================================================
// ROUTES
// =============================================================================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/jobs', jobsRouter);
app.use('/api/process-pdf', pdfRouter);
app.use('/api/bank-profiles', bankProfilesRouter);

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use(multerErrorHandler);

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

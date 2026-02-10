/**
 * Zod validation schemas for all server API endpoints.
 */

import { z } from 'zod';

// UUID format
const uuidSchema = z.string().uuid('Invalid job ID format');

// GET /api/jobs query params
export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

// GET /api/jobs/:id params
export const jobIdParamSchema = z.object({
  id: uuidSchema,
});

// PATCH /api/jobs/:id body
export const updateJobBodySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status',
  }),
});

// POST /api/process-pdf body (multipart form fields)
export const processPdfBodySchema = z.object({
  locale: z.string().max(10).default('auto'),
  confidenceThreshold: z.coerce.number().min(0).max(1).default(0.6),
  maxPages: z.coerce.number().int().min(0).max(5000).default(0),
});

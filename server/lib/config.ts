/**
 * Server configuration constants.
 */

export const PORT = parseInt(process.env.PORT || '3001', 10);
export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
export const SUPABASE_URL = process.env.SUPABASE_URL!;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MIN_FILE_SIZE = 100; // 100 bytes
export const PDF_MAGIC_BYTES = Buffer.from('%PDF');

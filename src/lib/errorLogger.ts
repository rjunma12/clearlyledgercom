import { supabase } from "@/integrations/supabase/client";

interface ErrorLogParams {
  errorType: string;
  errorMessage: string;
  errorCode?: string;
  component: string;
  action: string;
  metadata?: Record<string, unknown>;
}

// Sanitize metadata to remove PII (emails, phone numbers, etc.)
function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const piiKeys = ['email', 'phone', 'name', 'address', 'ssn', 'password'];
  
  for (const [key, value] of Object.entries(metadata)) {
    // Skip PII fields entirely
    if (piiKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      // Check for email patterns in string values
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      sanitized[key] = value.replace(emailPattern, '[EMAIL_REDACTED]');
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export async function logError(params: ErrorLogParams): Promise<void> {
  try {
    // Get current user if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get session fingerprint from localStorage
    const sessionFingerprint = localStorage.getItem('session_fingerprint');

    // Sanitize metadata to remove PII before logging
    const sanitizedMetadata = params.metadata ? sanitizeMetadata(params.metadata) : {};

    // Use type assertion since error_logs is a new table
    await (supabase.from('error_logs') as any).insert({
      user_id: session?.user?.id || null,
      session_fingerprint: sessionFingerprint,
      error_type: params.errorType,
      error_message: params.errorMessage,
      error_code: params.errorCode,
      component: params.component,
      action: params.action,
      metadata: sanitizedMetadata,
    });
  } catch (e) {
    // Silently fail - don't show errors about error logging
    console.error('[ErrorLogger] Failed to log error:', e);
  }
}

// Error type constants
export const ErrorTypes = {
  PROCESSING: 'processing',
  EXPORT: 'export',
  AUTH: 'auth',
  QUOTA: 'quota',
  VALIDATION: 'validation',
  SUBSCRIPTION: 'subscription',
  CHECKOUT: 'checkout',
  NETWORK: 'network',
  CONTACT: 'contact',
  PREFERENCES: 'preferences',
} as const;

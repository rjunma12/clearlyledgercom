import { supabase } from "@/integrations/supabase/client";

interface ErrorLogParams {
  errorType: string;
  errorMessage: string;
  errorCode?: string;
  component: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export async function logError(params: ErrorLogParams): Promise<void> {
  try {
    // Get current user if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get session fingerprint from localStorage
    const sessionFingerprint = localStorage.getItem('session_fingerprint');

    // Use type assertion since error_logs is a new table
    await (supabase.from('error_logs') as any).insert({
      user_id: session?.user?.id || null,
      session_fingerprint: sessionFingerprint,
      error_type: params.errorType,
      error_message: params.errorMessage,
      error_code: params.errorCode,
      component: params.component,
      action: params.action,
      metadata: params.metadata || {},
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

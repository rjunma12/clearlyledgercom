import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PlanType = 'anonymous' | 'registered_free' | 'starter' | 'pro' | 'business' | 'lifetime';
export type PiiMaskingLevel = 'none' | 'optional' | 'enforced';
export type ExportFormat = 'csv' | 'xlsx';

export interface UserPlan {
  planName: PlanType;
  displayName: string;
  dailyLimit: number | null; // null = no daily limit
  monthlyLimit: number | null; // null = no monthly limit
  piiMasking: PiiMaskingLevel;
  allowedFormats: ExportFormat[]; // Formats allowed for this plan
}

export interface UsageInfo {
  pagesUsedToday: number;
  pagesRemaining: number; // -1 = unlimited
  dailyLimit: number | null;
  monthlyLimit: number | null;
  isUnlimited: boolean;
}

// Batch upload limits by plan
const BATCH_LIMITS: Record<PlanType, number> = {
  anonymous: 1,
  registered_free: 1,
  starter: 1,
  pro: 10,
  business: 20,
  lifetime: 10,
};

interface UseUsageReturn {
  plan: UserPlan | null;
  usage: UsageInfo | null;
  lifetimeSpotsRemaining: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  canProcess: boolean;
  canUsePiiMasking: boolean;
  isPiiMaskingEnforced: boolean;
  canBatchUpload: boolean;
  maxBatchFiles: number;
  allowedFormats: ExportFormat[];
  refreshUsage: () => Promise<void>;
  incrementUsage: (pages: number) => Promise<boolean>;
}

export function useUsage(): UseUsageReturn {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [lifetimeSpotsRemaining, setLifetimeSpotsRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchPlanAndUsage = useCallback(async (currentUserId: string | null) => {
    try {
      // Fetch user's plan
      const { data: planData, error: planError } = await supabase
        .rpc('get_user_plan', { p_user_id: currentUserId });
      
      if (planError) {
        // Log in development only
        if (import.meta.env.DEV) {
          console.error('Error fetching plan:', planError);
        }
        // Default to anonymous plan
        setPlan({
          planName: 'anonymous',
          displayName: 'Anonymous',
          dailyLimit: 1,
          monthlyLimit: null,
          piiMasking: 'none',
          allowedFormats: ['xlsx'] // Anonymous only gets Excel
        });
      } else if (planData && planData.length > 0) {
        const p = planData[0];
        // Parse allowed_formats from DB (comes as string array)
        const formats: ExportFormat[] = Array.isArray(p.allowed_formats) 
          ? p.allowed_formats.filter((f: string): f is ExportFormat => f === 'csv' || f === 'xlsx')
          : ['xlsx']; // Default to xlsx only if not specified
        
        setPlan({
          planName: p.plan_name as PlanType,
          displayName: p.display_name,
          dailyLimit: p.daily_limit,
          monthlyLimit: p.monthly_limit,
          piiMasking: p.pii_masking as PiiMaskingLevel,
          allowedFormats: formats
        });
      }

      // For anonymous users, we can't fetch remaining directly since it's server-side fingerprinted
      // The actual limit check happens in the edge function
      if (currentUserId) {
        // Fetch remaining pages for authenticated users
        const { data: remainingData, error: remainingError } = await supabase
          .rpc('get_remaining_pages', { 
            p_user_id: currentUserId,
            p_session_fingerprint: null
          });
        
        if (remainingError && import.meta.env.DEV) {
          console.error('Error fetching remaining pages:', remainingError);
        }

        const remaining = remainingData ?? 0;
        const isUnlimited = remaining === -1;
        
        // Calculate pages used
        let pagesUsed = 0;
        if (!isUnlimited && planData && planData.length > 0) {
          const limit = planData[0].daily_limit;
          if (limit !== null) {
            pagesUsed = limit - remaining;
          }
        }

        setUsage({
          pagesUsedToday: pagesUsed,
          pagesRemaining: remaining,
          dailyLimit: planData?.[0]?.daily_limit ?? null,
          monthlyLimit: planData?.[0]?.monthly_limit ?? null,
          isUnlimited
        });
      } else {
        // For anonymous users, show the limit info but don't try to fetch remaining
        // (server-side fingerprint is used for tracking)
        setUsage({
          pagesUsedToday: 0,
          pagesRemaining: planData?.[0]?.daily_limit ?? 1,
          dailyLimit: planData?.[0]?.daily_limit ?? 1,
          monthlyLimit: null,
          isUnlimited: false
        });
      }

      // Fetch lifetime spots remaining
      const { data: spotsData, error: spotsError } = await supabase
        .rpc('get_lifetime_spots_remaining');
      
      if (!spotsError && spotsData !== null) {
        setLifetimeSpotsRemaining(spotsData);
      }

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error in fetchPlanAndUsage:', error);
      }
    }
  }, []);

  const refreshUsage = useCallback(async () => {
    await fetchPlanAndUsage(userId);
  }, [userId, fetchPlanAndUsage]);

  const incrementUsage = useCallback(async (pages: number): Promise<boolean> => {
    try {
      // Call edge function to increment usage
      // Server generates fingerprint for anonymous users from IP
      const { data, error } = await supabase.functions.invoke('track-usage', {
        body: { pages }
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error incrementing usage:', error);
        }
        return false;
      }

      if (data?.success) {
        await refreshUsage();
        return true;
      }

      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error in incrementUsage:', error);
      }
      return false;
    }
  }, [refreshUsage]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id ?? null;
      
      setUserId(currentUserId);
      setIsAuthenticated(!!currentUserId);
      
      await fetchPlanAndUsage(currentUserId);
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);
      setIsAuthenticated(!!currentUserId);
      await fetchPlanAndUsage(currentUserId);
    });

    return () => subscription.unsubscribe();
  }, [fetchPlanAndUsage]);

  const canProcess = usage?.isUnlimited || (usage?.pagesRemaining ?? 0) > 0;
  const canUsePiiMasking = plan?.piiMasking === 'optional' || plan?.piiMasking === 'enforced';
  const isPiiMaskingEnforced = plan?.piiMasking === 'enforced';
  
  // Batch upload is available for Pro, Business, and Lifetime plans
  const canBatchUpload = ['pro', 'business', 'lifetime'].includes(plan?.planName ?? '');
  const maxBatchFiles = plan?.planName ? BATCH_LIMITS[plan.planName] : 1;
  
  // Allowed export formats based on plan
  const allowedFormats: ExportFormat[] = plan?.allowedFormats ?? ['xlsx'];

  return {
    plan,
    usage,
    lifetimeSpotsRemaining,
    isLoading,
    isAuthenticated,
    userId,
    canProcess,
    canUsePiiMasking,
    isPiiMaskingEnforced,
    canBatchUpload,
    maxBatchFiles,
    allowedFormats,
    refreshUsage,
    incrementUsage
  };
}

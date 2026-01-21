import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PlanType = 'anonymous' | 'registered_free' | 'pro' | 'business' | 'lifetime';
export type PiiMaskingLevel = 'none' | 'optional' | 'enforced';

export interface UserPlan {
  planName: PlanType;
  displayName: string;
  dailyLimit: number | null; // null = unlimited
  piiMasking: PiiMaskingLevel;
}

export interface UsageInfo {
  pagesUsedToday: number;
  pagesRemaining: number; // -1 = unlimited
  dailyLimit: number | null;
  isUnlimited: boolean;
}

interface UseUsageReturn {
  plan: UserPlan | null;
  usage: UsageInfo | null;
  lifetimeSpotsRemaining: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  sessionFingerprint: string;
  canProcess: boolean;
  canUsePiiMasking: boolean;
  isPiiMaskingEnforced: boolean;
  refreshUsage: () => Promise<void>;
  incrementUsage: (pages: number) => Promise<boolean>;
}

// Generate a stable session fingerprint for anonymous users
function getSessionFingerprint(): string {
  const storageKey = 'bs_session_fp';
  let fingerprint = localStorage.getItem(storageKey);
  
  if (!fingerprint) {
    // Generate a cryptographically random fingerprint
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    fingerprint = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(storageKey, fingerprint);
  }
  
  return fingerprint;
}

export function useUsage(): UseUsageReturn {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [lifetimeSpotsRemaining, setLifetimeSpotsRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const sessionFingerprint = getSessionFingerprint();

  const fetchPlanAndUsage = useCallback(async (currentUserId: string | null) => {
    try {
      // Fetch user's plan
      const { data: planData, error: planError } = await supabase
        .rpc('get_user_plan', { p_user_id: currentUserId });
      
      if (planError) {
        console.error('Error fetching plan:', planError);
        // Default to anonymous plan
        setPlan({
          planName: 'anonymous',
          displayName: 'Anonymous',
          dailyLimit: 1,
          piiMasking: 'none'
        });
      } else if (planData && planData.length > 0) {
        const p = planData[0];
        setPlan({
          planName: p.plan_name as PlanType,
          displayName: p.display_name,
          dailyLimit: p.daily_limit,
          piiMasking: p.pii_masking as PiiMaskingLevel
        });
      }

      // Fetch remaining pages
      const { data: remainingData, error: remainingError } = await supabase
        .rpc('get_remaining_pages', { 
          p_user_id: currentUserId,
          p_session_fingerprint: currentUserId ? null : sessionFingerprint
        });
      
      if (remainingError) {
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
        isUnlimited
      });

      // Fetch lifetime spots remaining
      const { data: spotsData, error: spotsError } = await supabase
        .rpc('get_lifetime_spots_remaining');
      
      if (!spotsError && spotsData !== null) {
        setLifetimeSpotsRemaining(spotsData);
      }

    } catch (error) {
      console.error('Error in fetchPlanAndUsage:', error);
    }
  }, [sessionFingerprint]);

  const refreshUsage = useCallback(async () => {
    await fetchPlanAndUsage(userId);
  }, [userId, fetchPlanAndUsage]);

  const incrementUsage = useCallback(async (pages: number): Promise<boolean> => {
    try {
      // Call edge function to increment usage
      const { data, error } = await supabase.functions.invoke('track-usage', {
        body: {
          pages,
          sessionFingerprint: userId ? null : sessionFingerprint
        }
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      if (data?.success) {
        await refreshUsage();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  }, [userId, sessionFingerprint, refreshUsage]);

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

  return {
    plan,
    usage,
    lifetimeSpotsRemaining,
    isLoading,
    isAuthenticated,
    userId,
    sessionFingerprint,
    canProcess,
    canUsePiiMasking,
    isPiiMaskingEnforced,
    refreshUsage,
    incrementUsage
  };
}

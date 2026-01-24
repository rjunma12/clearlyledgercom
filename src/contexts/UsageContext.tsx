import { createContext, useContext, ReactNode } from 'react';
import { useUsage, type PlanType, type PiiMaskingLevel, type UserPlan, type UsageInfo } from '@/hooks/use-usage';

/**
 * UsageContext provides centralized usage data to avoid duplicate API calls.
 * This prevents multiple components from calling get_user_plan simultaneously.
 */

interface UsageContextValue {
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
  refreshUsage: () => Promise<void>;
  incrementUsage: (pages: number) => Promise<boolean>;
}

// Default values for when context is not available
const defaultValue: UsageContextValue = {
  plan: null,
  usage: null,
  lifetimeSpotsRemaining: null,
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  canProcess: false,
  canUsePiiMasking: false,
  isPiiMaskingEnforced: false,
  canBatchUpload: false,
  maxBatchFiles: 1,
  refreshUsage: async () => {},
  incrementUsage: async () => false,
};

const UsageContext = createContext<UsageContextValue>(defaultValue);

interface UsageProviderProps {
  children: ReactNode;
}

/**
 * UsageProvider wraps the app and provides cached usage data to all components.
 * This eliminates duplicate API calls from Navbar, PricingSection, etc.
 */
export function UsageProvider({ children }: UsageProviderProps) {
  const usageData = useUsage();

  return (
    <UsageContext.Provider value={usageData}>
      {children}
    </UsageContext.Provider>
  );
}

/**
 * useUsageContext hook to access cached usage data.
 * Use this instead of useUsage() in components to prevent duplicate API calls.
 */
export function useUsageContext(): UsageContextValue {
  return useContext(UsageContext);
}

// Re-export types for convenience
export type { PlanType, PiiMaskingLevel, UserPlan, UsageInfo };

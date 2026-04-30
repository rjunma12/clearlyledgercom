import { useState } from "react";
import { toast } from "sonner";

interface UseSubscriptionManagementReturn {
  isLoading: boolean;
  cancelSubscription: () => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
}

/**
 * Hook for managing subscription lifecycle.
 *
 * NOTE: The legacy provider integration has been removed. Paddle Billing's
 * customer portal will replace these methods in a follow-up step. Until then
 * this hook keeps its public signature so consumers continue to compile, but
 * every action surfaces a "coming soon" toast and resolves to false.
 */
export function useSubscriptionManagement(): UseSubscriptionManagementReturn {
  const [isLoading, setIsLoading] = useState(false);

  const notReady = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      toast.info('Subscription management is being upgraded. Please check back shortly.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    cancelSubscription: notReady,
    reactivateSubscription: notReady,
  };
}

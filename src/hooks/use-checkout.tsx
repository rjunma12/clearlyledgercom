import { useState } from "react";
import { toast } from "sonner";

export type PlanName =
  | 'starter' | 'starter_annual'
  | 'pro' | 'pro_annual'
  | 'business' | 'business_annual';

interface UseCheckoutReturn {
  isLoading: boolean;
  loadingPlan: PlanName | null;
  initiateCheckout: (planName: PlanName) => Promise<void>;
}

/**
 * Hook for initiating payment checkout.
 *
 * NOTE: The legacy payment provider integration has been removed. Paddle
 * Billing will be wired up in a follow-up step. Until then this hook keeps
 * its public signature so consumers (PricingSection, PricingCard, etc.)
 * continue to compile, but every call surfaces a "coming soon" toast.
 */
export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanName | null>(null);

  const initiateCheckout = async (planName: PlanName) => {
    setIsLoading(true);
    setLoadingPlan(planName);
    try {
      toast.info('Checkout is being upgraded. Please check back shortly.');
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return { isLoading, loadingPlan, initiateCheckout };
}

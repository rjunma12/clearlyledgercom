import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";

export type PlanName =
  | 'starter' | 'starter_annual'
  | 'pro' | 'pro_annual'
  | 'business' | 'business_annual';

interface UseCheckoutReturn {
  isLoading: boolean;
  loadingPlan: PlanName | null;
  initiateCheckout: (planName: PlanName) => Promise<void>;
}

// Map app plan keys → Paddle external price IDs
const PLAN_TO_PADDLE_PRICE: Record<PlanName, string> = {
  starter: 'starter_monthly',
  starter_annual: 'starter_annual',
  pro: 'pro_monthly',
  pro_annual: 'pro_annual',
  business: 'business_monthly',
  business_annual: 'business_annual',
};

export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanName | null>(null);

  const initiateCheckout = async (planName: PlanName) => {
    setIsLoading(true);
    setLoadingPlan(planName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to subscribe.');
        window.location.href = '/login';
        return;
      }

      const paddlePriceExternalId = PLAN_TO_PADDLE_PRICE[planName];
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(paddlePriceExternalId);

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: { email: session.user.email },
        customData: {
          userId: session.user.id,
          planKey: planName,
        },
        settings: {
          displayMode: 'overlay',
          successUrl: `${window.location.origin}/upgrade/success?plan=${planName}`,
          allowLogout: false,
          variant: 'one-page',
        },
      });
    } catch (e) {
      console.error('Checkout error:', e);
      toast.error('Could not open checkout. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return { isLoading, loadingPlan, initiateCheckout };
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PlanName = 'starter' | 'pro' | 'business' | 'lifetime';

interface UseCheckoutReturn {
  isLoading: boolean;
  loadingPlan: PlanName | null;
  initiateCheckout: (planName: PlanName) => Promise<void>;
}

export function useCheckout(): UseCheckoutReturn {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanName | null>(null);

  const initiateCheckout = async (planName: PlanName) => {
    setIsLoading(true);
    setLoadingPlan(planName);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login - redirect param is unused by Login component
        toast.info("Please log in to subscribe");
        navigate('/login');
        return;
      }

      // Call create-checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planName,
          successUrl: window.location.origin + '/checkout/success',
          cancelUrl: window.location.origin + '/pricing'
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        toast.error(error.message || 'Failed to create checkout session');
        return;
      }

      if (data?.checkoutUrl) {
        // Redirect to Dodo hosted checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Failed to get checkout URL');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return {
    isLoading,
    loadingPlan,
    initiateCheckout
  };
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logError, ErrorTypes } from "@/lib/errorLogger";
import { PaymentErrorCode } from "@/lib/payments";

export type PlanName = 
  | 'starter' | 'starter_annual'
  | 'pro' | 'pro_annual'
  | 'business' | 'business_annual'
  | 'lifetime';

interface UseCheckoutReturn {
  isLoading: boolean;
  loadingPlan: PlanName | null;
  initiateCheckout: (planName: PlanName) => Promise<void>;
}

/**
 * Hook for initiating payment checkout
 * 
 * This hook provides a provider-agnostic interface for starting the checkout process.
 * When a payment provider is configured, it will create a checkout session and
 * redirect the user to the payment page.
 */
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
        toast.info("Please log in to subscribe");
        navigate('/login');
        return;
      }

      // Call create-checkout-session edge function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planName,
          successUrl: window.location.origin + '/checkout/success',
          cancelUrl: window.location.origin + '/pricing'
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        
        // Check for specific error codes
        if (data?.code === PaymentErrorCode.PROVIDER_NOT_CONFIGURED || 
            error.message?.includes('not configured')) {
          toast.error('Payment system is being set up. Please try again later.');
        } else {
          toast.error(error.message || 'Failed to start checkout. Please try again.');
        }
        
        logError({
          errorType: ErrorTypes.CHECKOUT,
          errorMessage: error.message || 'Failed to create checkout session',
          component: 'useCheckout',
          action: 'createCheckout',
          metadata: { planName, errorCode: data?.code }
        });
        return;
      }

      if (data?.checkoutUrl) {
        // Redirect to payment provider's checkout
        window.location.href = data.checkoutUrl;
      } else if (data?.code === 'PAYMENT_PROVIDER_NOT_CONFIGURED') {
        toast.error('Payment system is being set up. Please try again later.');
        logError({
          errorType: ErrorTypes.CHECKOUT,
          errorMessage: 'Payment provider not configured',
          component: 'useCheckout',
          action: 'createCheckout',
          metadata: { planName }
        });
      } else {
        toast.error('Failed to start checkout. Please try again.');
        logError({
          errorType: ErrorTypes.CHECKOUT,
          errorMessage: 'Failed to get checkout URL',
          component: 'useCheckout',
          action: 'createCheckout',
          metadata: { planName, responseData: data }
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      logError({
        errorType: ErrorTypes.CHECKOUT,
        errorMessage: error instanceof Error ? error.message : 'Unknown checkout error',
        component: 'useCheckout',
        action: 'createCheckout',
        metadata: { planName }
      });
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

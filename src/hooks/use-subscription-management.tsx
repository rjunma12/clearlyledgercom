import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logError, ErrorTypes } from "@/lib/errorLogger";

interface UseSubscriptionManagementReturn {
  isLoading: boolean;
  cancelSubscription: () => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
}

export function useSubscriptionManagement(): UseSubscriptionManagementReturn {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const cancelSubscription = async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        logError({
          errorType: ErrorTypes.SUBSCRIPTION,
          errorMessage: 'User not authenticated for subscription cancellation',
          component: 'useSubscriptionManagement',
          action: 'cancel'
        });
        navigate('/login');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'cancel' }
      });

      if (error) {
        console.error('Cancel error:', error);
        toast.error(error.message || 'Failed to cancel subscription');
        logError({
          errorType: ErrorTypes.SUBSCRIPTION,
          errorMessage: error.message || 'Failed to cancel subscription',
          component: 'useSubscriptionManagement',
          action: 'cancel'
        });
        return false;
      }

      if (data?.success) {
        toast.success(data.message || 'Subscription cancelled');
        return true;
      } else {
        toast.error(data?.error || 'Failed to cancel subscription');
        logError({
          errorType: ErrorTypes.SUBSCRIPTION,
          errorMessage: data?.error || 'Failed to cancel subscription',
          component: 'useSubscriptionManagement',
          action: 'cancel',
          metadata: { responseData: data }
        });
        return false;
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel subscription. Please try again.');
      logError({
        errorType: ErrorTypes.SUBSCRIPTION,
        errorMessage: error instanceof Error ? error.message : 'Unknown cancel error',
        component: 'useSubscriptionManagement',
        action: 'cancel'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reactivateSubscription = async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        logError({
          errorType: ErrorTypes.SUBSCRIPTION,
          errorMessage: 'User not authenticated for subscription reactivation',
          component: 'useSubscriptionManagement',
          action: 'reactivate'
        });
        navigate('/login');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'reactivate' }
      });

      if (error) {
        console.error('Reactivate error:', error);
        logError({
          errorType: ErrorTypes.SUBSCRIPTION,
          errorMessage: error.message || 'Failed to reactivate subscription',
          component: 'useSubscriptionManagement',
          action: 'reactivate'
        });
        return false;
      }

      if (data?.success) {
        toast.success(data.message || 'Subscription reactivated');
        return true;
      } else {
        logError({
          errorType: ErrorTypes.SUBSCRIPTION,
          errorMessage: data?.error || 'Failed to reactivate subscription',
          component: 'useSubscriptionManagement',
          action: 'reactivate',
          metadata: { responseData: data }
        });
        return false;
      }
    } catch (error) {
      console.error('Reactivate error:', error);
      logError({
        errorType: ErrorTypes.SUBSCRIPTION,
        errorMessage: error instanceof Error ? error.message : 'Unknown reactivate error',
        component: 'useSubscriptionManagement',
        action: 'reactivate'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    cancelSubscription,
    reactivateSubscription
  };
}
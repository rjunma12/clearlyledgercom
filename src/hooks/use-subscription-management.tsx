import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        toast.error("Please log in to manage your subscription");
        navigate('/login');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'cancel' }
      });

      if (error) {
        console.error('Cancel error:', error);
        toast.error(error.message || 'Failed to cancel subscription');
        return false;
      }

      if (data?.success) {
        toast.success(data.message || 'Subscription cancelled');
        return true;
      } else {
        toast.error(data?.error || 'Failed to cancel subscription');
        return false;
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('An error occurred. Please try again.');
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
        toast.error("Please log in to manage your subscription");
        navigate('/login');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'reactivate' }
      });

      if (error) {
        console.error('Reactivate error:', error);
        toast.error(error.message || 'Failed to reactivate subscription');
        return false;
      }

      if (data?.success) {
        toast.success(data.message || 'Subscription reactivated');
        return true;
      } else {
        toast.error(data?.error || 'Failed to reactivate subscription');
        return false;
      }
    } catch (error) {
      console.error('Reactivate error:', error);
      toast.error('An error occurred. Please try again.');
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

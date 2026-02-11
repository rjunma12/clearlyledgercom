import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, Calendar, AlertTriangle, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { useSubscriptionManagement } from "@/hooks/use-subscription-management";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type PlanType = 'anonymous' | 'registered_free' | 'starter' | 'pro' | 'business';

interface PlanDetails {
  name: string;
  display_name: string;
  price_cents: number;
  is_recurring: boolean;
}

interface SubscriptionRow {
  status: string;
  expires_at: string | null;
  cancel_at_period_end: boolean | null;
  plans: PlanDetails | null;
}

interface SubscriptionData {
  planName: PlanType;
  displayName: string;
  status: string;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  priceCents: number;
  isRecurring: boolean;
}

const planPriceDisplay: Record<string, string> = {
  starter: '$15/month',
  pro: '$30/month',
  business: '$50/month',
};

export function SubscriptionCard() {
  const navigate = useNavigate();
  const { isLoading: actionLoading, cancelSubscription, reactivateSubscription } = useSubscriptionManagement();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      // Get active subscription with plan details (using sanitized view that hides payment provider IDs)
      const { data, error } = await supabase
        .from('user_subscriptions_public' as any)
        .select(`
          status,
          expires_at,
          cancel_at_period_end,
          plans (
            name,
            display_name,
            price_cents,
            is_recurring
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() as { data: SubscriptionRow | null; error: any };

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else if (data && data.plans) {
        setSubscription({
          planName: data.plans.name as PlanType,
          displayName: data.plans.display_name,
          status: data.status,
          expiresAt: data.expires_at,
          cancelAtPeriodEnd: data.cancel_at_period_end || false,
          priceCents: data.plans.price_cents,
          isRecurring: data.plans.is_recurring,
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isPaidPlan = subscription && ['starter', 'pro', 'business'].includes(subscription.planName);
  const isCancelling = subscription?.cancelAtPeriodEnd;

  const handleCancel = async () => {
    const success = await cancelSubscription();
    if (success) {
      setShowCancelDialog(false);
      fetchSubscription();
    }
  };

  const handleReactivate = async () => {
    const success = await reactivateSubscription();
    if (success) {
      fetchSubscription();
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No subscription or free plan
  if (!subscription || !isPaidPlan) {
    return (
      <Card className="border-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You're on the free plan. Upgrade to unlock more features and higher limits.
          </p>
          <Button onClick={handleUpgrade} className="w-full">
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn(
        "border-muted/30",
        isCancelling && "border-warning/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Subscription
            </CardTitle>
            <Badge variant={isCancelling ? "outline" : "default"} className={cn(
              isCancelling && "border-warning text-warning"
            )}>
              {isCancelling ? 'Cancelling' : subscription.status === 'active' ? 'Active' : subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Details */}
          <div className="flex items-center justify-between py-2 border-b border-muted/20">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium text-foreground">{subscription.displayName}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-muted/20">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="text-sm font-medium text-foreground">
              {planPriceDisplay[subscription.planName] || `$${(subscription.priceCents / 100).toFixed(2)}`}
            </span>
          </div>

          {subscription.isRecurring && subscription.expiresAt && (
            <div className="flex items-center justify-between py-2 border-b border-muted/20">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {isCancelling ? 'Access until' : 'Next billing'}
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatDate(subscription.expiresAt)}
              </span>
            </div>
          )}

          {/* Cancelling warning */}
          {isCancelling && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-warning">Subscription ending</p>
                <p className="text-muted-foreground">
                  Your subscription will end on {formatDate(subscription.expiresAt)}. 
                  You can reactivate anytime before then.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {isCancelling ? (
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleReactivate}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reactivate Subscription
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleUpgrade}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Change Plan
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={actionLoading}
                >
                  Cancel Subscription
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until {formatDate(subscription.expiresAt)}. 
              After that, you'll be downgraded to the free plan with limited features.
              <br /><br />
              You can reactivate anytime before your subscription ends.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

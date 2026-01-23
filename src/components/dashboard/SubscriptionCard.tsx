import { useState } from "react";
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

type PlanType = 'anonymous' | 'registered_free' | 'starter' | 'pro' | 'business' | 'lifetime';

interface SubscriptionCardProps {
  planName: PlanType;
  displayName: string;
  status: string;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  priceCents: number;
  isRecurring: boolean;
  onRefresh?: () => void;
}

const planPriceDisplay: Record<string, string> = {
  starter: '$15/month',
  pro: '$30/month',
  business: '$50/month',
  lifetime: '$119 one-time',
};

export function SubscriptionCard({
  planName,
  displayName,
  status,
  expiresAt,
  cancelAtPeriodEnd,
  cancelledAt,
  priceCents,
  isRecurring,
  onRefresh
}: SubscriptionCardProps) {
  const navigate = useNavigate();
  const { isLoading, cancelSubscription, reactivateSubscription } = useSubscriptionManagement();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isPaidPlan = ['starter', 'pro', 'business', 'lifetime'].includes(planName);
  const isLifetime = planName === 'lifetime';
  const isCancelling = cancelAtPeriodEnd && !isLifetime;

  const handleCancel = async () => {
    const success = await cancelSubscription();
    if (success) {
      setShowCancelDialog(false);
      onRefresh?.();
    }
  };

  const handleReactivate = async () => {
    const success = await reactivateSubscription();
    if (success) {
      onRefresh?.();
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

  // Don't show card for free plans
  if (!isPaidPlan) {
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
              {isCancelling ? 'Cancelling' : status === 'active' ? 'Active' : status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Details */}
          <div className="flex items-center justify-between py-2 border-b border-muted/20">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium text-foreground">{displayName}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-muted/20">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="text-sm font-medium text-foreground">
              {planPriceDisplay[planName] || `$${(priceCents / 100).toFixed(2)}`}
            </span>
          </div>

          {isRecurring && expiresAt && (
            <div className="flex items-center justify-between py-2 border-b border-muted/20">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {isCancelling ? 'Access until' : 'Next billing'}
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatDate(expiresAt)}
              </span>
            </div>
          )}

          {isLifetime && (
            <div className="flex items-center justify-between py-2 border-b border-muted/20">
              <span className="text-sm text-muted-foreground">Access</span>
              <span className="text-sm font-medium text-primary">Lifetime</span>
            </div>
          )}

          {/* Cancelling warning */}
          {isCancelling && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-warning">Subscription ending</p>
                <p className="text-muted-foreground">
                  Your subscription will end on {formatDate(expiresAt)}. 
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
                disabled={isLoading}
              >
                {isLoading ? (
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
            ) : !isLifetime && (
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
                  disabled={isLoading}
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
              Your subscription will remain active until {formatDate(expiresAt)}. 
              After that, you'll be downgraded to the free plan with limited features.
              <br /><br />
              You can reactivate anytime before your subscription ends.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
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

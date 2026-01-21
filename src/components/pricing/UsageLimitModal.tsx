import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, Users, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UsageLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  pagesUsed: number;
  dailyLimit: number;
}

export function UsageLimitModal({
  open,
  onOpenChange,
  planName,
  pagesUsed,
  dailyLimit
}: UsageLimitModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = (plan: string) => {
    onOpenChange(false);
    // Navigate to pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <DialogTitle className="text-xl">Daily Limit Reached</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            You've used all {dailyLimit} page{dailyLimit > 1 ? 's' : ''} for today on the {planName} plan.
            Upgrade to continue processing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Pro option */}
          <div className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Pro Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Unlimited pages • $19/month
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleUpgrade('pro')}>
                Upgrade
              </Button>
            </div>
          </div>

          {/* Business option - highlighted */}
          <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5 relative">
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded">
              Recommended
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Business Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Unlimited pages + PII Masking + Team Access • $49/month
                  </p>
                </div>
              </div>
              <Button variant="hero" size="sm" onClick={() => handleUpgrade('business')}>
                Upgrade
              </Button>
            </div>
          </div>

          {/* Lifetime option */}
          <div className="p-4 rounded-lg border border-warning/30 bg-warning/5 hover:border-warning/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Lifetime Deal</h4>
                  <p className="text-sm text-muted-foreground">
                    One-time $119 • Limited spots available
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-warning/30 hover:border-warning/50"
                onClick={() => handleUpgrade('lifetime')}
              >
                Get Access
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Your limit resets in 24 hours. Upgrade anytime for unlimited access.
        </p>
      </DialogContent>
    </Dialog>
  );
}

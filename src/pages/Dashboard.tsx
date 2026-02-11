import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FileText, 
  FileSpreadsheet, 
  ArrowRight,
  ArrowLeft,
  History,
  BarChart3,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsage } from "@/hooks/use-usage";
import { useProcessingHistory } from "@/hooks/use-processing-history";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { HistoryTable } from "@/components/dashboard/HistoryTable";
import { EmailPreferencesCard } from "@/components/dashboard/EmailPreferencesCard";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { BatchProcessingSection } from "@/components/dashboard/BatchProcessingSection";

export default function Dashboard() {
  const navigate = useNavigate();
  const { plan, usage, isLoading: usageLoading, isAuthenticated } = useUsage();
  const { history, stats, isLoading: historyLoading } = useProcessingHistory();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!usageLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [usageLoading, isAuthenticated, navigate]);

  if (usageLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Your processing overview</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="hero" size="sm" className="gap-2">
              Process Files
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Files Processed"
            value={stats?.totalFilesProcessed ?? 0}
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Total Pages"
            value={stats?.totalPagesProcessed ?? 0}
            icon={FileSpreadsheet}
          />
          <StatCard
            title="Transactions Extracted"
            value={stats?.totalTransactionsExtracted?.toLocaleString() ?? 0}
            icon={BarChart3}
          />
          <StatCard
            title="This Month"
            value={stats?.filesThisMonth ?? 0}
            subtitle={`${stats?.pagesThisMonth ?? 0} pages`}
            icon={Calendar}
          />
        </div>

        {/* Plan + Batch Processing + History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Plan & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {plan && usage && (
              <PlanCard
                planName={plan.planName}
                displayName={plan.displayName}
                dailyLimit={plan.dailyLimit}
                monthlyLimit={plan.monthlyLimit}
                piiMasking={plan.piiMasking}
                pagesUsedToday={usage.pagesUsedToday}
                isUnlimited={usage.isUnlimited}
              />
            )}
            
            {/* Subscription Management */}
            <SubscriptionCard />
            
            {/* Email Preferences */}
            <EmailPreferencesCard />
          </div>

          {/* Right Column - Batch Processing & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Batch Processing Section */}
            <BatchProcessingSection />

            {/* Processing History */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Processing History
                  </h2>
                </div>
                {history.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Last 50 files
                  </span>
                )}
              </div>
              <HistoryTable items={history} isLoading={historyLoading} />
            </div>
          </div>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {plan && !['pro', 'pro_annual', 'business', 'business_annual'].includes(plan.planName) && (
          <div className="mt-8 glass-card p-6 gradient-border">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    Unlock Unlimited Processing
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Upgrade to Pro or Business to remove daily limits, enable PII masking, 
                    and get priority processing for your bank statements.
                  </p>
                </div>
              </div>
              <Link to="/pricing">
                <Button variant="hero" className="flex-shrink-0">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

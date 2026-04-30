import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Status = "polling" | "success" | "timeout";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30_000;

const PLAN_DISPLAY: Record<string, string> = {
  starter: "Starter",
  starter_annual: "Starter (Annual)",
  pro: "Professional",
  pro_annual: "Professional (Annual)",
  business: "Business",
  business_annual: "Business (Annual)",
};

// A subscription row "matches" if its plan name equals the expected key,
// or shares the same tier (monthly/annual variant of the same product).
function matchesExpectedPlan(planName: string, expectedKey: string): boolean {
  if (!expectedKey) return true; // no expectation passed — accept any paid plan
  if (planName === expectedKey) return true;
  return planName.replace(/_annual$/, "") === expectedKey.replace(/_annual$/, "");
}

const UpgradeSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("polling");
  const [activePlanName, setActivePlanName] = useState<string | null>(null);
  const stoppedRef = useRef(false);

  const expectedPlanKey = searchParams.get("plan") || "";

  useEffect(() => {
    const startedAt = Date.now();
    let timer: number | undefined;

    const stop = () => {
      stoppedRef.current = true;
      if (timer) window.clearTimeout(timer);
    };

    const tick = async () => {
      if (stoppedRef.current) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        // Look for the most recent active subscription for this user.
        // Webhook (Railway) writes the row after Paddle confirms payment.
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("status, plans:plan_id (name)")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const planName = (data as { plans: { name: string } | null }).plans?.name;
          if (planName && matchesExpectedPlan(planName, expectedPlanKey)) {
            setActivePlanName(planName);
            setStatus("success");
            stop();
            // Show toast and redirect to dashboard after a short pause so the
            // user sees the confirmation state.
            toast.success("Subscription active. Welcome aboard!");
            window.setTimeout(() => navigate("/dashboard"), 1500);
            return;
          }
        }
      } catch (err) {
        // Silent — we'll just retry on the next tick.
        if (import.meta.env.DEV) console.error("Subscription poll error:", err);
      }

      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        setStatus("timeout");
        stop();
        return;
      }
      timer = window.setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedPlanKey]);

  const planLabel =
    PLAN_DISPLAY[activePlanName ?? expectedPlanKey] ||
    expectedPlanKey ||
    "your new plan";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Confirming your subscription · ClearlyLedger</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          {status === "polling" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h1 className="mt-6 text-2xl font-semibold">Confirming your subscription…</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We're activating <span className="font-medium">{planLabel}</span>. This usually takes a few seconds.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h1 className="mt-6 text-2xl font-semibold">You're on {planLabel}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your plan is active. Redirecting you to your dashboard…
              </p>
              <Button asChild className="mt-6 w-full">
                <Link to="/dashboard">
                  Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          {status === "timeout" && (
            <>
              <Clock className="mx-auto h-12 w-12 text-amber-500" />
              <h1 className="mt-6 text-2xl font-semibold">Payment received</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your payment was received. It may take a moment to reflect — refresh the page in a minute.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Refresh
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard">Go to dashboard</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpgradeSuccess;

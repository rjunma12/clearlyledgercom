import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Status = "polling" | "success" | "timeout" | "error";

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

const PAID_PLANS = new Set(["starter", "pro", "business"]);

const UpgradeSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("polling");
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const stoppedRef = useRef(false);

  const expectedPlanKey = searchParams.get("plan") || "";

  useEffect(() => {
    const railwayUrl = import.meta.env.VITE_RAILWAY_API_URL as string | undefined;
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

        if (!railwayUrl) {
          // No backend URL configured — show timeout copy immediately.
          setStatus("timeout");
          stop();
          return;
        }

        const url = `${railwayUrl.replace(/\/$/, "")}/usage/${session.user.id}`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          const json = await res.json();
          // Accept either { plan } or { plan_key } from Railway
          const plan: string | undefined = json?.plan ?? json?.plan_key;
          if (plan) setCurrentPlan(plan);

          const isUpgraded = plan && (
            plan === expectedPlanKey ||
            // Tolerate annual/monthly variants of same tier
            plan.replace(/_annual$/, "") === expectedPlanKey.replace(/_annual$/, "") &&
              PAID_PLANS.has(plan.replace(/_annual$/, ""))
          );

          if (isUpgraded) {
            setStatus("success");
            stop();
            return;
          }
        }
      } catch (err) {
        console.error("Subscription poll error:", err);
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

  const planLabel = PLAN_DISPLAY[expectedPlanKey] || expectedPlanKey || "your new plan";

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
                Your plan is active{currentPlan ? ` (${currentPlan})` : ""}. Enjoy the new limits.
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

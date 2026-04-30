import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUPPORT_EMAIL = "helppropsal@outlook.com";

const RefundPolicy = () => {
  const lastUpdated = "April 30, 2026";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Refund Policy - ClearlyLedger",
    url: "https://clearlyledger.com/refund-policy",
    description:
      "ClearlyLedger refund policy. 14-day money-back guarantee on all paid plans. Refunds processed by Paddle, our Merchant of Record.",
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Refund Policy - ClearlyLedger</title>
        <meta
          name="description"
          content="ClearlyLedger refund policy. 14-day money-back guarantee on all paid plans. Refunds are handled by Paddle, our Merchant of Record."
        />
        <link rel="canonical" href="https://clearlyledger.com/refund-policy" />
        <meta property="og:title" content="Refund Policy - ClearlyLedger" />
        <meta
          property="og:description"
          content="14-day money-back guarantee. Refunds processed by Paddle, our Merchant of Record."
        />
        <meta property="og:url" content="https://clearlyledger.com/refund-policy" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Refund Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-10">
          ClearlyLedger is operated by <strong className="text-foreground">Akshit Malik</strong>, sole proprietor
          (India). Our online reseller and Merchant of Record is{" "}
          <a href="https://www.paddle.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Paddle.com
          </a>
          . Paddle handles all customer service inquiries relating to payments and refunds on our behalf.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. 14-Day Money-Back Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              We offer a <strong className="text-foreground">14-day money-back guarantee</strong> on all paid
              subscriptions (Starter, Professional and Business — monthly and annual). If you are not satisfied with
              your purchase, you can request a full refund within 14 days of your initial order date for that
              subscription, no questions asked.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Refunds are processed by Paddle, our Merchant of Record. There are two equally valid ways to request a
              refund:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                Visit{" "}
                <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  paddle.net
                </a>
                , locate the order using the email address you used at checkout, and submit a refund request directly
                to Paddle.
              </li>
              <li>
                Email us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>{" "}
                with your order email and the reason for the request. We will forward eligible requests to Paddle on
                your behalf within 1 business day.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Approved refunds are returned to the original payment method. Processing time depends on your bank or
              card issuer (typically 5–10 business days).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Renewals and Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Subscriptions auto-renew at the end of each billing period. You can cancel at any time from the Manage
              Subscription portal — your access continues until the end of the period you have already paid for, and
              no further charges are made. Cancellation alone does not trigger a refund of the current period; if you
              want a refund of the most recent renewal, please contact us within 14 days of that renewal date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Paddle's Refund Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              In addition to the policy above, all purchases are also subject to Paddle's own{" "}
              <a
                href="https://www.paddle.com/legal/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Refund Policy
              </a>{" "}
              and{" "}
              <a
                href="https://www.paddle.com/legal/checkout-buyer-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Buyer Terms
              </a>
              , which give buyers additional rights in certain jurisdictions (including statutory consumer rights in
              the EU/UK). Where Paddle's policy is more favorable to you, that policy applies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about this policy? Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              . We respond within 24–48 hours on business days.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;

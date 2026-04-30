import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUPPORT_EMAIL = "helppropsal@outlook.com";

const TermsOfService = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service - ClearlyLedger",
    description:
      "Terms of service for ClearlyLedger, the global bank statement to Excel/CSV converter. Subscription, usage, and liability terms.",
    url: "https://clearlyledger.com/terms",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://clearlyledger.com/" },
        { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://clearlyledger.com/terms" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service - ClearlyLedger</title>
        <meta
          name="description"
          content="ClearlyLedger terms of service. Global bank statement to Excel/CSV converter. Subscription, acceptable use, and liability terms."
        />
        <link rel="canonical" href="https://clearlyledger.com/terms" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/terms" />
        <meta property="og:title" content="Terms of Service - ClearlyLedger" />
        <meta
          property="og:description"
          content="ClearlyLedger terms of service. Global bank statement converter for accountants worldwide."
        />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-6">
          ClearlyLedger ("the Service") is operated by <strong className="text-foreground">Akshit Malik</strong>,
          a sole proprietor based in India ("we", "us", "our"). By accessing or using the Service you agree to
          these Terms of Service. If you are using the Service on behalf of a company or accounting firm, you
          represent that you have authority to bind that organization and you agree to these terms on its behalf.
        </p>

        {/* Paddle MoR disclosure — required by Paddle seller policy */}
        <div className="mb-10 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Reseller / Merchant of Record.</strong> Our order process is
          conducted by our online reseller <a href="https://www.paddle.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paddle.com</a>.
          Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries
          and handles returns. By completing a purchase you also agree to Paddle's{" "}
          <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Buyer Terms</a>.
        </div>


        <div className="space-y-10">
          {/* 1. The Service */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. The Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ClearlyLedger converts bank statement PDFs into structured Excel and CSV files. Supported for banks
              worldwide. Provided on an "as-is" basis. We target high accuracy but cannot guarantee 100% accuracy
              across all bank formats globally.
            </p>
          </section>

          {/* 2. Your Account */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Your Account</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be at least 18 years old (or the age of majority in your jurisdiction).</li>
              <li>You are responsible for keeping your login credentials secure.</li>
              <li>Provide accurate registration information.</li>
              <li>One account per person; account sharing is not permitted.</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>
          </section>

          {/* 3. Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You may use the Service only for lawful purposes. You may NOT:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                Upload statements you are not authorized to process (you must have the right, or your client's
                authorization, to process any statement).
              </li>
              <li>Attempt to reverse engineer, scrape, or copy the Service.</li>
              <li>Resell or sublicense access without written permission from us.</li>
              <li>Upload files containing malware, viruses, or harmful code.</li>
              <li>Use the Service to facilitate fraud, money laundering, or tax evasion.</li>
              <li>Circumvent any usage limits or access controls.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You are solely responsible for ensuring you have lawful authority to process any bank statements you
              upload, including compliance with applicable data protection laws in your jurisdiction.
            </p>
          </section>

          {/* 4. Subscription and Billing */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Subscription, Billing and Refunds</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Free Account:</strong> 6 pages / 24 hours, no payment required.
              </li>
              <li>
                <strong className="text-foreground">Starter:</strong> $15/month or $90/year — 400 pages/month.
              </li>
              <li>
                <strong className="text-foreground">Professional:</strong> $30/month or $180/year — 1,500 pages/month.
              </li>
              <li>
                <strong className="text-foreground">Business:</strong> $50/month or $300/year — 4,000 pages/month.
              </li>
              <li>
                All payments, billing, currency conversion, taxes (VAT/GST/sales tax) and invoicing are processed by
                Paddle as the Merchant of Record. Prices shown are inclusive of applicable taxes.
              </li>
              <li>Subscriptions auto-renew at the end of each billing period until canceled.</li>
              <li>You can cancel anytime from the Manage Subscription portal; access continues until the end of the paid period.</li>
              <li>
                Refunds are governed by our{" "}
                <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>{" "}
                and by Paddle's{" "}
                <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Refund Policy</a>.
                Refund requests are handled directly by Paddle at{" "}
                <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.net</a>.
              </li>
              <li>
                Prices may change with 30 days notice; existing subscribers retain their current rate until the next renewal.
              </li>
              <li>
                Detailed payment, billing and consumer-protection mechanics are also covered by Paddle's{" "}
                <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Buyer Terms</a>.
              </li>
            </ul>
          </section>


          {/* 5. Accuracy Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Accuracy Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service uses automated positional parsing combined with AI fallback. While we target 99%+ accuracy on
              supported banks, errors can occur — particularly with new or uncommon bank formats. You are responsible
              for verifying converted output before using it for accounting, tax, audit, or legal purposes.
              ClearlyLedger is not a substitute for professional accounting review. Every conversion shows a balance
              verification status (VERIFIED / DISCREPANCY / FAILED) — always check this before using the output.
            </p>
          </section>

          {/* 6. Data and Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Service is also governed by our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . Key points: your PDFs are deleted within 60 seconds of conversion; we never store transaction data;
              output files are deleted within 1 hour.
            </p>
          </section>

          {/* 7. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, its technology, design, and parsing engine are owned by ClearlyLedger. Your uploaded bank
              statements remain your property (or your clients' property). Output files generated from your uploads
              are yours to use freely.
            </p>
          </section>

          {/* 8. Availability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We target 99.5% uptime but do not guarantee uninterrupted availability. We are not liable for downtime
              caused by maintenance, infrastructure providers, or events outside our control.
            </p>
          </section>

          {/* 9. Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate accounts that violate these terms, with notice where practicable. You may
              delete your account at any time from Account Settings.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, ClearlyLedger's total liability for any claim is
              limited to the amount you paid us in the 12 months preceding the claim. We are not liable for indirect,
              consequential, special, or incidental damages.
            </p>
          </section>

          {/* 11. Dispute Resolution */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              We encourage you to contact us first at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              to resolve any dispute. If unresolved, disputes will be subject to binding arbitration in New Delhi,
              India, under the Indian Arbitration and Conciliation Act 1996, conducted in English. Nothing in this
              clause prevents either party from seeking emergency injunctive relief in any competent court.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of India, without regard to conflict of law principles, except
              where mandatory local law in your jurisdiction applies.
            </p>
          </section>

          {/* 13. Changes */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Changes</h2>
            <p className="text-muted-foreground leading-relaxed">
              We will notify you by email at least 14 days before material changes take effect. Continued use of the
              Service after changes constitutes acceptance.
            </p>
          </section>

          {/* 14. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">14. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;

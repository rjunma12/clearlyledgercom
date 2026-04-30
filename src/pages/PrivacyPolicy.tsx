import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUPPORT_EMAIL = "helppropsal@outlook.com";

const PrivacyPolicy = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy - ClearlyLedger",
    description:
      "How ClearlyLedger handles your data when converting bank statement PDFs into spreadsheets. GDPR, DPDPA 2023, PIPEDA, and CCPA aligned.",
    url: "https://clearlyledger.com/privacy",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://clearlyledger.com/" },
        { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://clearlyledger.com/privacy" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - ClearlyLedger</title>
        <meta
          name="description"
          content="ClearlyLedger privacy policy. We delete your bank statement PDFs within 60 seconds and never store transaction data. GDPR, DPDPA, PIPEDA, and CCPA aligned."
        />
        <link rel="canonical" href="https://clearlyledger.com/privacy" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/privacy" />
        <meta property="og:title" content="Privacy Policy - ClearlyLedger" />
        <meta
          property="og:description"
          content="How ClearlyLedger handles your data. PDFs deleted within 60 seconds. No transaction data stored."
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
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-10">
          ClearlyLedger ("we", "our", "us") explains here how we handle your data when you use our service to convert
          bank statement PDFs into structured spreadsheets. This policy is written to align with the EU GDPR, India's
          DPDPA 2023, Canada's PIPEDA, the UK GDPR, and the California CCPA.
        </p>

        <div className="space-y-10">
          {/* 1. Short version */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. The Short Version</h2>
            <p className="text-muted-foreground leading-relaxed">
              We delete your bank statement PDFs within 60 seconds of conversion. We never store your transaction data,
              account numbers, or personally identifying information from inside your statements. We retain only
              anonymized layout metadata to improve our parsing engine. We are committed to full compliance with global
              data protection regulations including GDPR, India's DPDPA 2023, and PIPEDA.
            </p>
          </section>

          {/* 2. What We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. What We Collect</h2>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Account information</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your email address and optionally your name, collected when you sign up. Authentication is managed by
              Lovable Cloud. Passwords are hashed; we never see them in plain text.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Payment information</h3>
            <p className="text-muted-foreground leading-relaxed">
              Payments are processed by Paddle.com Inc., our Merchant of Record. We do not store credit card, bank, or
              payment details. Paddle handles all payment data and tax compliance globally.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Usage data</h3>
            <p className="text-muted-foreground leading-relaxed">
              The number of pages you convert per month (for billing limits) and the bank name detected per conversion
              (for service improvement). We do not store statement contents.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Bank statement uploads</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">When you upload a PDF:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Your file is processed by our backend service hosted on Railway.</li>
              <li>The original PDF is permanently deleted within 60 seconds of conversion.</li>
              <li>The output (Excel/CSV) is held for download for 1 hour, then deleted.</li>
              <li>
                Only anonymized layout metadata is retained: column positions, header keyword patterns, page count —
                never transaction text, amounts, dates, account numbers, names, or any PII from your statements.
              </li>
              <li>
                We capture this layout data solely to improve detection accuracy for future users from the same bank.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Log data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We collect standard server logs (IP address, browser, timestamp) for security and debugging. Logs are
              retained for 30 days.
            </p>
          </section>

          {/* 3. What We Do Not Do */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. What We Do Not Do</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>We do not sell your data to any third party.</li>
              <li>We do not use your financial data to train AI models that benefit other parties.</li>
              <li>We do not share your transactions with anyone.</li>
              <li>We do not retain your bank statements after conversion.</li>
              <li>We do not have access to your bank accounts.</li>
            </ul>
          </section>

          {/* 4. Legal basis */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              For users in the European Economic Area (EEA), we process your personal data under the following legal
              bases:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Contract performance:</strong> processing necessary to provide the
                service you subscribed to.
              </li>
              <li>
                <strong className="text-foreground">Legitimate interests:</strong> security logging, fraud prevention,
                and service improvement through anonymized data.
              </li>
              <li>
                <strong className="text-foreground">Consent:</strong> marketing communications (you can opt out at any
                time).
              </li>
            </ul>
          </section>

          {/* 5. Sub-processors */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Sub-Processors</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Provider</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Purpose</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Region</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Lovable Cloud</td>
                    <td className="p-3">Application hosting, authentication, user database</td>
                    <td className="p-3">USA — SCCs apply for EU transfers</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Railway</td>
                    <td className="p-3">Backend PDF parsing service</td>
                    <td className="p-3">USA — SCCs apply</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Anthropic</td>
                    <td className="p-3">
                      AI fallback for low-confidence row parsing (only individual row text is sent, never full
                      statements; Anthropic does not train on API requests per their usage policy)
                    </td>
                    <td className="p-3">USA — SCCs apply</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Paddle</td>
                    <td className="p-3">Payment processing, Merchant of Record, global tax compliance</td>
                    <td className="p-3">UK / USA — GDPR compliant</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Cloudflare R2</td>
                    <td className="p-3">Temporary output file storage, deleted within 1 hour</td>
                    <td className="p-3">Global CDN — Cloudflare DPA covers GDPR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Your rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">If you are in the EU/EEA (GDPR)</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Right to access your personal data.</li>
              <li>Right to rectification.</li>
              <li>Right to erasure ("right to be forgotten").</li>
              <li>Right to restriction of processing.</li>
              <li>Right to data portability.</li>
              <li>Right to object to processing.</li>
              <li>Right to lodge a complaint with your local supervisory authority.</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">If you are in India (DPDPA 2023)</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Right to access.</li>
              <li>Right to correction and erasure.</li>
              <li>Right to grievance redressal (Data Protection Board of India).</li>
              <li>Right to withdraw consent.</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">If you are in Canada (PIPEDA)</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Right to access and correct your personal information.</li>
              <li>Right to withdraw consent (with reasonable notice).</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">If you are in the USA</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                California residents have rights under the CCPA including the right to know, delete, and opt out of
                sale (we do not sell data).
              </li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise any rights, email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              . We respond within 30 days (or within GDPR's 1-month requirement where applicable).
            </p>
          </section>

          {/* 7. International transfers */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service providers are primarily based in the USA. For EU/EEA users, transfers to the USA are covered
              by Standard Contractual Clauses (SCCs) as approved by the European Commission. We maintain Data
              Processing Agreements with all sub-processors.
            </p>
          </section>

          {/* 8. Retention */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Data Retention</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account data: while your account is active; deleted within 30 days of an account deletion request.</li>
              <li>Conversion history metadata: while your account is active.</li>
              <li>Original PDFs: deleted within 60 seconds of conversion.</li>
              <li>Output files: deleted within 1 hour of generation.</li>
              <li>Anonymized layout metadata: retained indefinitely (not linked to you).</li>
              <li>Server logs: 30 days.</li>
            </ul>
          </section>

          {/* 9. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use only essential cookies for authentication and session management. We do not use advertising or
              tracking cookies. No cookie consent banner is required for essential cookies under the ePrivacy Directive.
            </p>
          </section>

          {/* 10. Security */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Security</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>TLS 1.3 encryption for all data in transit.</li>
              <li>SSL on all database connections.</li>
              <li>Production system access restricted to authorized personnel.</li>
              <li>Principle of data minimization throughout.</li>
            </ul>
          </section>

          {/* 11. Children */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Children</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Service is not directed at children under 16. We do not knowingly collect data from children.
            </p>
          </section>

          {/* 12. Changes */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes</h2>
            <p className="text-muted-foreground leading-relaxed">
              We notify you by email at least 14 days before material changes take effect.
            </p>
          </section>

          {/* 13. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Contact and Data Protection Officer</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy requests:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              For GDPR-specific inquiries:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              . DPO details will be added if and when required by GDPR for our business scale.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

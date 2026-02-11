import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - ClearlyLedger",
    "description": "Privacy policy for ClearlyLedger bank statement converter. Learn how we collect, use, and protect your data.",
    "url": "https://clearlyledger.com/privacy-policy",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://clearlyledger.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Privacy Policy",
          "item": "https://clearlyledger.com/privacy-policy"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - ClearlyLedger</title>
        <meta name="description" content="Privacy policy for ClearlyLedger bank statement to Excel converter. Learn how we collect, use, process, and protect your data." />
        <link rel="canonical" href="https://clearlyledger.com/privacy-policy" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/privacy-policy" />
        <meta property="og:title" content="Privacy Policy - ClearlyLedger" />
        <meta property="og:description" content="Privacy policy for ClearlyLedger bank statement converter." />
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
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
            <h1 className="font-display text-3xl font-bold text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: February 11, 2026 · Last Updated: February 11, 2026
            </p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground leading-relaxed">
            ClearlyLedger ("we," "us," or "our") operates the website clearlyledger.com (the "Service").
            This Privacy Policy explains how we collect, use, process, and protect your information when you use our bank statement conversion service.
          </p>

          {/* 1. Data Collection and Processing */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Data Collection and Processing
            </h2>

            <h3 className="text-lg font-medium text-foreground mb-2">1.1 Information You Provide</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect information when you:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Create an account (email address, encrypted password)</li>
              <li>Upload bank statements for conversion</li>
              <li>Subscribe to a paid plan (billing metadata handled by our payment processor)</li>
              <li>Contact our support team</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">1.2 Bank Statement Processing</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">When you upload a bank statement PDF:</p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li><strong>Secure Transmission:</strong> Files are transmitted over HTTPS to our secure backend servers on Railway.</li>
              <li><strong>Temporary Processing:</strong> Your PDF is processed in server memory. It is never written to permanent disk storage.</li>
              <li><strong>Immediate Deletion:</strong> Once conversion is complete, your original PDF is permanently deleted from our servers. Processing typically takes 5–30 seconds.</li>
              <li><strong>Zero Storage:</strong> We do NOT store your bank statements, PDFs, or uploaded files. We cannot retrieve your files after processing is complete.</li>
            </ol>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">1.3 Anonymized Data for Service Improvement</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To improve parsing accuracy and support more banks, we retain <strong>anonymized, non-personal data</strong> from conversions:
            </p>
            <p className="text-muted-foreground leading-relaxed mb-2"><strong>What we keep:</strong></p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Bank statement format patterns (layout structures)</li>
              <li>Column arrangements and positioning</li>
              <li>Date and currency format patterns</li>
              <li>Table structures and header patterns</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3 mb-2"><strong>What we NEVER keep:</strong></p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your name or account holder names</li>
              <li>Account numbers, IBAN, IFSC, or routing codes</li>
              <li>Transaction descriptions or narrations</li>
              <li>Transaction amounts or balances</li>
              <li>Branch names or addresses</li>
              <li>Any personally identifiable information (PII)</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-4 mt-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1"><strong>Example:</strong></p>
              <p className="text-sm text-muted-foreground">❌ We DON'T keep: "John Doe, Account #123456, Payment to Amazon ₹2,500"</p>
              <p className="text-sm text-muted-foreground">✅ We DO keep: "Bank format: HDFC, Columns: [Date | Description | Debit | Credit | Balance], Date format: DD/MM/YYYY"</p>
            </div>
          </section>

          {/* 2. Data Storage and Security */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Data Storage and Security
            </h2>

            <h3 className="text-lg font-medium text-foreground mb-2">2.1 Infrastructure</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Application Data:</strong> Stored on a secure cloud database with encryption at rest</li>
              <li><strong>PDF Processing:</strong> Performed on Railway infrastructure</li>
              <li><strong>File Storage:</strong> None — PDFs exist only in temporary server memory during processing</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">2.2 File Storage Policy</h3>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Data Type</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Retention</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Recoverable</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3">Uploaded PDF files</td>
                    <td className="p-3 font-semibold">0 seconds (immediate deletion)</td>
                    <td className="p-3">No</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Conversion results metadata</td>
                    <td className="p-3">90 days</td>
                    <td className="p-3">Yes (via dashboard)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Anonymized format patterns</td>
                    <td className="p-3">Indefinitely</td>
                    <td className="p-3">N/A (no PII)</td>
                  </tr>
                  <tr>
                    <td className="p-3">Account information</td>
                    <td className="p-3">Until account deletion</td>
                    <td className="p-3">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">2.3 Security Measures</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Encryption in Transit:</strong> TLS 1.3 for all connections</li>
              <li><strong>Encryption at Rest:</strong> AES-256 encryption for database storage</li>
              <li><strong>Authentication:</strong> JWT tokens with secure session management</li>
              <li><strong>Access Control:</strong> Role-based access with least-privilege principle</li>
              <li><strong>Rate Limiting:</strong> Protection against brute-force and abuse</li>
              <li><strong>File Validation:</strong> Multi-layer PDF security scanning before processing</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. How We Use Your Information
            </h2>

            <h3 className="text-lg font-medium text-foreground mb-2">3.1 To Provide Our Service</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Convert your bank statements to Excel/CSV/JSON format</li>
              <li>Detect your bank and apply appropriate parsing rules</li>
              <li>Store conversion history for your reference (90 days)</li>
              <li>Manage your account and subscription</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">3.2 To Improve Our Service</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Before using any data for improvement, we apply a strict anonymization process:
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1">
              <li>Strip all account holder names</li>
              <li>Remove all account numbers and identifiers</li>
              <li>Redact transaction descriptions and narrations</li>
              <li>Remove all balances and amounts</li>
              <li>Generalize location data (branch, address)</li>
              <li>Retain only format structure and layout patterns</li>
            </ol>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">3.3 Legal Obligations</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may process your data to comply with legal requirements, respond to lawful requests from authorities, protect our legal rights, or prevent fraud and abuse.
            </p>
          </section>

          {/* 4. Data Sharing and Third Parties */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. Data Sharing and Third Parties
            </h2>

            <h3 className="text-lg font-medium text-foreground mb-2">4.1 We Do Not Sell Your Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We never sell, rent, or trade your personal information or bank statement data to third parties.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-2">4.2 Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We share limited data with trusted service providers who process data on our behalf:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Provider</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Purpose</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Data Shared</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Retention</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Railway</td>
                    <td className="p-3">PDF processing</td>
                    <td className="p-3">Temporary PDF files during processing</td>
                    <td className="p-3">Deleted immediately</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Cloud Database</td>
                    <td className="p-3">Auth & storage</td>
                    <td className="p-3">Email, encrypted password, processing metadata</td>
                    <td className="p-3">Until account deletion</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Resend</td>
                    <td className="p-3">Email notifications</td>
                    <td className="p-3">Email address, notification content</td>
                    <td className="p-3">30 days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Dodo Payments</td>
                    <td className="p-3">Subscription billing</td>
                    <td className="p-3">Email, billing info (handled by Dodo)</td>
                    <td className="p-3">Per processor requirements</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Important:</strong> None of these providers have access to your bank statement content or transaction data.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">4.3 No Third-Party Tracking</h3>
            <p className="text-muted-foreground leading-relaxed">
              We do not use Google Analytics, Facebook Pixel, third-party tracking cookies, or behavioral analytics tools. We do not track your behavior across the web.
            </p>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Cookies
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies solely for authentication (maintaining your login session) and storing your preferences (such as theme and language settings). We do not use advertising cookies or third-party tracking cookies.
            </p>
          </section>

          {/* 6. Your Data Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Your Data Rights
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> View your processing history and account data in your dashboard at any time.</li>
              <li><strong>Delete:</strong> Delete individual conversion jobs from your dashboard, or delete your entire account in Settings. All associated data is permanently removed within 30 days of account deletion.</li>
              <li><strong>Portability:</strong> Export your conversion results as Excel, CSV, or JSON files. Export your processing history and account information as JSON.</li>
              <li><strong>Correction:</strong> Update your account information at any time through your dashboard.</li>
            </ul>
          </section>

          {/* 7. Data Retention Periods */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              7. Data Retention Periods
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Data Type</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Retention Period</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Reason</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3">Uploaded PDF files</td>
                    <td className="p-3 font-semibold">0 seconds</td>
                    <td className="p-3">Deleted immediately after conversion</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Conversion results</td>
                    <td className="p-3">90 days</td>
                    <td className="p-3">User convenience</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Processing job metadata</td>
                    <td className="p-3">90 days</td>
                    <td className="p-3">Account history</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Anonymized format patterns</td>
                    <td className="p-3">Indefinitely</td>
                    <td className="p-3">Service improvement</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Account information</td>
                    <td className="p-3">Until deletion</td>
                    <td className="p-3">Account management</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Email notification logs</td>
                    <td className="p-3">30 days</td>
                    <td className="p-3">Support purposes</td>
                  </tr>
                  <tr>
                    <td className="p-3">Payment records</td>
                    <td className="p-3">7 years</td>
                    <td className="p-3">Legal requirement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              8. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ClearlyLedger is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately at{" "}
              <a href="mailto:helppropsal@outlook.com" className="text-primary hover:underline">helppropsal@outlook.com</a>.
            </p>
          </section>

          {/* 9. International Data Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be processed in regions outside your country. We ensure adequate protection through encryption in transit (TLS 1.3) and at rest (AES-256), service provider security certifications, and standard contractual clauses where applicable. Your uploaded PDF files cannot be affected by international transfers as they are not stored on our servers.
            </p>
          </section>

          {/* 10. Changes to This Privacy Policy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy to reflect changes in our data practices, new features, or legal requirements.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong>Material changes:</strong> We will notify you via email and in-app notice.</li>
              <li><strong>Minor updates:</strong> Posted on this page with an updated "Last Updated" date.</li>
            </ul>
          </section>

          {/* 11. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              11. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions regarding this Privacy Policy, to exercise your data rights, or for privacy-related concerns, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <a href="mailto:helppropsal@outlook.com" className="text-primary hover:underline">
                helppropsal@outlook.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We aim to respond within 48 hours for privacy inquiries.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

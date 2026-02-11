import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - ClearlyLedger",
    "description": "Read the terms of service for ClearlyLedger bank statement converter.",
    "url": "https://clearlyledger.com/terms",
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
          "name": "Terms of Service",
          "item": "https://clearlyledger.com/terms"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service - ClearlyLedger</title>
        <meta name="description" content="Read the terms of service for ClearlyLedger bank statement to Excel converter. Includes usage policies, data handling, and user responsibilities." />
        <link rel="canonical" href="https://clearlyledger.com/terms" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/terms" />
        <meta property="og:title" content="Terms of Service - ClearlyLedger" />
        <meta property="og:description" content="Read the terms of service for ClearlyLedger bank statement converter." />
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
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: February 11, 2026 · Last Updated: February 11, 2026
            </p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ClearlyLedger ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. Your continued use of the Service constitutes acceptance of these terms and any updates made to them.
            </p>
          </section>

          {/* 2. Description of the Service */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Description of the Service
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ClearlyLedger provides an automated document conversion service that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Converts uploaded bank statement PDFs into structured Excel, CSV, or JSON output</li>
              <li>Processes files automatically on secure backend servers using proprietary rule-based algorithms</li>
              <li>Offers optional features depending on your plan, such as PII masking and batch processing</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Features, capabilities, and usage limits vary by plan. Please refer to the pricing page for current plan details.
            </p>
          </section>

          {/* 3. Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Eligibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years of age and legally permitted to use the Service in your jurisdiction. You are responsible for ensuring that your use of the Service complies with all applicable local, state, national, and international laws and regulations.
            </p>
          </section>

          {/* 4. User Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. User Responsibilities
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              By using the Service, you agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You own or have the legal right to upload the files you submit</li>
              <li>Uploaded content does not violate any laws or third-party rights</li>
              <li>You will not misuse the Service, including but not limited to: abusing usage limits, attempting to reverse engineer the system, or disrupting Service operations</li>
              <li>You are solely responsible for maintaining the confidentiality of your account credentials</li>
            </ul>
          </section>

          {/* 5. File Uploads and Data Handling */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. File Uploads and Data Handling
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              By uploading bank statement PDFs to ClearlyLedger, you acknowledge and agree to the following:
            </p>

            <h3 className="text-lg font-medium text-foreground mb-2">5.1 Processing</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Files are processed on our secure backend servers hosted on Railway infrastructure</li>
              <li>Files are transmitted over HTTPS encrypted connections</li>
              <li>Original PDF files are <strong>permanently deleted immediately</strong> after conversion completes</li>
              <li>We cannot recover your files after processing is complete</li>
              <li>Conversion results are available for download for 90 days</li>
              <li>Maximum file size is 10 MB per file</li>
              <li>The Service does not sell, reuse, share, or train AI on your uploaded files</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You retain full ownership of your data at all times.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">5.2 Data Usage for Service Improvement</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              By using ClearlyLedger, you consent to our use of <strong>anonymized, non-personal data</strong> to improve the service:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>We retain anonymized bank statement format patterns (layout structure, column arrangements, date formats)</li>
              <li>All personally identifiable information (names, account numbers, amounts, descriptions) is removed before any data is retained</li>
              <li>This data helps us improve parsing accuracy and add support for more banks</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We use rule-based parsing, not AI training. Anonymized patterns are used solely to improve our detection algorithms.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">5.3 File Storage and Deletion</h3>
            <p className="text-muted-foreground leading-relaxed mb-3"><strong>Automatic Deletion Policy:</strong></p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All uploaded PDF files are automatically deleted from our servers immediately upon completion of conversion</li>
              <li>Files exist only in temporary server memory during processing — they are never written to permanent disk storage</li>
              <li>Processing typically completes within 5–30 seconds</li>
              <li>No backup copies of your files are made</li>
              <li>No recovery is possible after deletion</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3"><strong>User-Managed Data:</strong></p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Conversion results (Excel/CSV downloads) are available for 90 days</li>
              <li>You can delete conversion results anytime from your dashboard</li>
              <li>You can delete your entire account and all associated data at any time</li>
            </ul>
          </section>

          {/* 6. Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to privacy-first processing. We maintain minimal data retention practices and handle your information with care. For complete details on how we collect, use, and protect your information, please review our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </section>

          {/* 7. Plans, Usage Limits & Payments */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              7. Plans, Usage Limits & Payments
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Free and paid plans have specific page or usage limits as outlined on the pricing page</li>
              <li>Paid plans are billed monthly or annually according to the terms displayed at the time of purchase</li>
              <li>Prices may change with reasonable notice to existing subscribers</li>
              <li>You are responsible for providing accurate billing information</li>
            </ul>
          </section>

          {/* 8. Refunds & Cancellations */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              8. Refunds & Cancellations
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All purchases are covered by a 14-day refund period in compliance with EU Consumer Rights Directive 2011/83/EU</li>
              <li>EU customers have a statutory 14-day cooling-off period from the date of purchase</li>
              <li>To request a refund, contact support within 14 days of purchase at helppropsal@outlook.com</li>
              <li>Subscription users may cancel their subscription at any time</li>
              <li>Upon cancellation, access continues until the end of the current billing period</li>
            </ul>
          </section>

          {/* 9. Service Availability and Accuracy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. Service Availability and Accuracy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Service is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted or error-free operation. Scheduled maintenance, updates, or unforeseen outages may occur.
            </p>
            <h3 className="text-lg font-medium text-foreground mb-2">9.1 Parsing Accuracy</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>We support 350+ bank formats but do not guarantee perfect parsing for all formats or statement variations</li>
              <li>Accuracy depends on bank format, PDF quality, scan resolution, and statement structure</li>
              <li>You are responsible for verifying the accuracy of converted data against your original statements</li>
              <li>We recommend reviewing important data before using it for tax filing, auditing, or financial decisions</li>
            </ul>
            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">9.2 Permanent File Deletion</h3>
            <p className="text-muted-foreground leading-relaxed">
              You acknowledge that once your uploaded PDF is processed and deleted, we cannot recover it under any circumstances. You should maintain your own backup copies of all original bank statements.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>The Service is not responsible for any financial, legal, or business decisions made using the conversion output</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability is limited to the amount you paid for the Service during the twelve (12) months preceding the claim</li>
              <li>We are not liable for loss of data due to automatic file deletion after processing</li>
              <li>We are not liable for inaccuracies in converted transaction data, amounts, or balances</li>
              <li>You are responsible for verifying converted data before using it for tax filing, accounting, or financial decisions</li>
            </ul>
          </section>

          {/* 11. Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              11. Indemnification
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless ClearlyLedger and its operators from any claims, damages, losses, liabilities, costs, or expenses (including reasonable legal fees) arising from your misuse of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          {/* 12. Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              12. Termination
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>We reserve the right to suspend or terminate your access to the Service for abuse, violations of these Terms, or any other reason at our discretion</li>
              <li>You may stop using the Service at any time</li>
              <li>Upon termination, your right to access the Service ceases immediately</li>
            </ul>
          </section>

          {/* 13. Acceptable Use Policy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              13. Acceptable Use Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree NOT to:</p>

            <h3 className="text-lg font-medium text-foreground mb-2">File Uploads</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Upload files you don't own or have permission to process</li>
              <li>Upload files containing malware, viruses, or exploits</li>
              <li>Upload non-bank-statement files to test or abuse the system</li>
              <li>Upload excessively large files to consume server resources</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Service Abuse</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Attempt to reverse-engineer our parsing algorithms</li>
              <li>Scrape or automate requests beyond API rate limits</li>
              <li>Create multiple accounts to circumvent usage limits</li>
              <li>Share account credentials with others</li>
              <li>Use the Service for illegal activities</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Data Misuse</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Attempt to access other users' data</li>
              <li>Attempt to recover deleted files from our servers</li>
              <li>Perform security testing without written permission</li>
              <li>Interfere with service operation or infrastructure</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Consequences:</strong> Violation of these terms may result in immediate account suspension, termination of service access, legal action if applicable, or reporting to authorities for illegal activities.
            </p>
          </section>

          {/* 14. Data Retention and Deletion */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              14. Data Retention and Deletion
            </h2>

            <h3 className="text-lg font-medium text-foreground mb-2">14.1 Automatic Deletion</h3>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Data Type</th>
                    <th className="text-left p-3 font-medium text-foreground border-b border-border">Retention</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3">Uploaded PDF files</td>
                    <td className="p-3 font-semibold">Immediate deletion (0 seconds)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Conversion results</td>
                    <td className="p-3">90 days</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Processing job metadata</td>
                    <td className="p-3">90 days</td>
                  </tr>
                  <tr>
                    <td className="p-3">Account data (upon deletion)</td>
                    <td className="p-3">Removed within 30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">14.2 Data Retained After Account Deletion</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Even after account deletion, we may retain:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Anonymized format patterns (contain no PII) for service improvement</li>
              <li>Aggregated usage statistics (no user identification)</li>
              <li>Payment records for 7 years (legal requirement)</li>
            </ul>
          </section>

          {/* 15. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              15. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We will notify you of material changes to these Terms via email and in-app notification. Minor updates will be posted on this page.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Continue using the service after changes = acceptance of new terms</li>
              <li>If you disagree with updated terms, you may cancel within 30 days</li>
            </ul>
          </section>

          {/* 16. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              16. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved in accordance with applicable legal procedures.
            </p>
          </section>

          {/* 17. Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              17. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions or concerns about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <a
                href="mailto:helppropsal@outlook.com"
                className="text-primary hover:underline"
              >
                helppropsal@outlook.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              (Email-only support)
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;

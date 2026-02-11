import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/terms" />
        <meta property="og:title" content="Terms of Service - ClearlyLedger" />
        <meta property="og:description" content="Read the terms of service for ClearlyLedger bank statement converter." />
        
        {/* Schema.org JSON-LD */}
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
              Last updated: {lastUpdated}
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
              <li>Converts uploaded documents (PDF, Excel, CSV) into structured Excel output</li>
              <li>Processes files automatically using proprietary algorithms</li>
              <li>Offers optional features depending on your plan, such as PII masking</li>
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
              You must be legally permitted to use the Service in your jurisdiction. You are responsible for ensuring that your use of the Service complies with all applicable local, state, national, and international laws and regulations.
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

          {/* 5. File Uploads & Data Handling */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. File Uploads & Data Handling
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Regarding your uploaded files:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Supported file types include PDF, Excel, and CSV formats</li>
              <li>Maximum file size is 10 MB per file</li>
              <li>Files are used solely to perform the requested conversion</li>
              <li>Files are automatically deleted after processing is complete</li>
              <li>The Service does not sell, reuse, share, or train on your uploaded files</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You retain full ownership of your data at all times.
            </p>
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
              <li>Paid plans are billed according to the terms displayed at the time of purchase</li>
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

          {/* 9. Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. Service Availability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted or error-free operation. Scheduled maintenance, updates, or unforeseen outages may occur. We will make reasonable efforts to minimize disruption and provide advance notice of planned maintenance when possible.
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

          {/* 13. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              13. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms of Service from time to time. When we make changes, we will update the "Last updated" date at the top of this page. Your continued use of the Service after any changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* 14. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              14. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved in accordance with applicable legal procedures.
            </p>
          </section>

          {/* 15. Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              15. Contact Information
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
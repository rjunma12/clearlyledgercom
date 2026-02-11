import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Shield, Lock, Server, FileCheck, Trash2, Eye, Globe, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Security = () => {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Security - ClearlyLedger",
    "description": "Learn about ClearlyLedger's security practices: encryption, automatic file deletion, GDPR compliance, and privacy-first architecture.",
    "url": "https://clearlyledger.com/security",
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
          "name": "Security",
          "item": "https://clearlyledger.com/security"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Security - ClearlyLedger | How We Protect Your Data</title>
        <meta name="description" content="Learn about ClearlyLedger's security practices: encryption, automatic file deletion, GDPR compliance, and privacy-first architecture." />
        <meta name="keywords" content="bank statement security, data protection, GDPR compliance, secure file processing, privacy-first" />
        <link rel="canonical" href="https://clearlyledger.com/security" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/security" />
        <meta property="og:title" content="Security - ClearlyLedger" />
        <meta property="og:description" content="Learn about ClearlyLedger's security practices: encryption, automatic file deletion, and GDPR compliance." />
        <meta property="og:image" content="https://clearlyledger.com/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Security - ClearlyLedger" />
        <meta name="twitter:description" content="How we protect your financial data." />
        
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
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Security
            </h1>
            <p className="text-sm text-muted-foreground">
              How we protect your data
            </p>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-10">
          Security and privacy are foundational to ClearlyLedger. We've designed our service with a privacy-first architecture that minimizes data exposure while delivering accurate, reliable document conversion.
        </p>

        {/* Security Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Encryption */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Encryption in Transit
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              All data transmitted between your browser and our servers is encrypted using TLS 1.2+ (HTTPS). This ensures your files and information cannot be intercepted during upload or download.
            </p>
          </div>

          {/* Auto Deletion */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Automatic File Deletion
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Uploaded files are processed immediately and deleted automatically after conversion is complete. We do not retain, store, or archive your documents beyond the processing window.
            </p>
          </div>

          {/* No AI Training */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No AI Training on Your Data
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We use deterministic, rule-based parsing—not AI or machine learning. Your documents are never used to train models, and we never share your data with third-party AI services.
            </p>
          </div>

          {/* PII Masking */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Optional PII Masking
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              For paid plan users, sensitive personally identifiable information (names, account numbers) can be automatically anonymized during processing, providing an extra layer of privacy.
            </p>
          </div>

          {/* Infrastructure */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Secure Infrastructure
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our backend runs on industry-standard cloud infrastructure with strict access controls, regular security updates, and monitoring for unauthorized access or anomalies.
            </p>
          </div>

          {/* Access Controls */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Access Controls
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Access to production systems is restricted to authorized personnel only, with role-based permissions and audit logging. We follow the principle of least privilege.
            </p>
          </div>
        </div>

        {/* Data Handling Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Data Handling Practices
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-foreground font-medium">Files processed in memory</p>
                <p className="text-muted-foreground text-sm">Documents are processed in isolated memory and never written to persistent disk storage.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-foreground font-medium">No file sharing or resale</p>
                <p className="text-muted-foreground text-sm">Your files are never shared with third parties, sold, or used for any purpose beyond the conversion you requested.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-foreground font-medium">Minimal data retention</p>
                <p className="text-muted-foreground text-sm">We retain only essential account and usage data needed to provide the service. Processing history is minimal and does not include file contents.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-foreground font-medium">You own your data</p>
                <p className="text-muted-foreground text-sm">You retain full ownership of all documents you upload and the converted output. We claim no rights to your content.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Compliance & Standards
          </h2>
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">GDPR Aligned</h4>
                <p className="text-muted-foreground text-sm">
                  Our data handling practices align with GDPR requirements, including data minimization, purpose limitation, and data subject rights.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Privacy by Design</h4>
                <p className="text-muted-foreground text-sm">
                  Privacy is built into our architecture from the ground up—not added as an afterthought.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Data Processing Agreement</h4>
                <p className="text-muted-foreground text-sm">
                  We offer a <Link to="/data-processing" className="text-primary hover:underline">Data Processing Agreement (DPA)</Link> for enterprise customers with specific compliance requirements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Regular Reviews</h4>
                <p className="text-muted-foreground text-sm">
                  We regularly review and update our security practices to address emerging threats and best practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Incident Response */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Incident Response
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            In the unlikely event of a security incident affecting your data, we are committed to notifying affected users promptly (within 72 hours) with clear information about what occurred and what steps are being taken. Our incident response procedures are designed to minimize impact and restore security quickly.
          </p>
        </section>

        {/* Responsible Disclosure */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Responsible Disclosure
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you discover a security vulnerability, we encourage responsible disclosure. Please report any security concerns to{" "}
            <a href="mailto:helppropsal@outlook.com" className="text-primary hover:underline">
              helppropsal@outlook.com
            </a>
            . We take all reports seriously and will work to address valid concerns promptly.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Questions About Security?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have questions about our security practices or need additional information for your compliance requirements, please contact us.
          </p>
          <p className="text-muted-foreground">
            <a
              href="mailto:helppropsal@outlook.com"
              className="text-primary hover:underline"
            >
              helppropsal@outlook.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            (Email-only support)
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Security;
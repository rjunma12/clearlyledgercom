import { ArrowLeft, Shield, Target, Globe, FileCheck, Trash2, Scale, Users, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Page Header */}
            <header className="mb-12">
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                About Us
              </h1>
              <p className="text-lg text-muted-foreground">
                Built for accuracy, privacy, and simplicity.
              </p>
            </header>

            {/* Story Section */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                Why We Built This
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Converting a bank statement to Excel shouldn't be complicated. Yet many users spend hours manually copying transaction data from PDFs, dealing with formatting errors, or worrying about where their sensitive financial information ends up.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Existing PDF to Excel converter tools often lack transparency about how they handle uploaded documents. Some store files indefinitely. Others sacrifice accuracy for speed. Many don't support international bank formats, leaving users with incomplete or incorrectly parsed data.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We built ClearlyLedger to address these concerns directly. Our goal was simple: create a secure bank statement conversion tool that prioritizes privacy-first processing, delivers accurate results, and works across multiple regions and bank formats.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you need to convert bank statements online for personal bookkeeping or professional financial workflows, ClearlyLedger provides multi-region bank statement support with clear, honest usage limits—no hidden restrictions, no data retention, no compromises.
                </p>
              </div>
            </section>

            {/* What We Focus On */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                What We Focus On
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Accurate bank statement to Excel conversion with balance verification
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Support for multiple countries and bank formats
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Clear usage limits with no hidden restrictions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Privacy-first processing by default
                  </span>
                </li>
              </ul>
            </section>

            {/* File Handling & Privacy */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                File Handling & Privacy
              </h2>
              
              <div className="glass-card p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  File Processing Details
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Supported files: PDF, Excel, CSV
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Maximum file size: 10 MB per file
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Page limits depend on selected plan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Files are processed automatically
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-primary" />
                  Data Deletion Policy
                </h3>
                <ul className="space-y-3 text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Files are deleted after processing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Uploaded documents are not stored, reused, or shared
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
                  <strong className="text-foreground">In plain language:</strong> Files are used only to perform the conversion and are removed from our systems once processing is complete.
                </p>
              </div>
            </section>

            {/* Accuracy & Balance Verification */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Accuracy & Balance Verification
              </h2>
              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Every transaction row is validated to ensure the running balance matches expected values. Opening and closing balances are checked automatically to help reduce common conversion errors.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      This approach is designed for real financial workflows where accuracy matters—whether you're reconciling accounts, preparing reports, or importing data into accounting software.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Who This Is For */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Who This Is For
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="glass-card p-5 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Individuals converting occasional bank statements
                  </p>
                </div>
                <div className="glass-card p-5 text-center">
                  <Target className="w-6 h-6 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Professionals working with statements regularly
                  </p>
                </div>
                <div className="glass-card p-5 text-center">
                  <Shield className="w-6 h-6 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Teams needing clean Excel output with optional PII masking
                  </p>
                </div>
              </div>
            </section>

            {/* Support & Contact */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Support & Contact
              </h2>
              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-4">
                      Support is provided via email only. We typically respond within 24–48 hours.
                    </p>
                    <p className="text-foreground font-medium mb-4">
                      Contact:{" "}
                      <a 
                        href="mailto:helppropsal@outlook.com" 
                        className="text-primary hover:underline"
                      >
                        helppropsal@outlook.com
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Support covers bugs, feature requests, billing, and account issues.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Closing Statement */}
            <section className="mb-8">
              <div className="border-l-4 border-primary pl-6 py-2">
                <p className="text-lg text-foreground font-medium italic">
                  Our goal is to make bank statement conversion accurate, transparent, and privacy-safe—without unnecessary friction.
                </p>
              </div>
            </section>

            {/* Back to Home */}
            <div className="pt-8 border-t border-border">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

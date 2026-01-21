import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy for ClearlyLedger</h1>
          
          <div className="text-muted-foreground mb-8">
            <p className="mb-1"><strong>Effective Date:</strong> January 20, 2026</p>
            <p><strong>Last Updated:</strong> January 20, 2026</p>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">
            ClearlyLedger ("we," "us," or "our") operates the website clearlyledger.com (the "Service"). 
            This Privacy Policy explains how we collect, use, process, and protect your information.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect personal information such as name, email address, billing metadata, and usage data. 
              Uploaded bank statements are processed only for conversion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              To operate the Service, process payments, enforce limits, communicate with users, and improve reliability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Document Handling and Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Documents are stored temporarily and automatically deleted after processing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Data is shared only with trusted providers or when legally required.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Used for authentication, preferences, and analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may request access, correction, or deletion of your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use encryption and access controls to protect your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Service is intended for users 18+.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Data may be processed globally with safeguards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may revise this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Support & Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions regarding this Privacy Policy or to exercise your data rights, please contact us at{" "}
              <a 
                href="mailto:helppropsal@outlook.com" 
                className="text-primary hover:underline"
              >
                helppropsal@outlook.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

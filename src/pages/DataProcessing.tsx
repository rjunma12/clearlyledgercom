import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DataProcessing = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
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
              Data Processing Agreement
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-muted-foreground leading-relaxed">
              This Data Processing Agreement ("DPA") forms part of the Terms of Service between ClearlyLedger ("Processor", "we", "us") and the customer ("Controller", "you") and applies to the processing of personal data on behalf of the Controller in connection with the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              This DPA is designed to meet the requirements of the General Data Protection Regulation (GDPR) and other applicable data protection laws.
            </p>
          </section>

          {/* 1. Definitions */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Definitions
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person as defined in applicable data protection laws.</li>
              <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.</li>
              <li><strong>"Data Subject"</strong> means the individual to whom Personal Data relates.</li>
              <li><strong>"Sub-processor"</strong> means any third party engaged by the Processor to process Personal Data on behalf of the Controller.</li>
              <li><strong>"Data Breach"</strong> means any unauthorized access to, or acquisition, use, or disclosure of Personal Data.</li>
            </ul>
          </section>

          {/* 2. Scope and Purpose */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Scope and Purpose of Processing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Processor processes Personal Data solely for the purpose of providing the document conversion Service, which includes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Converting uploaded documents (PDF, Excel, CSV) into structured Excel format</li>
              <li>Applying optional PII masking as requested by the Controller</li>
              <li>Maintaining usage records and account information</li>
            </ul>
          </section>

          {/* 3. Types of Personal Data */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Types of Personal Data Processed
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The following categories of Personal Data may be processed:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account Data:</strong> Email address, name (if provided), account preferences</li>
              <li><strong>Document Data:</strong> Any Personal Data contained within uploaded documents (e.g., names, account numbers, transaction details)</li>
              <li><strong>Usage Data:</strong> Processing history, timestamps, file metadata</li>
            </ul>
          </section>

          {/* 4. Data Subject Categories */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. Categories of Data Subjects
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Data Subjects may include the Controller's employees, customers, clients, or any individuals whose Personal Data is contained within documents uploaded to the Service.
            </p>
          </section>

          {/* 5. Processor Obligations */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Processor Obligations
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Processor agrees to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Process Personal Data only on documented instructions from the Controller</li>
              <li>Ensure that persons authorized to process Personal Data are bound by confidentiality obligations</li>
              <li>Implement appropriate technical and organizational security measures</li>
              <li>Assist the Controller in responding to Data Subject requests</li>
              <li>Delete or return all Personal Data upon termination of services, unless retention is required by law</li>
              <li>Make available all information necessary to demonstrate compliance with this DPA</li>
            </ul>
          </section>

          {/* 6. Security Measures */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Security Measures
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Processor implements the following security measures:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Encryption:</strong> Data is encrypted in transit using TLS/SSL protocols</li>
              <li><strong>Access Controls:</strong> Strict access controls limit data access to authorized personnel only</li>
              <li><strong>Automatic Deletion:</strong> Uploaded files are automatically deleted after processing</li>
              <li><strong>PII Anonymization:</strong> Optional PII masking anonymizes sensitive data during processing</li>
              <li><strong>Infrastructure Security:</strong> Hosted on secure, industry-standard cloud infrastructure</li>
              <li><strong>Monitoring:</strong> Systems are monitored for security incidents and unauthorized access</li>
            </ul>
          </section>

          {/* 7. Sub-processors */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              7. Sub-processors
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Controller authorizes the Processor to engage Sub-processors for the provision of the Service. The Processor will:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Maintain a list of current Sub-processors available upon request</li>
              <li>Ensure Sub-processors are bound by data protection obligations no less protective than those in this DPA</li>
              <li>Remain liable for the acts and omissions of its Sub-processors</li>
              <li>Notify the Controller of any intended changes to Sub-processors, providing an opportunity to object</li>
            </ul>
          </section>

          {/* 8. Data Subject Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              8. Data Subject Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Processor will assist the Controller in fulfilling Data Subject rights requests, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Right of access to Personal Data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Requests should be directed to the contact email below, and we will respond within the timeframes required by applicable law.
            </p>
          </section>

          {/* 9. Data Breach Notification */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. Data Breach Notification
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              In the event of a Data Breach affecting Personal Data processed on behalf of the Controller, the Processor will notify the Controller without undue delay (and in any event within 72 hours) after becoming aware of the breach. The notification will include, where possible, the nature of the breach, categories of data affected, approximate number of Data Subjects affected, and measures taken to address the breach.
            </p>
          </section>

          {/* 10. Data Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              10. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Where Personal Data is transferred outside the European Economic Area (EEA), the Processor ensures that appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission, or transfers to countries with an adequacy decision. The Controller may request information about the specific safeguards applied to any such transfer.
            </p>
          </section>

          {/* 11. Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              11. Data Retention and Deletion
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Uploaded Files:</strong> Automatically deleted immediately after processing is complete</li>
              <li><strong>Account Data:</strong> Retained for the duration of the account relationship and deleted upon account termination</li>
              <li><strong>Usage Logs:</strong> Retained for operational and billing purposes, with minimal Personal Data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Upon termination of the Service, the Processor will delete or return all Personal Data, except where retention is required by applicable law.
            </p>
          </section>

          {/* 12. Audit Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              12. Audit Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Processor will make available to the Controller all information necessary to demonstrate compliance with this DPA and allow for audits, including inspections, conducted by the Controller or an auditor mandated by the Controller. Such audits will be conducted with reasonable notice, during normal business hours, and subject to appropriate confidentiality obligations.
            </p>
          </section>

          {/* 13. Duration and Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              13. Duration and Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This DPA remains in effect for the duration of the Service agreement. Upon termination, the Processor's obligations regarding Personal Data continue until all Personal Data has been deleted or returned in accordance with this DPA.
            </p>
          </section>

          {/* 14. Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              14. Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Each party's liability under this DPA is subject to the limitations of liability set forth in the Terms of Service, except where such limitations are prohibited by applicable data protection law.
            </p>
          </section>

          {/* 15. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              15. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This DPA shall be governed by the same governing law provisions as the Terms of Service, except where applicable data protection laws require otherwise.
            </p>
          </section>

          {/* 16. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              16. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions regarding this Data Processing Agreement, data protection practices, or to exercise Data Subject rights, please contact:
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

          {/* Enterprise Notice */}
          <section className="bg-muted/50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Enterprise Customers
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              If you require a customized DPA, additional contractual terms, or have specific compliance requirements, please contact us at{" "}
              <a
                href="mailto:helppropsal@outlook.com"
                className="text-primary hover:underline"
              >
                helppropsal@outlook.com
              </a>{" "}
              to discuss your needs.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DataProcessing;

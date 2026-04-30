import { forwardRef } from "react";
import { ShieldCheck, FileSpreadsheet, CheckCircle2, Globe2, CreditCard, Gauge, Lock, Layers } from "lucide-react";

type Feature = {
  icon: typeof Gauge;
  title: string;
  description: string;
  badge?: string;
};

const features: Feature[] = [{
  icon: Gauge,
  title: "Fast Processing",
  description: "Upload your PDF and get structured Excel output in seconds. Optimized for speed and reliability."
}, {
  icon: Lock,
  title: "Client data stays private",
  description: "Names, account numbers, and personal details are never stored or logged. Every statement is processed in memory and deleted immediately — fully GDPR and DPDPA 2023 compliant. Safe to use with client statements."
}, {
  icon: Layers,
  title: "Process 50 statements at once",
  description: "Upload an entire client folder in one go. Get one merged, deduplicated spreadsheet with a source file column for traceability. Built for accounting firms handling high volumes.",
  badge: "Available on Professional and Business plans"
}, {
  icon: FileSpreadsheet,
  title: "Uniform Output",
  description: "Every export follows the same template regardless of source bank. Date, Description, Debit, Credit, Balance—that's it."
}, {
  icon: CheckCircle2,
  title: "100% Balance Verified",
  description: "Opening + Credits − Debits = Closing. Every file is arithmetically validated before delivery. Failed files are rejected."
}, {
  icon: Globe2,
  title: "Multi-Region Support",
  description: "Localized rule sets for India, USA, UK, Canada, Australia, UAE, and Singapore. English default with optional secondary language."
}, {
  icon: CreditCard,
  title: "Tax-inclusive global billing",
  description: "One clear price, no surprise taxes at checkout. We use Paddle as our Merchant of Record — VAT, GST, and sales tax are included in the price you see, handled automatically across 180+ countries."
}];

const FeaturesSection = forwardRef<HTMLElement>((_, ref) => {
  return <section ref={ref} id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Built for Financial Professionals
          </h2>
          <p className="text-lg text-muted-foreground">
            Accountants, loan processors, and compliance teams trust ClearlyLedger 
            for accurate, consistent bank statement conversions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
                {feature.badge && (
                  <span className="inline-flex mt-3 items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {feature.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>;
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
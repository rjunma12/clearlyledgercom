import { Zap, ShieldCheck, FileSpreadsheet, CheckCircle2, Globe2, RefreshCw } from "lucide-react";
const features = [{
  icon: Zap,
  title: "Zero AI Costs",
  description: "Deterministic rule-based parsing means predictable costs and no per-page API fees. 80%+ gross margins guaranteed."
}, {
  icon: ShieldCheck,
  title: "Privacy-First Processing",
  description: "All PII is anonymized during processing. Names replaced, account numbers masked. Files auto-deleted after delivery."
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
  icon: RefreshCw,
  title: "Auto-Rollback",
  description: "Bank rule sets are version-controlled. If an update breaks parsing, the system automatically reverts to the last stable version."
}];
const FeaturesSection = () => {
  return <section id="features" className="py-24 relative">
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
              </div>
            );
          })}
        </div>
      </div>
    </section>;
};
export default FeaturesSection;
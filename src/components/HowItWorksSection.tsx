import { forwardRef } from "react";
import { Upload, Cog, Download, ArrowDown } from "lucide-react";
import { Helmet } from "react-helmet-async";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Statements",
    description: "Drag and drop PDF bank statements from any supported bank. We handle the rest.",
  },
  {
    number: "02",
    icon: Cog,
    title: "Automatic Processing",
    description: "Our rule engine identifies the bank, applies the correct parser, and validates all balances.",
  },
  {
    number: "03",
    icon: Download,
    title: "Download Clean Data",
    description: "Get perfectly formatted Excel or CSV files ready for QuickBooks, Xero, or Sage import.",
  },
];

const HowItWorksSection = forwardRef<HTMLElement>((_, ref) => {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Convert Bank Statement PDF to Excel",
    "description": "Convert bank statement PDFs to Excel spreadsheets in three simple steps using ClearlyLedger.",
    "totalTime": "PT1M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Upload Your Statements",
        "text": "Drag and drop PDF bank statements from any supported bank. We handle the rest.",
        "url": "https://clearlyledger.com/#how-it-works"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Automatic Processing",
        "text": "Our rule engine identifies the bank, applies the correct parser, and validates all balances.",
        "url": "https://clearlyledger.com/#how-it-works"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Download Clean Data",
        "text": "Get perfectly formatted Excel or CSV files ready for QuickBooks, Xero, or Sage import.",
        "url": "https://clearlyledger.com/#how-it-works"
      }
    ]
  };

  return (
    <section ref={ref} id="how-it-works" className="py-24 relative bg-surface-elevated/50">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Three Steps to Clean Data
          </h2>
          <p className="text-lg text-muted-foreground">
            From messy PDF to accounting-ready spreadsheet in under 60 seconds.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number}>
                  <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 group hover:glow-primary-subtle transition-all duration-300">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[hsl(185,84%,45%)] flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-primary">{step.number}</span>
                        <h3 className="font-display text-xl font-semibold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowDown className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "<60s", label: "Avg. Processing" },
            { value: "100%", label: "Balance Verified" },
            { value: "200+", label: "Banks Supported" },
            { value: "80%+", label: "Gross Margin" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center">
              <div className="font-display text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = 'HowItWorksSection';

export default HowItWorksSection;

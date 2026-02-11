import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  FileSpreadsheet, 
  Globe, 
  Scale, 
  Shield, 
  EyeOff, 
  Gauge, 
  Users, 
  Upload,
  CheckCircle,
  Zap,
  Clock,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Features = () => {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Features - ClearlyLedger",
    "description": "Multi-region support, balance verification, privacy-first processing. See all features of our bank statement to Excel converter.",
    "url": "https://clearlyledger.com/features",
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
          "name": "Features",
          "item": "https://clearlyledger.com/features"
        }
      ]
    }
  };

  const coreFeatures = [
    {
      icon: FileSpreadsheet,
      title: "Bank Statement to Excel Conversion",
      description: "Convert PDF bank statements into structured Excel output. Clean, analysis-ready format designed for real-world financial documents.",
      points: [
        "Structured columns for date, description, amount",
        "Clean formatting ready for analysis",
        "Works with various statement layouts"
      ]
    },
    {
      icon: Globe,
      title: "Multi-Region Support",
      description: "Supports bank statements from multiple countries and handles different layouts and formats. Designed for global usage.",
      points: [
        "Works with international bank formats",
        "Handles various date and currency formats",
        "Continuously expanding coverage"
      ]
    },
    {
      icon: Scale,
      title: "Balance Verification",
      description: "Automatically verifies opening and closing balances to help detect missing or incorrect entries.",
      points: [
        "Checks arithmetic accuracy",
        "Flags potential discrepancies",
        "Improves confidence in converted data"
      ]
    },
    {
      icon: Shield,
      title: "Privacy-First Processing",
      description: "Files are processed securely and deleted after conversion. No reuse, resale, or training on your documents.",
      points: [
        "Automatic file deletion after processing",
        "No data shared with third parties",
        "Rule-based processing—no AI training"
      ]
    },
    {
      icon: EyeOff,
      title: "Optional PII Masking",
      description: "Mask sensitive personally identifiable information in exported files. Available on paid plans.",
      points: [
        "Anonymize names and account numbers",
        "Useful for sharing and compliance",
        "Toggle between normal and masked output"
      ]
    },
    {
      icon: Gauge,
      title: "Speed & Reliability",
      description: "Optimized for fast, accurate processing. Designed for repeated, professional use rather than bulk automation.",
      points: [
        "Fast conversion times",
        "Consistent, reliable output",
        "Suitable for daily workflows"
      ]
    }
  ];

  const usageFeatures = [
    {
      icon: CheckCircle,
      title: "Clear Page Limits",
      description: "Always know where you stand. See pages used today and remaining pages by plan."
    },
    {
      icon: FileCheck,
      title: "File Handling",
      description: "Supports PDF, Excel, and CSV. Maximum file size: 10 MB. Automatic validation before processing."
    },
    {
      icon: Clock,
      title: "Usage Dashboard",
      description: "Registered and paid users can track processing history and monitor usage over time."
    }
  ];

  const planComparison = [
    {
      plan: "Anonymous",
      features: ["1 page / 24 hours", "Normal Excel output", "No account required"]
    },
    {
      plan: "Registered (Free)",
      features: ["5 pages / 24 hours", "Normal Excel output", "Usage tracking"]
    },
    {
      plan: "Pro",
      features: ["Unlimited pages", "Faster processing", "PII masking included"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Features - ClearlyLedger | Bank Statement Conversion Tools</title>
        <meta name="description" content="Multi-region support, balance verification, privacy-first processing. See all features of our bank statement to Excel converter." />
        <meta name="keywords" content="bank statement features, PDF converter features, balance verification, PII masking, multi-region support" />
        <link rel="canonical" href="https://clearlyledger.com/features" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/features" />
        <meta property="og:title" content="Features - ClearlyLedger | Bank Statement Conversion Tools" />
        <meta property="og:description" content="Multi-region support, balance verification, privacy-first processing. See all features of our bank statement to Excel converter." />
        <meta property="og:image" content="https://clearlyledger.com/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Features - ClearlyLedger" />
        <meta name="twitter:description" content="Multi-region support, balance verification, privacy-first processing." />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Features
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Everything you need to convert bank statements into clean, reliable Excel files.
          </p>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Convert PDF bank statements into structured Excel files with accuracy, privacy, and clear usage limits—built for individuals and professionals worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button variant="hero" size="lg" className="gap-2">
                <Upload className="w-5 h-5" />
                Upload PDF
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="glass" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            Core Features
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built for accuracy, privacy, and real-world financial workflows.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Usage Transparency */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            Usage Transparency
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Clear limits, no hidden restrictions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {usageFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Availability by Plan */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            Feature Availability by Plan
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Choose the plan that fits your needs.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {planComparison.map((plan, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-5"
              >
                <h3 className="font-semibold text-foreground mb-4">{plan.plan}</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/pricing">
              <Button variant="glass">
                View Full Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-4">
            Who This Is For
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            ClearlyLedger is designed for anyone who needs reliable bank statement conversion.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Individuals</h3>
              <p className="text-sm text-muted-foreground">
                Converting occasional bank statements for personal finance tracking.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Professionals</h3>
              <p className="text-sm text-muted-foreground">
                Handling statements regularly for clients or business operations.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Teams</h3>
              <p className="text-sm text-muted-foreground">
                Needing privacy controls, PII masking, and reliable output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Support */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">
            Trust & Support
          </h2>
          
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Secure Processing</h4>
                <p className="text-sm text-muted-foreground">Encrypted connections, automatic deletion</p>
              </div>
              <div>
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Minimal Retention</h4>
                <p className="text-sm text-muted-foreground">Files deleted after processing</p>
              </div>
              <div>
                <FileCheck className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Email Support</h4>
                <p className="text-sm text-muted-foreground">
                  <a href="mailto:helppropsal@outlook.com" className="text-primary hover:underline">
                    helppropsal@outlook.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Start converting statements in seconds
          </h2>
          <p className="text-muted-foreground mb-8">
            No complex setup. Upload your PDF and get structured Excel output.
          </p>
          <Link to="/">
            <Button variant="hero" size="lg" className="gap-2">
              <Upload className="w-5 h-5" />
              Upload PDF
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
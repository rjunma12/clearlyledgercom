import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Upload } from "lucide-react";
import PipelineVisualizer from "./PipelineVisualizer";
const HeroSection = () => {
  return <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(185,84%,45%)]/15 rounded-full blur-[100px] animate-pulse-slow" style={{
      animationDelay: '2s'
    }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Trusted by 2,000+ financial professionals
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up text-balance">
            Bank Statements to{" "}
            <span className="gradient-text">Structured Data</span>
            {" "}in Seconds
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up text-balance" style={{
          animationDelay: '0.1s'
        }}>Transform messy PDFs into clean Excel and CSV files. </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{
          animationDelay: '0.2s'
        }}>
            <Button variant="hero" size="xl" className="w-full sm:w-auto group">
              <Upload className="w-5 h-5" />
              Start Converting Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl" className="w-full sm:w-auto">
              View Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>50 pages free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>100% balance verified</span>
            </div>
          </div>
        </div>

        {/* Pipeline Visualizer */}
        <div className="mt-16 animate-slide-up" style={{
        animationDelay: '0.4s'
      }}>
          <PipelineVisualizer />
        </div>
      </div>
    </section>;
};
export default HeroSection;
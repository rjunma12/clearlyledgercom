import { forwardRef } from "react";
import { FileText, Globe, Scale, Shield } from "lucide-react";
import FileUpload from "./FileUpload";

const HeroSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="relative pt-32 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(185,84%,45%)]/15 rounded-full blur-[100px] animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up text-balance">
            Convert Bank Statements to Excel —{" "}
            <span className="gradient-text">Fast and Accurate</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up text-balance"
            style={{ animationDelay: "0.1s" }}
          >
            Simple, secure, and built for regular use.
          </p>

          {/* File Upload Component */}
          <div
            className="animate-slide-up mb-4"
            style={{ animationDelay: "0.15s" }}
          >
            <FileUpload />
          </div>

          {/* Secondary Text */}
          <p 
            className="text-sm text-muted-foreground mb-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            No signup required
          </p>

          {/* File Upload Info */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Supported formats: PDF, Excel, CSV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground hidden sm:block" />
              <span>Maximum file size: 10 MB per file</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;

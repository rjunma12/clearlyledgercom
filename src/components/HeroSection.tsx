import { CheckCircle2, Shield, Trash2, Users, FileText } from "lucide-react";
import FileUpload from "./FileUpload";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
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
            <span className="gradient-text">Without Manual Work</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up text-balance"
            style={{ animationDelay: "0.1s" }}
          >
            Built for people who handle statements regularly. Fast, accurate, and privacy-safe.
          </p>

          {/* File Upload Component */}
          <div
            className="animate-slide-up mb-6"
            style={{ animationDelay: "0.15s" }}
          >
            <FileUpload />
          </div>

          {/* Secondary Text */}
          <p 
            className="text-sm text-muted-foreground mb-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Works instantly. No signup required.
          </p>

          {/* Trust Signals */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center gap-2 px-4 py-2 glass-card">
              <Trash2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Files auto-deleted after processing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-card">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Secure processing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-card">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Used by professionals handling sensitive data</span>
            </div>
          </div>

          {/* File Limit Notice */}
          <div 
            className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Maximum file size: 10 MB per file</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

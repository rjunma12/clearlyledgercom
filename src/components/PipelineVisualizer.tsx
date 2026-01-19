import { FileText, Shield, Cog, CheckCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const stages = [
  { icon: FileText, label: "File Uploaded", color: "from-blue-500 to-blue-600" },
  { icon: Shield, label: "PII Scrubbing", color: "from-amber-500 to-orange-500" },
  { icon: Cog, label: "Rule Application", color: "from-violet-500 to-purple-600" },
  { icon: CheckCircle, label: "Balance Verified", color: "from-primary to-[hsl(185,84%,45%)]" },
];

const PipelineVisualizer = () => {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-6 sm:p-8 glow-primary-subtle">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-primary/80" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Real-time Processing Pipeline
            </span>
          </div>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
            statement_2025.pdf
          </span>
        </div>

        {/* Pipeline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === activeStage;
            const isCompleted = index < activeStage;

            return (
              <div key={stage.label} className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <div
                  className={`
                    relative flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl transition-all duration-500
                    ${isActive ? 'glass-card-strong scale-105 glow-primary-subtle' : 'bg-muted/30'}
                    ${isCompleted ? 'opacity-60' : ''}
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-500
                      ${isActive || isCompleted 
                        ? `bg-gradient-to-br ${stage.color}` 
                        : 'bg-muted border border-border'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 ${isActive || isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stage.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)]" />
                  )}
                </div>

                {/* Arrow between stages */}
                {index < stages.length - 1 && (
                  <ArrowRight 
                    className={`hidden sm:block w-5 h-5 transition-colors duration-300 ${
                      isCompleted ? 'text-primary' : 'text-muted-foreground/30'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] transition-all duration-500 ease-out"
            style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PipelineVisualizer;

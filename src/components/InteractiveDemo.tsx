import { useState, useEffect } from "react";
import { FileText, Shield, Cog, CheckCircle, Play, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleStatement = [
  { date: "2025-01-15", description: "SALARY FROM ACME CORP - JOHN SMITH", debit: "", credit: "5,250.00", balance: "12,450.00", account: "****4521" },
  { date: "2025-01-16", description: "TRANSFER TO JANE DOE - ACC 9876543210", debit: "1,200.00", credit: "", balance: "11,250.00", account: "****4521" },
  { date: "2025-01-17", description: "AMAZON PURCHASE - ORDER #123-456", debit: "89.99", credit: "", balance: "11,160.01", account: "****4521" },
  { date: "2025-01-18", description: "STARBUCKS COFFEE - CARD ENDING 7890", debit: "12.50", credit: "", balance: "11,147.51", account: "****4521" },
  { date: "2025-01-19", description: "REFUND FROM WALMART - MARY JOHNSON", debit: "", credit: "45.00", balance: "11,192.51", account: "****4521" },
];

const scrubbedStatement = [
  { date: "2025-01-15", description: "SALARY FROM ACME CORP - [REDACTED]", debit: "", credit: "5,250.00", balance: "12,450.00", account: "****XXXX" },
  { date: "2025-01-16", description: "TRANSFER TO [REDACTED] - ACC ****XXXX", debit: "1,200.00", credit: "", balance: "11,250.00", account: "****XXXX" },
  { date: "2025-01-17", description: "AMAZON PURCHASE - ORDER #XXX-XXX", debit: "89.99", credit: "", balance: "11,160.01", account: "****XXXX" },
  { date: "2025-01-18", description: "STARBUCKS COFFEE - CARD ENDING XXXX", debit: "12.50", credit: "", balance: "11,147.51", account: "****XXXX" },
  { date: "2025-01-19", description: "REFUND FROM WALMART - [REDACTED]", debit: "", credit: "45.00", balance: "11,192.51", account: "****XXXX" },
];

const normalizedStatement = [
  { date: "2025-01-15", description: "Salary - ACME CORP", debit: "", credit: "5,250.00", balance: "12,450.00" },
  { date: "2025-01-16", description: "Bank Transfer - Outgoing", debit: "1,200.00", credit: "", balance: "11,250.00" },
  { date: "2025-01-17", description: "Online Purchase - Amazon", debit: "89.99", credit: "", balance: "11,160.01" },
  { date: "2025-01-18", description: "Food & Beverage - Starbucks", debit: "12.50", credit: "", balance: "11,147.51" },
  { date: "2025-01-19", description: "Refund - Walmart", debit: "", credit: "45.00", balance: "11,192.51" },
];

const stages = [
  { 
    icon: FileText, 
    label: "File Uploaded", 
    color: "from-blue-500 to-blue-600",
    description: "PDF parsed and data extracted"
  },
  { 
    icon: Shield, 
    label: "PII Scrubbing", 
    color: "from-amber-500 to-orange-500",
    description: "Personal information anonymized"
  },
  { 
    icon: Cog, 
    label: "Rule Application", 
    color: "from-violet-500 to-purple-600",
    description: "Bank-specific rules applied"
  },
  { 
    icon: CheckCircle, 
    label: "Balance Verified", 
    color: "from-primary to-[hsl(185,84%,45%)]",
    description: "Arithmetic validation passed"
  },
];

const InteractiveDemo = () => {
  const [currentStage, setCurrentStage] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const getCurrentData = () => {
    if (currentStage <= 0) return sampleStatement;
    if (currentStage === 1) return scrubbedStatement;
    return normalizedStatement;
  };

  const getHighlightedFields = () => {
    if (currentStage === 1) return ["description", "account"];
    if (currentStage === 2) return ["description"];
    return [];
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (currentStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowOutput(true);
        setIsPlaying(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, isPlaying]);

  const handleStart = () => {
    setCurrentStage(0);
    setIsPlaying(true);
    setShowOutput(false);
  };

  const handleReset = () => {
    setCurrentStage(-1);
    setIsPlaying(false);
    setShowOutput(false);
  };

  const highlightedFields = getHighlightedFields();
  const currentData = getCurrentData();

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            Live Demo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            See the <span className="text-gradient">Magic</span> in Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how ClearlyLedger transforms raw bank statements into clean, standardized data
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={handleStart} 
            disabled={isPlaying}
            variant="glow"
            size="lg"
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {currentStage === -1 ? "Start Demo" : "Restart"}
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline"
            size="lg"
            className="gap-2"
            disabled={currentStage === -1}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Pipeline Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass-card p-4 sm:p-6">
            <div className="flex flex-wrap justify-between gap-2 sm:gap-4">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index === currentStage;
                const isCompleted = index < currentStage;
                const isPending = index > currentStage;

                return (
                  <div 
                    key={stage.label}
                    className={`
                      flex-1 min-w-[80px] flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-500
                      ${isActive ? 'glass-card-strong scale-105' : ''}
                      ${isCompleted ? 'opacity-60' : ''}
                      ${isPending ? 'opacity-30' : ''}
                    `}
                  >
                    <div
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500
                        ${isActive || isCompleted 
                          ? `bg-gradient-to-br ${stage.color}` 
                          : 'bg-muted border border-border'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive || isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-xs font-medium text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </span>
                    {isActive && (
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-100" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] transition-all duration-500 ease-out"
                style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
              />
            </div>

            {/* Stage description */}
            {currentStage >= 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in">
                {stages[currentStage]?.description}
              </p>
            )}
          </div>
        </div>

        {/* Data Preview */}
        <div className="max-w-5xl mx-auto">
          <div className="glass-card overflow-hidden">
            {/* Table Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-primary/80" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {currentStage === -1 ? "sample_statement.pdf" : 
                   currentStage < 2 ? "Processing..." : 
                   showOutput ? "output_ready.csv" : "Verifying..."}
                </span>
              </div>
              {showOutput && (
                <Button size="sm" variant="ghost" className="gap-2 text-primary">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              )}
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Debit</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Credit</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, index) => (
                    <tr 
                      key={index}
                      className={`
                        border-b border-border/30 transition-all duration-500
                        ${currentStage >= 0 ? 'animate-fade-in' : ''}
                      `}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="p-3 text-foreground font-mono text-xs">{row.date}</td>
                      <td className={`p-3 transition-colors duration-300 ${
                        highlightedFields.includes("description") ? 'text-primary font-medium' : 'text-foreground'
                      }`}>
                        {row.description}
                      </td>
                      <td className={`p-3 text-right font-mono ${row.debit ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {row.debit || "—"}
                      </td>
                      <td className={`p-3 text-right font-mono ${row.credit ? 'text-primary' : 'text-muted-foreground'}`}>
                        {row.credit || "—"}
                      </td>
                      <td className="p-3 text-right font-mono text-foreground font-medium">{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Validation Result */}
            {showOutput && (
              <div className="p-4 border-t border-border/50 bg-primary/5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Validation Passed</p>
                      <p className="text-xs text-muted-foreground">
                        Opening Balance + Credits − Debits = Closing Balance ✓
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">5 transactions</p>
                    <p className="text-xs text-muted-foreground">Ready for export</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {currentStage === -1 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Click "Start Demo" to see the processing pipeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;

import { Sparkles, CheckSquare, ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const TEAL = "#0C8A5D";

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "AI-powered universal parsing",
    description:
      "Our AI reads and understands bank statement layouts from any bank, in any country, in any language — automatically. No manual setup, no bank list to check.",
  },
  {
    number: "02",
    icon: CheckSquare,
    title: "Confidence verification on every row",
    description:
      "Every extracted row is scored for confidence. Any row below our threshold is automatically re-examined and corrected by the AI before it reaches your spreadsheet.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Balance reconciliation on every conversion",
    description:
      "Every conversion runs a final check: opening balance + credits − debits = closing balance. You get a VERIFIED / DISCREPANCY / FAILED status before you download — never after.",
  },
];

const AccuracySection = () => {
  return (
    <section
      id="accuracy"
      aria-labelledby="accuracy-heading"
      className="py-20 sm:py-24 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2
            id="accuracy-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-foreground"
          >
            99% accuracy. Every bank. Every language. Powered by AI.
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex flex-col items-start text-left"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-display text-sm font-bold tracking-wider"
                    style={{ color: TEAL }}
                  >
                    Step {step.number}
                  </span>
                </div>
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${TEAL}1A` }}
                >
                  <Icon className="w-5 h-5" style={{ color: TEAL }} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto mt-12 sm:mt-16 text-center space-y-4">
          <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
            The result: 99%+ accuracy on any bank statement from any country —
            with a clear verification status on every single conversion.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Works with any bank worldwide — major nationals, regional banks,
            credit unions, and Islamic banks — in any language including Arabic,
            Hindi, Chinese, French, Spanish, and more.
          </p>
          <p
            className="flex items-center justify-center gap-1.5 text-[13px] leading-relaxed"
            style={{ color: "#9C9A92" }}
          >
            <Lock className="w-3 h-3" aria-hidden="true" />
            <span>
              Your statement is processed in memory and permanently deleted the
              moment conversion completes. We{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                never store your transactions
              </Link>
              .
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AccuracySection;

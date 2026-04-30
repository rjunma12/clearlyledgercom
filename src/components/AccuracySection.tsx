import { Grid3x3, Sparkles, ShieldCheck } from "lucide-react";

const TEAL = "#1D9E75";

const steps = [
  {
    number: "01",
    icon: Grid3x3,
    title: "Rule-based engine",
    description:
      "Every supported bank has a precision parsing profile built from real statement data. Column positions, date formats, and layout rules are mapped exactly — no guessing.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI verification layer",
    description:
      "When any row falls below our confidence threshold, our AI layer steps in to verify and correct it. The same row that would silently fail in a basic converter gets caught, fixed, and flagged.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Balance verification on every conversion",
    description:
      "Every conversion runs a final balance check: opening balance + credits − debits = closing balance. If the numbers don't reconcile, we tell you before you download — never after.",
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
            Built for accuracy, not just speed.
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

        <div className="max-w-3xl mx-auto mt-12 sm:mt-16 text-center">
          <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
            The result: 99%+ accuracy on supported banks, with a{" "}
            <span style={{ color: TEAL }}>VERIFIED</span> /{" "}
            <span className="text-amber-500">DISCREPANCY</span> /{" "}
            <span className="text-destructive">FAILED</span> status on every
            conversion so you always know where you stand.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AccuracySection;

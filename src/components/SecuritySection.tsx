import { Shield, Eye, Trash2, Lock } from "lucide-react";

const securityFeatures = [
  {
    icon: Eye,
    title: "PII Anonymization",
    description: "Names are replaced with placeholders, account numbers are masked. We never see your sensitive data.",
  },
  {
    icon: Trash2,
    title: "Auto-Delete",
    description: "Uploaded files are automatically deleted within 24 hours. You can also delete manually at any time.",
  },
  {
    icon: Lock,
    title: "Encrypted Transit",
    description: "All data is encrypted in transit using TLS 1.3. Files never touch unencrypted storage.",
  },
  {
    icon: Shield,
    title: "No Data Retention",
    description: "Only anonymized metadata patterns are retained to improve parsing. Your actual data is never stored.",
  },
];

const SecuritySection = () => {
  return (
    <section id="security" className="py-24 relative bg-surface-elevated/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Security & Privacy
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
                Privacy-First by Design
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We built ClearlyLedger with financial compliance in mind. Your client data 
                stays protected at every step of the process.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="glass-card p-4 group hover:bg-glass/70 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="glass-card p-8 glow-primary-subtle">
                <div className="space-y-4">
                  {/* Simulated processing view */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">PII Scrubbing Active</div>
                        <div className="text-xs text-muted-foreground">Processing document...</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>

                  {/* Before/After comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Before</div>
                      <div className="space-y-1.5 text-sm">
                        <div className="text-foreground">John D. Smith</div>
                        <div className="text-foreground">XXXX-XXXX-4521</div>
                        <div className="text-foreground">123 Main Street</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="text-xs text-primary mb-2 uppercase tracking-wider">After</div>
                      <div className="space-y-1.5 text-sm">
                        <div className="text-foreground">CUSTOMER_001</div>
                        <div className="text-foreground">****-****-****</div>
                        <div className="text-foreground">[ADDRESS_MASKED]</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>End-to-end encryption enabled</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[hsl(185,84%,45%)]/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;

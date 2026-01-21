import { Globe, Scale, Shield } from "lucide-react";

const AdvantagesSection = () => {
  const advantages = [
    {
      icon: Globe,
      title: "Multi-region supported",
      description: "Works with bank statements from multiple countries and formats.",
    },
    {
      icon: Scale,
      title: "Balance verified",
      description: "Opening and closing balances are automatically checked for accuracy.",
    },
    {
      icon: Shield,
      title: "Privacy-first processing",
      description: "Files are processed securely and deleted automatically after conversion.",
    },
  ];

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {advantages.map((advantage, index) => (
            <div 
              key={index} 
              className="glass-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <advantage.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {advantage.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;

import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for solo devs and small projects",
    features: [
      "3 React sites",
      "50 pages crawled",
      "Basic AI extraction",
      "CMS editor",
      "API access",
      "Community support",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For teams managing multiple client sites",
    features: [
      "Unlimited sites",
      "Unlimited pages",
      "Advanced AI models",
      "Visual block editor",
      "Version history (90 days)",
      "Role-based access",
      "Priority support",
      "Webhooks & API",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$199",
    period: "per month",
    description: "White-label for agencies and enterprises",
    features: [
      "Everything in Pro",
      "White-label dashboard",
      "Custom domains",
      "SSO & SAML",
      "Audit logs",
      "Dedicated support",
      "SLA guarantee",
      "Custom AI models",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/25 bg-cyan/5 text-cyan text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            Pricing
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent
            <br />
            <span className="gradient-text">SaaS Pricing</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlight
                  ? "border-cyan/50 bg-gradient-card glow-border-cyan shadow-glow"
                  : "border-border/50 bg-gradient-card"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-primary text-primary-foreground text-xs font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-foreground text-lg mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-4xl text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-cyan flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link to="/dashboard">
                <Button
                  className={`w-full font-semibold ${
                    plan.highlight
                      ? "bg-gradient-primary text-primary-foreground hover:opacity-90"
                      : "variant-outline border-border/60 text-foreground hover:border-cyan/30"
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

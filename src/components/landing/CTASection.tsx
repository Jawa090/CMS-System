import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-60 pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="rounded-3xl border border-cyan/20 bg-gradient-card p-16 glow-border-cyan shadow-elevated">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 glow-cyan float">
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ready to Transform Your
            <br />
            <span className="gradient-text">React App into a CMS?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join developers and agencies already using ReactCMS to manage content at scale. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-primary text-primary-foreground font-semibold px-10 py-6 text-base glow-cyan hover:opacity-90 group"
              >
                Launch Your CMS Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground px-10 py-6 text-base">
              Read the Docs →
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Free tier includes 3 sites • No credit card • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

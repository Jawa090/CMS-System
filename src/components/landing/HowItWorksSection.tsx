import { Globe, ScanSearch, BrainCircuit, LayoutTemplate, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Globe,
    title: "Input Your React URL",
    description: "Paste your React app URL (localhost or production). ReactCMS handles SPA routing, auth-free pages, and dynamic routes.",
    color: "text-cyan",
    glow: "shadow-glow",
  },
  {
    step: "02",
    icon: ScanSearch,
    title: "AI Crawls & Maps Pages",
    description: "Playwright headless browser renders each page, captures DOM snapshots, discovers all routes, and extracts raw content structure.",
    color: "text-blue-accent",
    glow: "shadow-[0_0_30px_hsl(210_100%_60%/0.25)]",
  },
  {
    step: "03",
    icon: BrainCircuit,
    title: "Component Detection",
    description: "AST analysis + AI segments the page into reusable components: Navbar, Hero, Features, Footer, Forms, Tables, and custom blocks.",
    color: "text-purple-accent",
    glow: "shadow-[0_0_30px_hsl(265_80%_65%/0.25)]",
  },
  {
    step: "04",
    icon: LayoutTemplate,
    title: "CMS Schema Generated",
    description: "Each content block becomes an editable schema field. Text, images, links, metadata — all auto-classified and made editable.",
    color: "text-green-accent",
    glow: "shadow-[0_0_30px_hsl(150_80%_45%/0.25)]",
  },
  {
    step: "05",
    icon: Rocket,
    title: "Edit & Publish Live",
    description: "Admin dashboard lets your team edit content visually. Changes sync to frontend instantly via API — no redeploy needed.",
    color: "text-orange-accent",
    glow: "shadow-[0_0_30px_hsl(30_100%_55%/0.25)]",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan/3 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/25 bg-cyan/5 text-cyan text-xs font-medium mb-4">
            System Flow
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            From URL to CMS in
            <br />
            <span className="gradient-text">5 Automated Steps</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-cyan/40 via-border/30 to-transparent -translate-x-1/2" />

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-1 lg:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.step}
                className={`relative flex flex-col lg:flex-row items-start gap-6 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content card */}
                <div className={`flex-1 ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                  <div className={`inline-block rounded-xl border border-border/50 bg-gradient-card p-6 hover:border-cyan/25 transition-all group ${step.glow} hover:shadow-current`}>
                    <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? "lg:flex-row-reverse" : ""}`}>
                      <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border/50`}>
                        <step.icon className={`w-5 h-5 ${step.color}`} />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">STEP {step.step}</span>
                    </div>
                    <h3 className="font-display font-bold text-foreground text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden lg:flex w-6 flex-shrink-0 items-center justify-center mt-6">
                  <div className={`w-4 h-4 rounded-full border-2 border-current ${step.color} bg-background pulse-cyan`} />
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

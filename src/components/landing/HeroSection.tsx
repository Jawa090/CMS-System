import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Globe, Cpu, Terminal } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 z-10 bg-background/75" />
      <div className="absolute inset-0 z-11 grid-overlay opacity-40" />
      <div className="absolute inset-0 z-12 bg-gradient-glow" />
      <div className="absolute inset-0 z-13 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan/40"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-sm font-medium mb-8 animate-fade-up">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered React CMS Platform
          <span className="px-2 py-0.5 bg-cyan/15 rounded-full text-xs">v1.0</span>
        </div>

        <h1
          className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Turn Any React App Into
          <br />
          <span className="gradient-text glow-text-cyan">An Editable CMS</span>
          <br />
          <span className="text-foreground/70">In Minutes</span>
        </h1>

        <p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          ReactCMS crawls your React website, uses AI to detect components and content blocks,
          then auto-generates a full admin dashboard — no code changes required.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link to="/dashboard">
            <Button
              size="lg"
              className="bg-gradient-primary text-primary-foreground font-semibold px-8 py-6 text-base glow-cyan hover:opacity-90 transition-all group"
            >
              Open Dashboard
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="border-border/60 text-muted-foreground hover:text-foreground hover:border-cyan/40 px-8 py-6 text-base group"
          >
            <Play className="mr-2 w-4 h-4 text-cyan" />
            Watch Demo
          </Button>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { icon: Globe, value: "500+", label: "Sites Analyzed" },
            { icon: Cpu, value: "AI-First", label: "Component Detection" },
            { icon: Terminal, value: "NestJS", label: "Production Backend" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-cyan" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* URL Input preview */}
        <div className="mt-16 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="relative rounded-2xl border border-border/50 bg-gradient-card p-1 glow-border-cyan shadow-elevated">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-orange-accent/60" />
                <div className="w-3 h-3 rounded-full bg-green-accent/60" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 border border-border/40">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono">https://your-react-app.com</span>
                <span className="ml-auto animate-pulse w-0.5 h-4 bg-cyan rounded-full" />
              </div>
              <div className="px-4 py-2 bg-gradient-primary rounded-lg text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90">
                Crawl
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

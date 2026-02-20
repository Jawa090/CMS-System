import {
  Globe2, BrainCircuit, LayoutTemplate, Shield, History, Eye,
  Search, Wand2, BarChart3, GitBranch, Layers, Zap
} from "lucide-react";

const features = [
  {
    icon: Globe2,
    title: "Smart React Crawler",
    description: "Headless browser crawls all routes including dynamic paths, lazy-loaded pages, and SPA transitions.",
    color: "text-cyan",
    bg: "bg-cyan/10",
    border: "border-cyan/20",
  },
  {
    icon: BrainCircuit,
    title: "AI Component Detection",
    description: "AST parsing + AI identifies reusable components, layout blocks, and content regions automatically.",
    color: "text-blue-accent",
    bg: "bg-blue-accent/10",
    border: "border-blue-accent/20",
  },
  {
    icon: LayoutTemplate,
    title: "Visual CMS Editor",
    description: "Builder.io-style inline editing with live preview. Edit text, images, and components visually.",
    color: "text-purple-accent",
    bg: "bg-purple-accent/10",
    border: "border-purple-accent/20",
  },
  {
    icon: Search,
    title: "SEO Meta Editor",
    description: "Extract and edit all meta tags, Open Graph, Twitter cards, and structured data per page.",
    color: "text-green-accent",
    bg: "bg-green-accent/10",
    border: "border-green-accent/20",
  },
  {
    icon: History,
    title: "Version History",
    description: "Every change is versioned. Roll back to any previous state with one click.",
    color: "text-orange-accent",
    bg: "bg-orange-accent/10",
    border: "border-orange-accent/20",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "Real-time preview of changes before publishing. Split-screen editor and preview mode.",
    color: "text-cyan",
    bg: "bg-cyan/10",
    border: "border-cyan/20",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Admin, Editor, Viewer roles. Granular permissions per page and content block.",
    color: "text-blue-accent",
    bg: "bg-blue-accent/10",
    border: "border-blue-accent/20",
  },
  {
    icon: BarChart3,
    title: "Page Analytics",
    description: "Track views, edits, and publishing frequency. Built-in performance insights.",
    color: "text-purple-accent",
    bg: "bg-purple-accent/10",
    border: "border-purple-accent/20",
  },
  {
    icon: Zap,
    title: "API-First Architecture",
    description: "RESTful + GraphQL API. Integrate CMS content anywhere via webhooks and SDK.",
    color: "text-green-accent",
    bg: "bg-green-accent/10",
    border: "border-green-accent/20",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/25 bg-cyan/5 text-cyan text-xs font-medium mb-4">
            <Layers className="w-3 h-3" />
            Full-Stack AI CMS
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to
            <br />
            <span className="gradient-text">Manage Any React App</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From crawling to editing to publishing — a complete CMS pipeline powered by AI.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className="group relative rounded-xl border border-border/50 bg-gradient-card p-6 hover:border-cyan/25 hover:shadow-glow transition-all duration-300 cursor-default"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className={`w-10 h-10 rounded-lg ${feat.bg} border ${feat.border} flex items-center justify-center mb-4`}>
                <feat.icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

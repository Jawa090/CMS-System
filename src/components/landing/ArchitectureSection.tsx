import { Database, Server, Globe, Cpu, LayoutDashboard, Zap } from "lucide-react";

const layers = [
  {
    label: "Frontend",
    color: "border-cyan/40 bg-cyan/5",
    textColor: "text-cyan",
    items: ["React + Vite", "TailwindCSS", "Shadcn UI", "Zustand State"],
    icon: Globe,
  },
  {
    label: "CMS Dashboard",
    color: "border-blue-accent/40 bg-blue-accent/5",
    textColor: "text-blue-accent",
    items: ["Visual Editor", "Page Manager", "SEO Panel", "Version Control"],
    icon: LayoutDashboard,
  },
  {
    label: "AI Layer",
    color: "border-purple-accent/40 bg-purple-accent/5",
    textColor: "text-purple-accent",
    items: ["Component Detection", "Content Segmentation", "Schema Generation", "Semantic Grouping"],
    icon: Cpu,
  },
  {
    label: "Backend",
    color: "border-green-accent/40 bg-green-accent/5",
    textColor: "text-green-accent",
    items: ["NestJS API", "Playwright Crawler", "AST Parser", "Redis Cache"],
    icon: Server,
  },
  {
    label: "Data Layer",
    color: "border-orange-accent/40 bg-orange-accent/5",
    textColor: "text-orange-accent",
    items: ["PostgreSQL", "Prisma ORM", "File Storage", "CDN Assets"],
    icon: Database,
  },
];

export const ArchitectureSection = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 grid-overlay opacity-15" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/25 bg-cyan/5 text-cyan text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            System Architecture
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Production-Grade
            <br />
            <span className="gradient-text">SaaS Architecture</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Built to scale from your first crawl to millions of content updates.
          </p>
        </div>

        {/* Architecture layers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {layers.map((layer) => (
            <div
              key={layer.label}
              className={`rounded-xl border p-5 ${layer.color} hover:scale-105 transition-transform duration-200`}
            >
              <div className="flex items-center gap-2 mb-4">
                <layer.icon className={`w-4 h-4 ${layer.textColor}`} />
                <span className={`font-display font-semibold text-sm ${layer.textColor}`}>{layer.label}</span>
              </div>
              <ul className="space-y-2">
                {layer.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={`w-1 h-1 rounded-full ${layer.textColor.replace("text-", "bg-")}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Data flow arrows */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-gradient-primary" />
            <span>Data Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-border border-dashed" />
            <span>API Calls</span>
          </div>
        </div>
      </div>
    </section>
  );
};

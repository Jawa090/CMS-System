import { Zap } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">
              React<span className="text-cyan">CMS</span>
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            {["Privacy", "Terms", "Docs", "API", "Status"].map((link) => (
              <a key={link} href="#" className="hover:text-foreground transition-colors">
                {link}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 ReactCMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

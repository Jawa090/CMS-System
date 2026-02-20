import { Bell, Search, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background/50 backdrop-blur-sm">
      <div>
        <h1 className="font-display font-semibold text-foreground text-base">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            className="pl-8 h-8 text-sm w-52 bg-secondary/50 border-border/50 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
          />
        </div>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground relative">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan" />
        </Button>
      </div>
    </header>
  );
};

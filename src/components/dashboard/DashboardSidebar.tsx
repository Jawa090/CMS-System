import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Globe, FileText, Settings, History,
  BarChart3, Users, Search, Zap, ChevronRight
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Globe, label: "Crawler", path: "/dashboard/crawler" },
  { icon: FileText, label: "Pages", path: "/dashboard/pages" },
  { icon: Search, label: "SEO Editor", path: "/dashboard/seo" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: History, label: "Versions", path: "/dashboard/versions" },
  { icon: Users, label: "Team", path: "/dashboard/team" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-sidebar-foreground">
              React<span className="text-cyan">CMS</span>
            </div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Site selector */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent border border-sidebar-border/50 cursor-pointer hover:border-cyan/30 transition-colors">
          <div className="w-5 h-5 rounded bg-gradient-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-sidebar-foreground truncate">myapp.vercel.app</div>
            <div className="text-xs text-muted-foreground">Last crawled 2m ago</div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive
                  ? "bg-cyan/10 text-cyan border border-cyan/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyan" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"}`} />
              {label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-sidebar-foreground">Admin User</div>
            <div className="text-xs text-muted-foreground">admin@reactcms.io</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

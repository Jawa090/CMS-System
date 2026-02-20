import { useState, useEffect } from "react";
import { Globe, FileText, Cpu, TrendingUp, Clock, CheckCircle2, AlertCircle, Activity, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPages: 0,
    totalComponents: 0,
    totalBlocks: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load projects with stats
      const projectsData = await api.get('/projects');
      setProjects(projectsData);
      
      // Calculate totals
      const totals = projectsData.reduce((acc: any, project: any) => {
        acc.totalPages += project._count?.pages || 0;
        acc.totalCrawlJobs += project._count?.crawlJobs || 0;
        return acc;
      }, { totalPages: 0, totalCrawlJobs: 0 });
      
      setStats({
        totalProjects: projectsData.length,
        totalPages: totals.totalPages,
        totalComponents: totals.totalPages * 5, // Estimate: 5 components per page
        totalBlocks: totals.totalPages * 50, // Estimate: 50 blocks per page
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      label: "Projects", 
      value: stats.totalProjects.toString(), 
      icon: Globe, 
      change: `${projects.length} active`, 
      color: "text-cyan", 
      bg: "bg-cyan/10", 
      border: "border-cyan/20" 
    },
    { 
      label: "Pages Crawled", 
      value: stats.totalPages.toString(), 
      icon: FileText, 
      change: "Ready to edit", 
      color: "text-blue-accent", 
      bg: "bg-blue-accent/10", 
      border: "border-blue-accent/20" 
    },
    { 
      label: "Components", 
      value: stats.totalComponents.toString(), 
      icon: Cpu, 
      change: "Auto-detected", 
      color: "text-purple-accent", 
      bg: "bg-purple-accent/10", 
      border: "border-purple-accent/20" 
    },
    { 
      label: "Content Blocks", 
      value: stats.totalBlocks.toString(), 
      icon: TrendingUp, 
      change: "Editable fields", 
      color: "text-green-accent", 
      bg: "bg-green-accent/10", 
      border: "border-green-accent/20" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className={`rounded-xl border ${stat.border} bg-gradient-card p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className={`font-display font-bold text-2xl text-foreground mb-0.5`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            <div className={`text-xs ${stat.color} mt-1`}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Projects List */}
      <div className="rounded-xl border border-border/50 bg-gradient-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h3 className="font-display font-semibold text-foreground text-sm">Your Projects</h3>
          <Link to="/dashboard/crawler" className="text-xs text-cyan hover:text-cyan-glow transition-colors">
            + Add Project
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display font-semibold text-foreground mb-2">No Projects Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by crawling your first website
            </p>
            <Link to="/dashboard/crawler">
              <button className="px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold">
                Start Crawling
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{project.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{project.siteUrl}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-medium text-foreground">{project._count?.pages || 0}</div>
                    <div className="text-xs text-muted-foreground">pages</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    project.isActive ? "bg-green-accent/10 text-green-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    {project.isActive ? "Active" : "Inactive"}
                  </span>
                  <Link 
                    to={`/dashboard/pages?projectId=${project.id}`} 
                    className="text-xs text-cyan opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Pages →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/dashboard/crawler" className="rounded-xl border border-border/50 bg-gradient-card p-5 hover:border-cyan/30 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center mb-3">
            <Globe className="w-5 h-5 text-cyan" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">Crawl Website</h3>
          <p className="text-xs text-muted-foreground">Discover and analyze pages</p>
        </Link>
        
        <Link to="/dashboard/pages" className="rounded-xl border border-border/50 bg-gradient-card p-5 hover:border-blue-accent/30 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-blue-accent/10 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-blue-accent" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">Edit Pages</h3>
          <p className="text-xs text-muted-foreground">Manage content blocks</p>
        </Link>
        
        <Link to="/dashboard/seo" className="rounded-xl border border-border/50 bg-gradient-card p-5 hover:border-purple-accent/30 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-purple-accent/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-purple-accent" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">SEO Settings</h3>
          <p className="text-xs text-muted-foreground">Optimize meta tags</p>
        </Link>
      </div>
    </div>
  );
};

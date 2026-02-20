import { Outlet, useLocation } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { CrawlerPanel } from "@/components/dashboard/CrawlerPanel";
import { PagesList } from "@/components/dashboard/PagesList";
import { ContentEditor } from "@/components/dashboard/ContentEditor";
import SEOManager from "@/components/dashboard/SEOManager";
import { ProjectSettings } from "@/components/dashboard/ProjectSettings";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const headerMap: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Overview", subtitle: "All sites and activity at a glance" },
  "/dashboard/crawler": { title: "Crawler", subtitle: "Crawl and analyze your React site" },
  "/dashboard/pages": { title: "Pages", subtitle: "Browse and edit all detected pages" },
  "/dashboard/editor": { title: "Content Editor", subtitle: "Edit page content and components" },
  "/dashboard/seo": { title: "SEO Editor", subtitle: "Manage meta tags and search optimization" },
  "/dashboard/settings": { title: "Project Settings", subtitle: "Configure project URLs and settings" },
  "/dashboard/analytics": { title: "Analytics", subtitle: "Page views and content performance" },
  "/dashboard/versions": { title: "Version History", subtitle: "Rollback to any previous state" },
  "/dashboard/team": { title: "Team", subtitle: "Manage roles and access" },
};

const Dashboard = () => {
  const location = useLocation();
  const meta = headerMap[location.pathname] ?? { title: "Dashboard", subtitle: "" };
  const [currentProjectId, setCurrentProjectId] = useState<string>('');

  useEffect(() => {
    // Load the first project ID
    const loadProject = async () => {
      try {
        const response = await axios.get(`${API_URL}/projects`);
        if (response.data && response.data.length > 0) {
          setCurrentProjectId(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    };
    loadProject();
  }, []);

  const renderContent = () => {
    switch (location.pathname) {
      case "/dashboard":
        return <DashboardOverview />;
      case "/dashboard/crawler":
        return <CrawlerPanel />;
      case "/dashboard/pages":
        return <PagesList />;
      case "/dashboard/editor":
        return <ContentEditor />;
      case "/dashboard/seo":
        return currentProjectId ? <SEOManager projectId={currentProjectId} /> : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading project...</p>
          </div>
        );
      case "/dashboard/settings":
        return <ProjectSettings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-2">Coming Soon</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              This section is under development. We're building it fast — check back soon.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

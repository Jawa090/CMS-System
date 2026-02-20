import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Search, Loader2, CheckCircle2, ChevronRight, AlertCircle, FileCode, Cpu, LayoutTemplate, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const crawlSteps = [
  { id: 1, label: "Discovering routes", icon: Search, done: true, detail: "Found 42 routes" },
  { id: 2, label: "Rendering pages", icon: Globe, done: true, detail: "Headless browser rendering" },
  { id: 3, label: "Extracting DOM structure", icon: FileCode, done: true, detail: "142 pages parsed" },
  { id: 4, label: "AI component detection", icon: Cpu, done: false, current: true, detail: "Detecting React components..." },
  { id: 5, label: "Generating CMS schema", icon: LayoutTemplate, done: false, detail: "Pending" },
];

const discoveredRoutes = [
  { path: "/", title: "Home", components: 8, status: "done" },
  { path: "/about", title: "About Us", components: 5, status: "done" },
  { path: "/features", title: "Features", components: 12, status: "done" },
  { path: "/pricing", title: "Pricing", components: 6, status: "done" },
  { path: "/blog", title: "Blog Index", components: 9, status: "analyzing" },
  { path: "/blog/:slug", title: "Blog Post (dynamic)", components: 7, status: "pending" },
  { path: "/contact", title: "Contact", components: 4, status: "pending" },
  { path: "/dashboard/*", title: "Dashboard (auth)", components: 0, status: "skipped" },
];

export const CrawlerPanel = () => {
  const [url, setUrl] = useState("http://localhost:8081/");
  const [projectName, setProjectName] = useState("My Website");
  const [crawling, setCrawling] = useState(false);
  const [crawled, setCrawled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [crawlStatus, setCrawlStatus] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [crawledPages, setCrawledPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-select first project only if there's exactly one project
  useEffect(() => {
    if (projects.length === 1) {
      setSelectedProject(projects[0].id);
      if (projects[0].siteUrl) {
        setUrl(projects[0].siteUrl);
      }
      setProjectName(projects[0].name);
    } else if (projects.length === 0) {
      setSelectedProject("");
    }
  }, [projects]);

  // Poll crawl status
  useEffect(() => {
    if (!currentJobId || !crawling) return;

    const interval = setInterval(async () => {
      try {
        const status = await api.get(`/crawler/jobs/${currentJobId}/status`);
        setCrawlStatus(status);
        
        const total = status.maxPages || 100;
        const crawled = status.pagesCrawled || 0;
        const newProgress = Math.min((crawled / total) * 100, 95);
        setProgress(newProgress);

        if (status.status === 'COMPLETED') {
          setProgress(100);
          setCrawling(false);
          setCrawled(true);
          clearInterval(interval);
          toast({
            title: "Crawl Completed!",
            description: `Successfully crawled ${status.pagesCrawled} pages`,
          });
          // Auto-load crawled pages
          if (status.pagesCrawled > 0) {
            setTimeout(() => loadCrawledPages(), 1000);
          }
        } else if (status.status === 'FAILED') {
          setCrawling(false);
          clearInterval(interval);
          toast({
            title: "Crawl Failed",
            description: status.errors?.[0]?.message || "Unknown error",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Status check failed:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentJobId, crawling]);

  const loadProjects = async () => {
    try {
      const data = await api.get('/projects');
      setProjects(data);
      // Don't auto-select - let user choose
    } catch (error: any) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadCrawledPages = async () => {
    if (!currentJobId) return;
    
    try {
      setLoadingPages(true);
      const pages = await api.get(`/crawler/jobs/${currentJobId}/pages`);
      setCrawledPages(pages);
      toast({
        title: "Pages Loaded",
        description: `Loaded ${pages.length} crawled pages`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Load Pages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingPages(false);
    }
  };

  const handleCrawl = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setCrawling(true);
      setCrawled(false);
      setProgress(0);

      // Create or use existing project
      let projectId = selectedProject;
      
      if (!projectId) {
        // Create new project with the crawl URL
        const project = await api.post('/projects', {
          name: projectName,
          siteUrl: url, // Automatically set from crawl URL
          description: `Crawled from ${url}`,
        });
        projectId = project.id;
        setSelectedProject(projectId);
        await loadProjects();
      } else {
        // Update existing project's siteUrl with the crawl URL
        await api.put(`/projects/${projectId}`, {
          siteUrl: url, // Update URL automatically
        });
        toast({
          title: "Project URL Updated",
          description: `Preview will now use ${url}`,
        });
      }

      // Start crawl
      const crawlJob = await api.post('/crawler/start', {
        projectId,
        url,
        maxDepth: 3,
        maxPages: 50,
      });

      setCurrentJobId(crawlJob.crawlJobId);
      
      toast({
        title: "Crawl Started",
        description: "Your website is being crawled...",
      });
    } catch (error: any) {
      setCrawling(false);
      toast({
        title: "Crawl Failed",
        description: error.message || "Failed to start crawl",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* URL Input */}
      <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
        <h3 className="font-display font-semibold text-foreground mb-1">Crawl a New Site</h3>
        <p className="text-sm text-muted-foreground mb-5">Enter your React app URL. Localhost and production URLs both work.</p>

        {/* Project Selection */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-2 block font-medium">
            {projects.length > 0 ? 'Select Project or Create New' : 'Create Your First Project'}
          </label>
          {projects.length > 0 ? (
            <select
              value={selectedProject}
              onChange={(e) => {
                const projectId = e.target.value;
                setSelectedProject(projectId);
                // Auto-fill URL from selected project
                if (projectId) {
                  const project = projects.find(p => p.id === projectId);
                  if (project?.siteUrl) {
                    setUrl(project.siteUrl);
                  }
                  setProjectName(project.name);
                } else {
                  setProjectName("My Website");
                  setUrl("http://localhost:8081/");
                }
              }}
              className="w-full px-3 py-2 bg-secondary/50 border border-border/60 rounded-lg text-sm focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
            >
              <option value="">➕ Create New Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name} {p.siteUrl ? `• ${p.siteUrl}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-cyan/5 border border-cyan/20 rounded-lg">
              <p className="text-xs text-cyan">No projects yet. Enter details below to create your first project.</p>
            </div>
          )}
        </div>

        {/* Project Name (if creating new) */}
        {!selectedProject && (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
              New Project Name
            </label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Website"
              className="bg-secondary/50 border-border/60 text-sm focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
            />
          </div>
        )}

        {/* Show selected project info */}
        {selectedProject && (
          <div className="mb-4 p-3 bg-secondary/30 border border-border/40 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Crawling to existing project:</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {projects.find(p => p.id === selectedProject)?.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedProject("");
                  setProjectName("My Website");
                  setUrl("http://localhost:8081/");
                }}
                className="text-xs text-cyan hover:text-cyan/80"
              >
                Create New Instead
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8081/ or https://your-site.com"
              className="pl-10 bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleCrawl}
            disabled={crawling || !url}
            className="bg-gradient-primary text-primary-foreground font-semibold px-6 hover:opacity-90 transition-opacity"
          >
            {crawling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Crawling...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Crawl
              </>
            )}
          </Button>
        </div>

        {/* Info Message */}
        <div className="mt-3 p-3 bg-cyan/5 border border-cyan/20 rounded-lg">
          <p className="text-xs text-cyan flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>This URL will be used for live preview in the content editor</span>
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
          {[
            "✓ Detect dynamic routes",
            "✓ Render JavaScript",
            "✓ Follow redirects",
            "✓ Skip auth pages",
            "✓ AI component scan",
          ].map((opt) => (
            <span key={opt} className="text-cyan/70">{opt}</span>
          ))}
        </div>
      </div>

      {/* Progress */}
      {(crawling || crawled) && crawlStatus && (
        <div className="rounded-xl border border-border/50 bg-gradient-card p-6 scan-line">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground text-sm">Crawl Progress</h3>
            <span className="text-xs font-mono text-cyan">{Math.round(progress)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-secondary rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan">{crawlStatus.pagesFound || 0}</div>
              <div className="text-xs text-muted-foreground">Pages Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-accent">{crawlStatus.pagesCrawled || 0}</div>
              <div className="text-xs text-muted-foreground">Pages Crawled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-accent">{crawlStatus.pagesSkipped || 0}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            {crawlStatus.status === 'RUNNING' && (
              <>
                <Loader2 className="w-4 h-4 text-cyan animate-spin" />
                <span className="text-cyan">Crawling in progress...</span>
              </>
            )}
            {crawlStatus.status === 'COMPLETED' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                <span className="text-green-accent">Crawl completed successfully!</span>
              </>
            )}
            {crawlStatus.status === 'FAILED' && (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Crawl failed</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Discovered routes */}
      {crawlStatus && crawlStatus.totalCrawled > 0 && (
        <div className="rounded-xl border border-border/50 bg-gradient-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h3 className="font-display font-semibold text-foreground text-sm">Crawled Pages</h3>
            <span className="text-xs text-muted-foreground">{crawlStatus.totalCrawled} pages</span>
          </div>
          <div className="p-5">
            <Button
              onClick={loadCrawledPages}
              disabled={loadingPages}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              {loadingPages ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Pages...
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4 mr-2" />
                  View Crawled Pages
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Crawled Pages List */}
      {crawledPages.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-gradient-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h3 className="font-display font-semibold text-foreground text-sm">Discovered Pages</h3>
            <span className="text-xs text-muted-foreground">{crawledPages.length} found</span>
          </div>
          <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
            {crawledPages.map((page: any) => (
              <div key={page.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/20 transition-colors group">
                <div className="font-mono text-xs text-cyan flex-shrink-0 w-48 truncate" title={page.path}>
                  {page.path}
                </div>
                <div className="flex-1 text-sm text-foreground truncate" title={page.title}>
                  {page.title || 'Untitled'}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {page.images?.length || 0} images
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 bg-green-accent/10 text-green-accent">
                  {page.statusCode}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          
          {/* View All Pages Button */}
          <div className="px-5 py-4 border-t border-border/50 bg-secondary/20">
            <Button
              onClick={() => navigate(`/dashboard/pages?projectId=${selectedProject}`)}
              className="w-full bg-gradient-primary text-primary-foreground font-semibold"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              View All Pages & Edit Content
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

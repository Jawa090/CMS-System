import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit3, Search, Clock, FileText, Loader2, RefreshCw, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CreatePageModal } from "./CreatePageModal";

export const PagesList = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // Check if redirected from crawler with projectId
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setSelectedProject(projectId);
      loadPages(projectId);
    } else if (selectedProject) {
      loadPages(selectedProject);
    }
  }, [searchParams, selectedProject]);

  const loadProjects = async () => {
    try {
      const data = await api.get('/projects');
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error: any) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadPages = async (projectId: string) => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Try to get pages from Pages table first
      const pagesData = await api.get(`/pages/project/${projectId}`);
      
      if (pagesData.length > 0) {
        setPages(pagesData);
      } else {
        // If no pages, try to get from latest crawl job
        const jobs = await api.get(`/crawler/jobs/${projectId}`);
        if (jobs.length > 0) {
          const latestJob = jobs[0];
          if (latestJob.status === 'COMPLETED' && latestJob._count?.crawledPages > 0) {
            const crawledPages = await api.get(`/crawler/jobs/${latestJob.id}/pages`);
            setPages(crawledPages);
            toast({
              title: "Showing Crawled Pages",
              description: `Loaded ${crawledPages.length} pages from latest crawl`,
            });
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to Load Pages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Project Selection */}
        {projects.length > 0 && (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 h-9 text-sm bg-secondary/50 border border-border/60 rounded-lg text-foreground"
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search pages..."
            className="w-full pl-8 pr-3 h-9 text-sm bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => selectedProject && loadPages(selectedProject)}
          disabled={loading || !selectedProject}
          className="border-border/60 text-muted-foreground hover:text-foreground gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedProject}
          className="bg-gradient-primary text-primary-foreground gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Page
        </Button>
        
        <div className="ml-auto text-xs text-muted-foreground">{pages.length} pages</div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-cyan" />
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-gradient-card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-display font-semibold text-foreground mb-2">No Pages Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedProject ? 'Start a crawl to discover pages' : 'Select a project to view pages'}
          </p>
          <Link to="/dashboard/crawler">
            <Button className="bg-gradient-primary">
              Go to Crawler
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Page</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Images</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Crawled</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {pages.map((page) => (
                <tr
                  key={page.id}
                  onClick={() => setSelected(selected === page.id ? null : page.id)}
                  className={`hover:bg-secondary/25 transition-colors cursor-pointer ${selected === page.id ? "bg-cyan/5 border-l-2 border-l-cyan" : ""}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground text-sm">{page.title || 'Untitled'}</div>
                    <div className="font-mono text-xs text-muted-foreground">{page.path || page.url}</div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      {page.images?.length || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      page.statusCode === 200 ? "bg-green-accent/10 text-green-accent" : 
                      page.statusCode >= 400 ? "bg-destructive/10 text-destructive" :
                      "bg-orange-accent/10 text-orange-accent"
                    }`}>
                      {page.statusCode || page.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {page.crawledAt ? new Date(page.crawledAt).toLocaleDateString() : 
                       page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-muted-foreground hover:text-cyan">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Link to={`/dashboard/editor?pageId=${page.id}`}>
                        <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-muted-foreground hover:text-cyan">
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Page Modal */}
      <CreatePageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={selectedProject}
        onSuccess={() => loadPages(selectedProject)}
      />
    </div>
  );
};

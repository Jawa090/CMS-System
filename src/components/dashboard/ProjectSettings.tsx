import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Globe, Loader2, Settings, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  siteUrl: string;
  slug: string;
  isActive: boolean;
}

export const ProjectSettings = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get('/projects');
      setProjects(data);
    } catch (error: any) {
      toast({
        title: "Failed to Load Projects",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      setSaving(projectId);
      await api.put(`/projects/${projectId}`, updates);
      
      toast({
        title: "✅ Project Updated",
        description: "Changes saved successfully!",
      });
      
      await loadProjects();
    } catch (error: any) {
      toast({
        title: "Failed to Update",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleUrlChange = (projectId: string, newUrl: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, siteUrl: newUrl } : p
    ));
  };

  const handleNameChange = (projectId: string, newName: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, name: newName } : p
    ));
  };

  const handleDescriptionChange = (projectId: string, newDesc: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, description: newDesc } : p
    ));
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will permanently delete all pages, content, and media associated with this project. This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(projectId);
      await api.delete(`/projects/${projectId}`);
      
      toast({
        title: "✅ Project Deleted",
        description: `"${projectName}" has been permanently deleted.`,
      });
      
      await loadProjects();
    } catch (error: any) {
      toast({
        title: "Failed to Delete",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-cyan" />
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Project Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your projects and site URLs</p>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Project Name
                </label>
                <Input
                  value={project.name}
                  onChange={(e) => handleNameChange(project.id, e.target.value)}
                  className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Description
                </label>
                <Input
                  value={project.description || ''}
                  onChange={(e) => handleDescriptionChange(project.id, e.target.value)}
                  placeholder="Optional description"
                  className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                />
              </div>

              {/* Site URL */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Live Site URL
                </label>
                <Input
                  value={project.siteUrl}
                  onChange={(e) => handleUrlChange(project.id, e.target.value)}
                  placeholder="https://your-site.com"
                  className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This URL will be used for live preview in the content editor
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Slug
                </label>
                <Input
                  value={project.slug}
                  disabled
                  className="bg-secondary/30 border-border/60 text-muted-foreground font-mono text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.isActive 
                      ? 'bg-green-accent/10 text-green-accent' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {project.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {project.id.substring(0, 8)}...
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => deleteProject(project.id, project.name)}
                    disabled={deleting === project.id || saving === project.id}
                    variant="destructive"
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30"
                  >
                    {deleting === project.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => updateProject(project.id, {
                      name: project.name,
                      description: project.description,
                      siteUrl: project.siteUrl,
                    })}
                    disabled={saving === project.id || deleting === project.id}
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    {saving === project.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="rounded-xl border border-border/50 bg-gradient-card p-12 text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-display font-semibold text-foreground mb-2">No Projects Found</h3>
          <p className="text-sm text-muted-foreground">
            Create a project from the crawler to get started
          </p>
        </div>
      )}
    </div>
  );
};

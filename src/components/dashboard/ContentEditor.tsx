import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, ChevronDown, ChevronRight, AlignLeft, Layers, Tag, Globe, Loader2, AlertCircle, Monitor, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface BlockState {
  [blockId: string]: string;
}

interface ContentBlockData {
  id: string;
  type: string;
  name: string;
  key: string;
  value: string;
  valueType: string;
  order: number;
  isEditable: boolean;
  component?: {
    name: string;
    type: string;
  };
}

interface PageData {
  id: string;
  path: string;
  title: string;
  projectId: string;
  contentBlocks: ContentBlockData[];
  components?: any[];
  seoMetadata?: any;
  project?: {
    siteUrl: string;
  };
}

export const ContentEditor = () => {
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [projectUrl, setProjectUrl] = useState<string>('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blockValues, setBlockValues] = useState<BlockState>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pageId) {
      loadPageData();
    }
  }, [pageId]);

  const loadPageData = async () => {
    if (!pageId) return;
    
    try {
      setLoading(true);
      const data = await api.get(`/pages/${pageId}`);
      setPageData(data);
      
      // Get project URL
      if (data.projectId) {
        const project = await api.get(`/projects/${data.projectId}`);
        setProjectUrl(project.siteUrl || 'http://localhost:3000');
      }
      
      // Initialize block values
      const initialValues: BlockState = {};
      data.contentBlocks?.forEach((block: ContentBlockData) => {
        initialValues[block.id] = block.value;
      });
      setBlockValues(initialValues);
      
      // Auto-expand first block
      if (data.contentBlocks?.length > 0) {
        setExpanded([data.contentBlocks[0].id]);
      }
      
    } catch (error: any) {
      toast({
        title: "Failed to Load Page",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateField = (blockId: string, value: string) => {
    setBlockValues((prev) => ({
      ...prev,
      [blockId]: value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!pageId || !pageData) return;
    
    try {
      setSaving(true);
      
      // Prepare bulk update payload
      const blocks = Object.entries(blockValues).map(([id, value]) => ({
        id,
        value,
      }));
      
      // Bulk update all content blocks
      await api.put(`/content-blocks/page/${pageId}/bulk`, { blocks });
      
      setSaved(true);
      toast({
        title: "Changes Saved",
        description: "All content blocks updated successfully",
      });
      
      // Refresh preview iframe if open
      if (showPreview && iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
      
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Group blocks by component
  const groupedBlocks = pageData?.contentBlocks?.reduce((acc, block) => {
    const componentName = block.component?.name || block.type || 'Other';
    if (!acc[componentName]) {
      acc[componentName] = [];
    }
    acc[componentName].push(block);
    return acc;
  }, {} as Record<string, ContentBlockData[]>) || {};

  if (!pageId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-display font-semibold text-foreground mb-2">No Page Selected</h3>
          <p className="text-sm text-muted-foreground">Please select a page from the Pages list</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
          <h3 className="font-display font-semibold text-foreground mb-2">Page Not Found</h3>
          <p className="text-sm text-muted-foreground">The requested page could not be loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Editor panel */}
      <div className={`flex flex-col overflow-hidden transition-all ${showPreview && !previewFullscreen ? 'w-1/2' : 'flex-1'}`}>
        {/* Editor toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border/50 bg-background/50 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{pageData.path}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{pageData.title}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(!showPreview)}
              className="border-border/60 text-muted-foreground hover:text-foreground gap-2 h-8"
            >
              <Monitor className="w-3.5 h-3.5" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <a 
              href={`${projectUrl.replace(/\/$/, '')}${pageData.path}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="border-border/60 text-muted-foreground hover:text-foreground gap-2 h-8">
                <Eye className="w-3.5 h-3.5" />
                Open Live
              </Button>
            </a>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className={`h-8 gap-2 font-semibold transition-all ${
                saved
                  ? "bg-green-accent/20 text-green-accent border border-green-accent/30"
                  : "bg-gradient-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content blocks */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-cyan" />
            <h3 className="font-display font-semibold text-foreground text-sm">Content Blocks</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {pageData.contentBlocks?.length || 0} blocks detected
            </span>
          </div>

          {pageData.contentBlocks?.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-gradient-card p-12 text-center">
              <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-display font-semibold text-foreground mb-2">No Content Blocks</h3>
              <p className="text-sm text-muted-foreground">
                This page doesn't have any editable content blocks yet
              </p>
            </div>
          ) : (
            Object.entries(groupedBlocks).map(([componentName, blocks]) => (
              <div key={componentName} className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                  {componentName}
                </div>
                {blocks.map((block) => {
                  const isOpen = expanded.includes(block.id);
                  const icon = block.type.toLowerCase().includes('hero') ? Layers :
                              block.type.toLowerCase().includes('nav') ? AlignLeft :
                              block.type.toLowerCase().includes('seo') ? Tag : Layers;
                  
                  return (
                    <div
                      key={block.id}
                      className={`rounded-xl border transition-all ${
                        isOpen ? "border-cyan/30 bg-gradient-card" : "border-border/50 bg-gradient-card"
                      }`}
                    >
                      {/* Block header */}
                      <button
                        onClick={() => toggle(block.id)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-secondary/20 rounded-xl transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isOpen ? "bg-cyan/15 border border-cyan/30" : "bg-secondary border border-border/50"
                        }`}>
                          {icon && <icon className={`w-3.5 h-3.5 ${isOpen ? "text-cyan" : "text-muted-foreground"}`} />}
                        </div>
                        <div className="flex-1">
                          <span className={`font-medium text-sm block ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                            {block.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{block.key}</span>
                        </div>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/50">
                          {block.valueType}
                        </span>
                        <div className="ml-2">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Field */}
                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-border/30 pt-4">
                          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                            Content Value
                          </label>
                          {block.valueType === 'LONG_TEXT' || block.valueType === 'JSON' ? (
                            <Textarea
                              value={blockValues[block.id] ?? block.value}
                              onChange={(e) => updateField(block.id, e.target.value)}
                              disabled={!block.isEditable}
                              className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 text-sm resize-none min-h-[120px] font-mono"
                            />
                          ) : (
                            <Input
                              value={blockValues[block.id] ?? block.value}
                              onChange={(e) => updateField(block.id, e.target.value)}
                              disabled={!block.isEditable}
                              className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 text-sm"
                            />
                          )}
                          {!block.isEditable && (
                            <p className="text-xs text-muted-foreground mt-2">
                              This block is marked as non-editable
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className={`flex flex-col border-l border-border/50 bg-background/30 transition-all ${previewFullscreen ? 'fixed inset-0 z-50' : 'w-1/2'}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Monitor className="w-4 h-4 text-cyan flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground text-sm">Live Preview</h3>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {projectUrl.replace(/\/$/, '')}{pageData.path}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshPreview}
                className="h-7 w-7 p-0"
                title="Refresh Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewFullscreen(!previewFullscreen)}
                className="h-7 w-7 p-0"
                title={previewFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {previewFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-white relative overflow-hidden">
            <iframe
              ref={iframeRef}
              src={`${projectUrl.replace(/\/$/, '')}${pageData.path}?preview=true&t=${Date.now()}`}
              className="w-full h-full border-0"
              title="Live Preview"
              onError={() => {
                toast({
                  title: "Preview Load Failed",
                  description: `Could not load ${projectUrl}${pageData.path}. Make sure the site is running.`,
                  variant: "destructive",
                });
              }}
            />
            <div className="absolute top-2 right-2 px-3 py-1.5 bg-cyan/90 text-white text-xs rounded-md font-mono shadow-lg backdrop-blur-sm">
              🔴 LIVE
            </div>
            <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-background/90 text-foreground text-xs rounded-md font-mono shadow-lg backdrop-blur-sm border border-border/50">
              {projectUrl.replace(/https?:\/\//, '')}
            </div>
          </div>
        </div>
      )}

      {/* Right panel: Page structure */}
      {!showPreview && (
        <div className="hidden xl:flex w-64 border-l border-border/50 bg-background/30 flex-col">
        <div className="px-4 py-3.5 border-b border-border/50">
          <h3 className="font-display font-semibold text-foreground text-xs uppercase tracking-wider">Page Structure</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {pageData.components?.map((component, i) => (
            <div
              key={component.id || i}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/40 cursor-pointer text-xs transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-cyan" />
              <span className="text-muted-foreground">{component.name}</span>
              <span className="ml-auto text-muted-foreground/50 text-xs">{component.type}</span>
            </div>
          ))}
          {(!pageData.components || pageData.components.length === 0) && (
            <div className="text-xs text-muted-foreground text-center py-8">
              No components detected
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

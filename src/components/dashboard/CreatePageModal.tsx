import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

export function CreatePageModal({ isOpen, onClose, projectId, onSuccess }: CreatePageModalProps) {
  const [path, setPath] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState('location');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!path || !title) {
      toast({
        title: "Missing Fields",
        description: "Please enter both path and title",
        variant: "destructive",
      });
      return;
    }

    // Validate path starts with /
    const validPath = path.startsWith('/') ? path : `/${path}`;

    try {
      setCreating(true);
      
      await api.post('/pages', {
        projectId,
        path: validPath,
        title,
        slug: slug || undefined,
        template, // Send template to backend
      });

      toast({
        title: "✅ Page Created!",
        description: `Successfully created ${validPath}`,
      });

      // Reset form
      setPath('');
      setTitle('');
      setSlug('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to Create Page",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-card rounded-xl border border-border/50 max-w-lg w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Create New Page
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a new page to your website without code changes
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Page Template <span className="text-red-500">*</span>
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border/60 rounded-md focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 focus:outline-none text-foreground"
            >
              <option value="location">📍 Location Page (Hero, Services, Portfolio, FAQ)</option>
              <option value="service">🔧 Service Page (Features, Benefits, Process)</option>
              <option value="basic">📄 Basic Page (Simple content layout)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Template determines default content blocks
            </p>
          </div>

          {/* Path */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Page Path <span className="text-red-500">*</span>
            </label>
            <Input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/locations/phoenix"
              className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must start with / (e.g., /locations/phoenix)
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Page Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Phoenix Location"
              className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Displayed in browser tab and search results
            </p>
          </div>

          {/* Slug (Optional) */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Slug (Optional)
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="phoenix-location"
              className="bg-secondary/50 border-border/60 focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Auto-generated from path if not provided
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-cyan/5 border border-cyan/20 rounded-lg">
          <p className="text-xs text-cyan font-medium mb-1">
            ✨ Content blocks will be auto-generated based on template!
          </p>
          <p className="text-xs text-cyan/80">
            {template === 'location' && '📍 Location: Hero, Services, Why Choose Us, Portfolio, FAQ sections'}
            {template === 'service' && '🔧 Service: Features, Benefits, Process, CTA sections'}
            {template === 'basic' && '📄 Basic: Heading, paragraphs, and image blocks'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border/60"
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !path || !title}
            className="flex-1 bg-gradient-primary text-primary-foreground"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

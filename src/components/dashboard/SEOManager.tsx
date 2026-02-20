import { useState, useEffect } from 'react';
import { Search, Save, AlertCircle, CheckCircle2, TrendingUp, Globe, Image, FileText, Tag, Link2, Code, RefreshCw, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Page {
  id: string;
  title: string;
  path: string;
  status: string;
  seoMetadata?: {
    seoScore: number;
  };
}

interface SeoMetadata {
  id: string;
  pageId: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  canonical: string | null;
  robots: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogType: string;
  twitterCard: string;
  twitterTitle: string | null;
  twitterDesc: string | null;
  twitterImage: string | null;
  jsonLd: any;
  seoScore: number;
}

interface SeoScore {
  score: number;
  issues: string[];
  passed: string[];
  total: number;
}

export default function SEOManager({ projectId }: { projectId: string }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [seoData, setSeoData] = useState<SeoMetadata | null>(null);
  const [seoScore, setSeoScore] = useState<SeoScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPages();
  }, [projectId]);

  useEffect(() => {
    if (selectedPage) {
      loadSeoData(selectedPage.id);
    }
  }, [selectedPage]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/pages/project/${projectId}`);
      setPages(response.data);
      if (response.data.length > 0 && !selectedPage) {
        setSelectedPage(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeoData = async (pageId: string) => {
    try {
      setLoading(true);
      const [seoResponse, scoreResponse] = await Promise.all([
        axios.get(`${API_URL}/seo/${pageId}`).catch(() => ({ data: null })),
        axios.get(`${API_URL}/seo/${pageId}/score`).catch(() => ({ data: null }))
      ]);

      if (seoResponse.data) {
        setSeoData(seoResponse.data);
      } else {
        // Initialize empty SEO data
        setSeoData({
          id: '',
          pageId,
          title: null,
          description: null,
          keywords: [],
          canonical: null,
          robots: 'index, follow',
          ogTitle: null,
          ogDescription: null,
          ogImage: null,
          ogType: 'website',
          twitterCard: 'summary_large_image',
          twitterTitle: null,
          twitterDesc: null,
          twitterImage: null,
          jsonLd: null,
          seoScore: 0
        });
      }

      if (scoreResponse.data) {
        setSeoScore(scoreResponse.data);
      }
    } catch (error) {
      console.error('Failed to load SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPage || !seoData) return;

    try {
      setSaving(true);
      const response = await axios.put(`${API_URL}/seo/${selectedPage.id}`, {
        title: seoData.title || undefined,
        description: seoData.description || undefined,
        keywords: seoData.keywords,
        canonical: seoData.canonical || undefined,
        robots: seoData.robots,
        ogTitle: seoData.ogTitle || undefined,
        ogDescription: seoData.ogDescription || undefined,
        ogImage: seoData.ogImage || undefined,
        ogType: seoData.ogType,
        twitterCard: seoData.twitterCard,
        twitterTitle: seoData.twitterTitle || undefined,
        twitterDesc: seoData.twitterDesc || undefined,
        twitterImage: seoData.twitterImage || undefined,
        jsonLd: seoData.jsonLd || undefined
      });

      setSeoData(response.data);
      
      // Reload SEO score to get updated status
      const scoreResponse = await axios.get(`${API_URL}/seo/${selectedPage.id}/score`);
      setSeoScore(scoreResponse.data);
      
      // Update pages list to show SEO status
      await loadPages();
      
      // Show success toast with score
      const score = response.data.seoScore;
      const scoreEmoji = score >= 80 ? '🎉' : score >= 60 ? '👍' : '⚠️';
      
      toast({
        title: `${scoreEmoji} SEO Saved Successfully!`,
        description: `SEO Score: ${score}/100 - ${
          score >= 80 ? 'Excellent!' : 
          score >= 60 ? 'Good, but can be improved' : 
          'Needs improvement'
        }`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to save SEO data:', error);
      toast({
        title: "Failed to Save",
        description: "Could not save SEO data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && seoData) {
      setSeoData({
        ...seoData,
        keywords: [...seoData.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    if (seoData) {
      setSeoData({
        ...seoData,
        keywords: seoData.keywords.filter((_, i) => i !== index)
      });
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-accent';
    if (score >= 60) return 'text-orange-accent';
    return 'text-destructive';
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - Pages List */}
      <div className="w-80 border-r border-border/50 bg-background/30 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-3">SEO Manager</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && !selectedPage ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Loading pages...</div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredPages.map((page) => {
                const hasSeo = page.seoMetadata?.seoScore !== undefined;
                const seoScore = page.seoMetadata?.seoScore || 0;
                
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`w-full p-4 text-left hover:bg-secondary/25 transition-colors ${
                      selectedPage?.id === page.id ? 'bg-cyan/5 border-l-2 border-l-cyan' : ''
                    }`}
                  >
                    <div className="font-medium text-foreground text-sm truncate">{page.title}</div>
                    <div className="text-xs text-muted-foreground truncate font-mono">{page.path}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        page.status === 'PUBLISHED' ? 'bg-green-accent/10 text-green-accent' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {page.status}
                      </span>
                      {hasSeo ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                          seoScore >= 80 ? 'bg-green-accent/10 text-green-accent' :
                          seoScore >= 60 ? 'bg-orange-accent/10 text-orange-accent' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          SEO: {seoScore}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary/50 text-muted-foreground">
                          No SEO
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedPage ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Select a page to manage SEO</p>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-display font-bold text-foreground mb-2">{selectedPage.title}</h1>
                  <p className="text-sm text-muted-foreground font-mono">{selectedPage.path}</p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              {/* SEO Score */}
              {seoScore && (
                <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        seoScore.score >= 80 ? 'bg-green-accent/20 border-2 border-green-accent/30' :
                        seoScore.score >= 60 ? 'bg-orange-accent/20 border-2 border-orange-accent/30' :
                        'bg-destructive/20 border-2 border-destructive/30'
                      }`}>
                        <span className={`text-2xl font-bold ${getScoreColor(seoScore.score)}`}>
                          {seoScore.score}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">SEO Score</h3>
                        <p className="text-sm text-muted-foreground">{seoScore.passed.length} / {seoScore.total} checks passed</p>
                      </div>
                    </div>
                    <button
                      onClick={() => loadSeoData(selectedPage.id)}
                      className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-accent mb-2 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Passed ({seoScore.passed.length})
                      </h4>
                      <ul className="space-y-1">
                        {seoScore.passed.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-destructive mb-2 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Issues ({seoScore.issues.length})
                      </h4>
                      <ul className="space-y-1">
                        {seoScore.issues.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {seoData && (
              <>
                {/* Basic SEO */}
                <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan" />
                    Basic SEO
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Meta Title
                        <span className="ml-2">({seoData.title?.length || 0}/60)</span>
                      </label>
                      <input
                        type="text"
                        value={seoData.title || ''}
                        onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                        placeholder="Enter meta title..."
                        maxLength={60}
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      />
                      {seoData.title && seoData.title.length > 60 && (
                        <p className="text-sm text-destructive mt-1">Title is too long (recommended: 50-60 characters)</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Meta Description
                        <span className="ml-2">({seoData.description?.length || 0}/160)</span>
                      </label>
                      <textarea
                        value={seoData.description || ''}
                        onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                        placeholder="Enter meta description..."
                        maxLength={160}
                        rows={3}
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 resize-none"
                      />
                      {seoData.description && seoData.description.length > 160 && (
                        <p className="text-sm text-destructive mt-1">Description is too long (recommended: 150-160 characters)</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        <Tag className="w-4 h-4 inline mr-1" />
                        Keywords
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                          placeholder="Add keyword..."
                          className="flex-1 px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                        />
                        <Button
                          onClick={addKeyword}
                          className="bg-gradient-primary text-primary-foreground"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {seoData.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-cyan/10 text-cyan rounded-full text-sm border border-cyan/20"
                          >
                            {keyword}
                            <button
                              onClick={() => removeKeyword(index)}
                              className="hover:text-cyan/80"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        <Link2 className="w-4 h-4 inline mr-1" />
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={seoData.canonical || ''}
                        onChange={(e) => setSeoData({ ...seoData, canonical: e.target.value })}
                        placeholder="https://example.com/page"
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Robots Meta Tag
                      </label>
                      <select
                        value={seoData.robots}
                        onChange={(e) => setSeoData({ ...seoData, robots: e.target.value })}
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      >
                        <option value="index, follow">index, follow</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan" />
                    Open Graph (Facebook, LinkedIn)
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">OG Title</label>
                      <input
                        type="text"
                        value={seoData.ogTitle || ''}
                        onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                        placeholder="Leave empty to use meta title"
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">OG Description</label>
                      <textarea
                        value={seoData.ogDescription || ''}
                        onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
                        placeholder="Leave empty to use meta description"
                        rows={2}
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        <Image className="w-4 h-4 inline mr-1" />
                        OG Image URL
                      </label>
                      <input
                        type="url"
                        value={seoData.ogImage || ''}
                        onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono text-sm"
                      />
                      {seoData.ogImage && (
                        <img src={seoData.ogImage} alt="OG Preview" className="mt-2 max-w-xs rounded-lg border border-border/50" />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">OG Type</label>
                      <select
                        value={seoData.ogType}
                        onChange={(e) => setSeoData({ ...seoData, ogType: e.target.value })}
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      >
                        <option value="website">Website</option>
                        <option value="article">Article</option>
                        <option value="product">Product</option>
                        <option value="profile">Profile</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Twitter Cards */}
                <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan" />
                    Twitter Cards
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Card Type</label>
                      <select
                        value={seoData.twitterCard}
                        onChange={(e) => setSeoData({ ...seoData, twitterCard: e.target.value })}
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                        <option value="app">App</option>
                        <option value="player">Player</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Twitter Title</label>
                      <input
                        type="text"
                        value={seoData.twitterTitle || ''}
                        onChange={(e) => setSeoData({ ...seoData, twitterTitle: e.target.value })}
                        placeholder="Leave empty to use OG title"
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Twitter Description</label>
                      <textarea
                        value={seoData.twitterDesc || ''}
                        onChange={(e) => setSeoData({ ...seoData, twitterDesc: e.target.value })}
                        placeholder="Leave empty to use OG description"
                        rows={2}
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Twitter Image URL</label>
                      <input
                        type="url"
                        value={seoData.twitterImage || ''}
                        onChange={(e) => setSeoData({ ...seoData, twitterImage: e.target.value })}
                        placeholder="Leave empty to use OG image"
                        className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Structured Data (JSON-LD) */}
                <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan" />
                    Structured Data (JSON-LD)
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      JSON-LD Schema
                    </label>
                    <textarea
                      value={seoData.jsonLd ? JSON.stringify(seoData.jsonLd, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                          setSeoData({ ...seoData, jsonLd: parsed });
                        } catch (err) {
                          // Invalid JSON, don't update
                        }
                      }}
                      placeholder='{"@context": "https://schema.org", "@type": "WebPage", "name": "Page Name"}'
                      rows={10}
                      className="w-full px-4 py-2 bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 font-mono text-sm resize-none"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Add structured data for rich snippets. Must be valid JSON.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

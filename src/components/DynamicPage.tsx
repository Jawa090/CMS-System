import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCMS } from '@/contexts/CMSContext';
import { Loader2, Home, ArrowLeft } from 'lucide-react';

/**
 * Dynamic Page Component
 * 
 * Automatically renders any page from CMS without code changes.
 * This component handles:
 * - Loading states
 * - Error handling
 * - 404 pages
 * - SEO meta tags
 * - Content rendering
 * 
 * @example
 * // In your router:
 * <Route path="*" element={<DynamicPage />} />
 * 
 * // Create page in dashboard:
 * POST /api/v1/pages { projectId, path: "/locations/phoenix", title: "Phoenix" }
 * 
 * // Visit: yoursite.com/locations/phoenix
 */
export function DynamicPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error, seo } = useCMS();

  // Update document title from SEO
  useEffect(() => {
    if (seo?.title) {
      document.title = seo.title;
    } else if (data?.title) {
      document.title = data.title;
    }
  }, [seo, data]);

  // Loading state with professional spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Page</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  // Error or 404 state with professional design
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            {/* 404 Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                <span className="text-5xl font-bold text-blue-600">404</span>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              The page you're looking for doesn't exist.
            </p>
            <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg mb-8">
              <code className="text-sm text-gray-700 font-mono">
                {location.pathname}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Want to create this page?{' '}
                <a 
                  href="/dashboard/pages" 
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Go to Dashboard
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success - Render page content
  // Content is automatically replaced by CMSContext auto-replace feature
  return (
    <div className="dynamic-page min-h-screen bg-white">
      {/* 
        Content is automatically populated by CMS auto-replace.
        The structure below is a fallback for when auto-replace is disabled.
      */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Page Title */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {data.title}
          </h1>
          {seo?.description && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {seo.description}
            </p>
          )}
        </header>

        {/* Content Blocks */}
        <div className="prose prose-lg max-w-none">
          {data.contentBlocks.map((block, index) => {
            // Render different block types with professional styling
            switch (block.type) {
              case 'HEADING':
              case 'heading':
                return (
                  <h2 
                    key={block.id} 
                    className="text-3xl font-bold text-gray-900 mt-12 mb-6 first:mt-0"
                  >
                    {block.value}
                  </h2>
                );
              
              case 'TEXT':
              case 'paragraph':
                return (
                  <p 
                    key={block.id} 
                    className="text-gray-700 mb-6 leading-relaxed text-lg"
                  >
                    {block.value}
                  </p>
                );
              
              case 'CTA':
              case 'button':
                return (
                  <div key={block.id} className="my-8">
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-600/30">
                      {block.value}
                    </button>
                  </div>
                );
              
              case 'IMAGE':
              case 'image':
                return (
                  <div key={block.id} className="my-8">
                    <img 
                      src={block.value} 
                      alt={block.name}
                      className="w-full rounded-xl shadow-lg"
                    />
                  </div>
                );
              
              case 'LIST':
              case 'list':
                return (
                  <ul key={block.id} className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li>{block.value}</li>
                  </ul>
                );
              
              default:
                // Generic content block
                return (
                  <div 
                    key={block.id} 
                    className="mb-6 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: block.value }}
                  />
                );
            }
          })}
        </div>

        {/* Empty State */}
        {data.contentBlocks.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Content Yet
            </h3>
            <p className="text-gray-600 mb-6">
              This page exists but has no content blocks.
            </p>
            <a 
              href={`/dashboard/pages`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Content in Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

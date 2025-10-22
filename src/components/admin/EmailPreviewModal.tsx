import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { loadAndRenderTemplate } from '@/lib/email-template-renderer';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReleaseData {
  version?: string;
  release_date?: string;
  summary?: string;
  environment?: string;
  features?: Array<{ title?: string; description?: string; benefit?: string; sort_order?: number }>;
  api_changes?: Array<{ endpoint?: string; change_type?: string; description?: string; sort_order?: number }>;
  ui_updates?: Array<{ description?: string; component?: string; sort_order?: number }>;
  bug_fixes?: Array<{ description?: string; component?: string; sort_order?: number }>;
  improvements?: Array<{ description?: string; component?: string; sort_order?: number }>;
  database_changes?: Array<{ description?: string; sort_order?: number }>;
  breaking_changes?: Array<{ content?: string }>;
  known_issues?: Array<{ content?: string }>;
  technical_notes?: Array<{ content?: string }>;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailType: 'admin' | 'user';
  releaseData: ReleaseData;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  emailType,
  releaseData,
}: EmailPreviewModalProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'html'>('preview');

  useEffect(() => {
    if (isOpen && releaseData) {
      renderEmailPreview();
    }
  }, [isOpen, emailType, releaseData]);

  const renderEmailPreview = async () => {
    setIsLoading(true);
    try {
      const templateName = emailType === 'admin' 
        ? '08-system-update-admin' 
        : '09-system-update-user';

      const templateData = prepareTemplateData(releaseData, emailType);
      
      try {
        const html = await loadAndRenderTemplate(templateName, templateData);
        setRenderedHtml(html);
      } catch (templateError) {
        // Fallback to simple HTML preview if template loading fails
        const fallbackHtml = generateFallbackPreview(releaseData, emailType);
        setRenderedHtml(fallbackHtml);
        console.warn('Using fallback preview - template not found:', templateError);
      }
    } catch (error) {
      console.error('Failed to render email preview:', error);
      toast.error('Failed to load email preview');
      setRenderedHtml('<div style="padding: 20px; color: red;">Failed to load email template</div>');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackPreview = (data: ReleaseData, type: 'admin' | 'user'): string => {
    const styles = `
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    `;
    
    let content = `
      <div style="${styles}">
        <h1 style="color: #8B5CF6;">Release v${data.version || '[Version]'}</h1>
        <p><strong>Release Date:</strong> ${data.release_date || '[Date]'}</p>
        <p><strong>Environment:</strong> ${data.environment || 'production'}</p>
        
        <h2>Summary</h2>
        <p>${data.summary || '[No summary provided]'}</p>
    `;

    if (type === 'admin') {
      // Full technical details for admin
      if (data.features && data.features.length > 0) {
        content += `<h2>Features Added</h2><ul>`;
        data.features.forEach(f => {
          if (f.title && f.description) {
            content += `<li><strong>${f.title}</strong>: ${f.description}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.api_changes && data.api_changes.length > 0) {
        content += `<h2>API Changes</h2><ul>`;
        data.api_changes.forEach(a => {
          if (a.endpoint && a.description) {
            content += `<li><strong>${a.endpoint}</strong> (${a.change_type}): ${a.description}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.bug_fixes && data.bug_fixes.length > 0) {
        content += `<h2>Bug Fixes</h2><ul>`;
        data.bug_fixes.forEach(b => {
          if (b.description) {
            content += `<li>${b.description}${b.component ? ` (${b.component})` : ''}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.improvements && data.improvements.length > 0) {
        content += `<h2>Improvements</h2><ul>`;
        data.improvements.forEach(i => {
          if (i.description) {
            content += `<li>${i.description}${i.component ? ` (${i.component})` : ''}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.ui_updates && data.ui_updates.length > 0) {
        content += `<h2>UI Updates</h2><ul>`;
        data.ui_updates.forEach(u => {
          if (u.description) {
            content += `<li>${u.description}${u.component ? ` (${u.component})` : ''}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.database_changes && data.database_changes.length > 0) {
        content += `<h2>Database Changes</h2><ul>`;
        data.database_changes.forEach(d => {
          if (d.description) {
            content += `<li>${d.description}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.breaking_changes && data.breaking_changes.length > 0) {
        content += `<h2>Breaking Changes</h2><ul>`;
        data.breaking_changes.forEach(b => {
          if (b.content) {
            content += `<li>${b.content}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.known_issues && data.known_issues.length > 0) {
        content += `<h2>Known Issues</h2><ul>`;
        data.known_issues.forEach(k => {
          if (k.content) {
            content += `<li>${k.content}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.technical_notes && data.technical_notes.length > 0) {
        content += `<h2>Technical Notes</h2><ul>`;
        data.technical_notes.forEach(t => {
          if (t.content) {
            content += `<li>${t.content}</li>`;
          }
        });
        content += `</ul>`;
      }
    } else {
      // User-friendly version
      if (data.features && data.features.length > 0) {
        content += `<h2>What's New</h2><ul>`;
        data.features.forEach(f => {
          if (f.title && (f.benefit || f.description)) {
            content += `<li><strong>${f.title}</strong>: ${f.benefit || f.description}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.bug_fixes && data.bug_fixes.length > 0) {
        content += `<h2>Bug Fixes</h2><ul>`;
        data.bug_fixes.forEach(b => {
          if (b.description) {
            content += `<li>${b.description}</li>`;
          }
        });
        content += `</ul>`;
      }
      
      if (data.improvements && data.improvements.length > 0) {
        content += `<h2>Improvements</h2><ul>`;
        data.improvements.forEach(i => {
          if (i.description) {
            content += `<li>${i.description}</li>`;
          }
        });
        content += `</ul>`;
      }
    }
    
    content += `</div>`;
    return content;
  };

  const prepareTemplateData = (data: ReleaseData, type: 'admin' | 'user') => {
    const baseData = {
      VERSION: data.version || '[Version]',
      RELEASE_DATE: data.release_date || '[Date]',
      SUMMARY: data.summary || '[Summary not provided]',
      SITE_URL: window.location.origin,
    };

    if (type === 'admin') {
      return {
        ...baseData,
        FEATURES_ADDED: data.features || [],
        APIS_CHANGED: data.api_changes?.map(a => ({
          endpoint: a.endpoint || '[Endpoint]',
          change: `${(a.change_type || 'modified').toUpperCase()}: ${a.description || '[No description]'}`,
        })) || [],
        UI_UPDATES: data.ui_updates || [],
        BUG_FIXES: data.bug_fixes || [],
        IMPROVEMENTS: data.improvements || [],
        DATABASE_CHANGES: data.database_changes || [],
        BREAKING_CHANGES: data.breaking_changes || [],
        KNOWN_ISSUES: data.known_issues || [],
        TECHNICAL_NOTES: data.technical_notes || [],
      };
    } else {
      // User email - simplified, user-friendly data
      return {
        ...baseData,
        FEATURES_ADDED: data.features?.map(f => ({
          title: f.title || '[Feature]',
          benefit: f.benefit || f.description || '[Benefit]',
          description: f.description || '[Description]',
        })) || [],
        BUG_FIXES: data.bug_fixes?.map(b => b.description || '[Bug fix]') || [],
        IMPROVEMENTS: data.improvements?.map(i => i.description || '[Improvement]') || [],
      };
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderedHtml);
    toast.success('HTML copied to clipboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Email Preview - {emailType === 'admin' ? 'Admin Technical' : 'User Friendly'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'preview' | 'html')} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML Source</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={handleCopyHtml}>
              <Copy className="h-4 w-4 mr-2" />
              Copy HTML
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
                <div className="bg-gray-100 rounded-lg p-4 h-full overflow-auto">
                  <iframe
                    srcDoc={renderedHtml}
                    title="Email Preview"
                    className="w-full h-full bg-white rounded shadow-sm"
                    style={{ minHeight: '500px' }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </TabsContent>

              <TabsContent value="html" className="flex-1 overflow-auto mt-0">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto h-full">
                  <code>{renderedHtml}</code>
                </pre>
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Smartphone, Monitor } from 'lucide-react';
import type { EmailTemplate } from '@/lib/email-campaigns-api';

interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}

export function EmailTemplateEditor({ template, onSave, onCancel }: EmailTemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [previewText, setPreviewText] = useState(template?.preview_text || '');
  const [htmlContent, setHtmlContent] = useState(template?.html_content || '');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleSave = () => {
    onSave({
      name,
      subject,
      preview_text: previewText,
      html_content: htmlContent,
      is_active: true,
    });
  };

  const insertVariable = (variable: string) => {
    setHtmlContent(prev => prev + `{{${variable}}}`);
  };

  const renderPreviewHtml = (html: string) => {
    return html
      .replace(/{{name}}/g, 'John Doe')
      .replace(/{{email}}/g, 'guest@example.com')
      .replace(/{{rsvp_status}}/g, 'confirmed')
      .replace(/{{event_date}}/g, 'November 1st, 2025')
      .replace(/{{event_time}}/g, '6:30 PM')
      .replace(/{{event_address}}/g, '1816 White Feather Drive, Longmont, Colorado 80504')
      .replace(/{{costume_idea}}/g, 'Little Red Riding Hood')
      .replace(/{{num_guests}}/g, '2')
      .replace(/{{dietary_restrictions}}/g, 'Vegetarian')
      .replace(/{{gallery_link}}/g, 'https://twistedtale.com/gallery');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Welcome Email"
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Welcome to the Twisted Tale!"
              required
            />
          </div>

          <div>
            <Label htmlFor="preview">Preview Text</Label>
            <Input
              id="preview"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Short preview text..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="html">HTML Content</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
            <Textarea
              id="html"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<h1>Hello {{name}}!</h1>"
              className="font-mono min-h-[300px]"
              required
            />
          </div>

          <div>
            <Label>Insert Variables</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('name')}>
                {'{{name}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('email')}>
                {'{{email}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('rsvp_status')}>
                {'{{rsvp_status}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('event_date')}>
                {'{{event_date}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('event_time')}>
                {'{{event_time}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('event_address')}>
                {'{{event_address}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('costume_idea')}>
                {'{{costume_idea}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('num_guests')}>
                {'{{num_guests}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('dietary_restrictions')}>
                {'{{dietary_restrictions}}'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => insertVariable('gallery_link')}>
                {'{{gallery_link}}'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!name || !subject || !htmlContent}>
              Save Template
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Rich Preview */}
        {showPreview && (
          <Card className="p-4 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Live Preview</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="rendered" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="rendered" className="flex-1">Rendered</TabsTrigger>
                <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rendered" className="mt-4">
                <div 
                  className={`border rounded-lg bg-white overflow-auto transition-all ${
                    previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
                  }`}
                  style={{ height: '600px' }}
                >
                  <iframe
                    title="Email Preview"
                    srcDoc={renderPreviewHtml(htmlContent)}
                    className="w-full h-full"
                    sandbox="allow-same-origin"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="html" className="mt-4">
                <div className="border rounded-lg p-4 bg-muted max-h-[600px] overflow-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                    {htmlContent}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 p-3 bg-muted rounded-lg text-xs">
              <div className="font-medium mb-1">Subject:</div>
              <div className="text-muted-foreground">{subject || '(no subject)'}</div>
              {previewText && (
                <>
                  <div className="font-medium mt-2 mb-1">Preview:</div>
                  <div className="text-muted-foreground">{previewText}</div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

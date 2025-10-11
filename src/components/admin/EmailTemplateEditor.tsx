import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable('name')}
              >
                {'{{name}}'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable('email')}
              >
                {'{{email}}'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable('rsvp_status')}
              >
                {'{{rsvp_status}}'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable('event_date')}
              >
                {'{{event_date}}'}
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

        {/* Preview */}
        {showPreview && (
          <Card className="p-4 h-fit">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="border rounded-lg p-4 bg-background">
              <div className="text-xs text-muted-foreground mb-2">
                Subject: {subject || '(no subject)'}
              </div>
              {previewText && (
                <div className="text-xs text-muted-foreground mb-4">
                  {previewText}
                </div>
              )}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: htmlContent.replace(/\{\{(\w+)\}\}/g, '<span class="bg-yellow-200 px-1">$1</span>')
                }}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

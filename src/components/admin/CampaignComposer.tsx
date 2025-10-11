import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Send, TestTube, Upload, Users } from 'lucide-react';
import { getActiveTemplates, getRecipientCount, parseEmailCSV, type EmailTemplate } from '@/lib/email-campaigns-api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface CampaignComposerProps {
  onSave: (campaign: any) => void;
  onCancel: () => void;
  onSendTest: (campaign: any) => void;
}

export function CampaignComposer({ onSave, onCancel, onSendTest }: CampaignComposerProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipientList, setRecipientList] = useState<string>('all');
  const [customRecipients, setCustomRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    updateRecipientCount();
  }, [recipientList, customRecipients]);

  const loadTemplates = async () => {
    try {
      const data = await getActiveTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    }
  };

  const updateRecipientCount = async () => {
    try {
      if (recipientList === 'custom') {
        setRecipientCount(customRecipients.length);
      } else {
        const count = await getRecipientCount(recipientList);
        setRecipientCount(count || 0);
      }
    } catch (error) {
      console.error('Failed to get recipient count:', error);
      setRecipientCount(0);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const emails = parseEmailCSV(content);
      setCustomRecipients(emails);
      toast.success(`Loaded ${emails.length} email addresses`);
    };
    reader.readAsText(file);
  };

  const handleCustomRecipientsChange = (value: string) => {
    const emails = value
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    setCustomRecipients(emails);
  };

  const handleSave = () => {
    if (!selectedTemplate || !subject) {
      toast.error('Please select a template and enter a subject');
      return;
    }

    if (recipientCount === 0) {
      toast.error('No recipients selected');
      return;
    }

    onSave({
      template_id: selectedTemplate,
      recipient_list: recipientList,
      custom_recipients: recipientList === 'custom' ? customRecipients : undefined,
      subject,
      scheduled_at: isScheduled ? scheduledAt : undefined,
      status: 'draft',
    });
  };

  const handleSendTest = () => {
    if (!selectedTemplate || !subject) {
      toast.error('Please select a template and enter a subject');
      return;
    }

    onSendTest({
      template_id: selectedTemplate,
      recipient_list: 'custom',
      custom_recipients: [user?.email].filter(Boolean),
      subject: `[TEST] ${subject}`,
      status: 'draft',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="template">Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recipients</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient-list">Recipient List</Label>
            <Select value={recipientList} onValueChange={setRecipientList}>
              <SelectTrigger id="recipient-list">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guests</SelectItem>
                <SelectItem value="rsvp_yes">Confirmed RSVPs</SelectItem>
                <SelectItem value="rsvp_pending">Pending RSVPs</SelectItem>
                <SelectItem value="custom">Custom List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientList === 'custom' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="csv-upload">Upload CSV</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              <div>
                <Label htmlFor="custom-emails">Or Enter Emails (comma or newline separated)</Label>
                <Textarea
                  id="custom-emails"
                  placeholder="email1@example.com, email2@example.com"
                  className="min-h-[100px]"
                  onChange={(e) => handleCustomRecipientsChange(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} will receive this email
            </span>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!selectedTemplate || !subject || recipientCount === 0}>
          <Send className="w-4 h-4 mr-2" />
          Save & Send Campaign
        </Button>
        <Button type="button" variant="outline" onClick={handleSendTest}>
          <TestTube className="w-4 h-4 mr-2" />
          Send Test Email
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

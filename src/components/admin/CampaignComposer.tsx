import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, TestTube, Upload, Users, X, Check, ChevronsUpDown } from 'lucide-react';
import { getActiveTemplates, getRecipientCount, parseEmailCSV, type EmailTemplate } from '@/lib/email-campaigns-api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CampaignComposerProps {
  onSave: (campaign: any) => void;
  onCancel: () => void;
  onSendTest: (campaign: any) => void;
}

interface User {
  id: string;
  email: string;
  display_name?: string;
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [manualEmails, setManualEmails] = useState('');

  useEffect(() => {
    loadTemplates();
    loadAllUsers();
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

  const loadAllUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .order('email');

      if (error) throw error;
      setAllUsers(profiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
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
    setManualEmails(value);
    const emails = value
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    setCustomRecipients(emails);
  };

  const addUserToRecipients = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user && !customRecipients.includes(user.email)) {
      setCustomRecipients([...customRecipients, user.email]);
    }
    setComboboxOpen(false);
  };

  const removeRecipient = (email: string) => {
    setCustomRecipients(customRecipients.filter(e => e !== email));
    // Also update manual emails field
    const remainingEmails = customRecipients.filter(e => e !== email).join(', ');
    setManualEmails(remainingEmails);
  };

  const handleSave = () => {
    console.log('📧 Campaign Composer - handleSave called');
    
    if (!selectedTemplate || !subject) {
      toast.error('Please select a template and enter a subject');
      return;
    }

    if (recipientCount === 0) {
      toast.error('No recipients selected');
      return;
    }

    const campaignData = {
      template_id: selectedTemplate,
      recipient_list: recipientList,
      custom_recipients: recipientList === 'custom' ? customRecipients : undefined,
      subject,
      scheduled_at: isScheduled ? scheduledAt : undefined,
      status: 'draft',
    };
    
    console.log('📧 Calling onSave with campaign data:', campaignData);
    onSave(campaignData);
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
            <div className="space-y-4">
              {/* User Selector */}
              <div>
                <Label className="mb-2 block">Select from existing users:</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between min-h-[44px]"
                    >
                      Select user...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover z-50" align="start">
                    <Command className="bg-popover">
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {allUsers
                            .filter(u => !customRecipients.includes(u.email))
                            .map((u) => (
                              <CommandItem
                                key={u.id}
                                value={u.email}
                                onSelect={() => addUserToRecipients(u.id)}
                              >
                                <Check className="mr-2 h-4 w-4 opacity-0" />
                                <div className="flex flex-col">
                                  <span>{u.email}</span>
                                  {u.display_name && (
                                    <span className="text-xs text-muted-foreground">
                                      {u.display_name}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Selected Recipients */}
              {customRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
                  {customRecipients.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* CSV Upload */}
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
              
              {/* Manual Entry */}
              <div>
                <Label htmlFor="custom-emails">Or Enter Emails (comma or newline separated)</Label>
                <Textarea
                  id="custom-emails"
                  value={manualEmails}
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
          Review & Send Campaign
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

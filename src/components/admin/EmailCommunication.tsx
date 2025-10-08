// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, Send, Eye, History, Users, Clock, CheckCircle, 
  XCircle, AlertCircle, FileText, Plus, Trash2
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  subject: string;
  message_html: string;
  message_text: string;
  recipient_filter: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EmailSend {
  id: string;
  campaign_id: string;
  recipient_email: string;
  recipient_name: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

const EMAIL_TEMPLATES = [
  {
    id: 'event_reminder',
    name: 'Event Reminder',
    subject: 'Reminder: Twisted Hearth Foundation Event - This Weekend!',
    message_html: `
      <h2>Don't Miss the Twisted Hearth Foundation Event!</h2>
      <p>Dear {{name}},</p>
      <p>This is a friendly reminder that our twisted fairytale celebration is happening this weekend!</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li>Date: [Event Date]</li>
        <li>Time: [Event Time]</li>
        <li>Location: [Event Location]</li>
      </ul>
      <p>We can't wait to see your twisted costumes and celebrate with you!</p>
      <p>Best regards,<br>Jamie & Kat Ruth</p>
    `,
    message_text: `
      Don't Miss the Twisted Hearth Foundation Event!
      
      Dear {{name}},
      
      This is a friendly reminder that our twisted fairytale celebration is happening this weekend!
      
      Event Details:
      - Date: [Event Date]
      - Time: [Event Time]
      - Location: [Event Location]
      
      We can't wait to see your twisted costumes and celebrate with you!
      
      Best regards,
      Jamie & Kat Ruth
    `
  },
  {
    id: 'event_update',
    name: 'Event Update',
    subject: 'Important Update: Twisted Hearth Foundation Event',
    message_html: `
      <h2>Important Event Update</h2>
      <p>Dear {{name}},</p>
      <p>We have an important update about the upcoming Twisted Hearth Foundation event:</p>
      <p>{{update_message}}</p>
      <p>If you have any questions, please don't hesitate to reach out to us.</p>
      <p>Best regards,<br>Jamie & Kat Ruth</p>
    `,
    message_text: `
      Important Event Update
      
      Dear {{name}},
      
      We have an important update about the upcoming Twisted Hearth Foundation event:
      
      {{update_message}}
      
      If you have any questions, please don't hesitate to reach out to us.
      
      Best regards,
      Jamie & Kat Ruth
    `
  },
  {
    id: 'thank_you',
    name: 'Thank You',
    subject: 'Thank You for Attending the Twisted Hearth Foundation Event!',
    message_html: `
      <h2>Thank You for Making It Magical!</h2>
      <p>Dear {{name}},</p>
      <p>Thank you so much for attending our Twisted Hearth Foundation event! Your presence made it truly special.</p>
      <p>We hope you had a wonderful time and created some twisted memories to cherish.</p>
      <p>Photos from the event will be available in our gallery soon, so keep an eye out!</p>
      <p>Until next time,<br>Jamie & Kat Ruth</p>
    `,
    message_text: `
      Thank You for Making It Magical!
      
      Dear {{name}},
      
      Thank you so much for attending our Twisted Hearth Foundation event! Your presence made it truly special.
      
      We hope you had a wonderful time and created some twisted memories to cherish.
      
      Photos from the event will be available in our gallery soon, so keep an eye out!
      
      Until next time,
      Jamie & Kat Ruth
    `
  }
];

const RECIPIENT_FILTERS = [
  { id: 'all_rsvps', label: 'All RSVPs', description: 'Everyone who has RSVPed' },
  { id: 'confirmed_rsvps', label: 'Confirmed RSVPs', description: 'Only confirmed attendees' },
  { id: 'pending_rsvps', label: 'Pending RSVPs', description: 'RSVPs awaiting confirmation' },
  { id: 'all_users', label: 'All Users', description: 'All registered users' }
];

export default function EmailCommunication() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('compose');
  const [composeForm, setComposeForm] = useState({
    subject: '',
    message_html: '',
    message_text: '',
    recipient_filter: 'all_rsvps'
  });
  const [previewRecipients, setPreviewRecipients] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch email campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailCampaign[];
    }
  });

  // Fetch email sends for a specific campaign
  const { data: emailSends, isLoading: sendsLoading } = useQuery({
    queryKey: ['email-sends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sends')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailSend[];
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: typeof composeForm) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaignData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      setComposeForm({ subject: '', message_html: '', message_text: '', recipient_filter: 'all_rsvps' });
      toast({
        title: "Campaign Created",
        description: "Email campaign has been saved as draft."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create campaign: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: { campaignId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['email-sends'] });
      toast({
        title: "Campaign Sent",
        description: "Email campaign has been sent successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send campaign: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Preview recipients mutation
  const previewRecipientsMutation = useMutation({
    mutationFn: async (filter: string) => {
      const { data, error } = await supabase.rpc('get_email_recipients', {
        p_filter: filter
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setPreviewRecipients(data);
      setShowPreview(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to load recipients: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setComposeForm(prev => ({
        ...prev,
        subject: template.subject,
        message_html: template.message_html,
        message_text: template.message_text
      }));
    }
  };

  const handlePreviewRecipients = () => {
    previewRecipientsMutation.mutate(composeForm.recipient_filter);
  };

  const handleSendCampaign = (campaignId: string) => {
    sendCampaignMutation.mutate(campaignId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'sending': return <Clock className="h-4 w-4" />;
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'sending': return 'bg-yellow-500';
      case 'sent': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Email Communication</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <Label htmlFor="recipient-filter">Recipients</Label>
                <Select 
                  value={composeForm.recipient_filter} 
                  onValueChange={(value) => setComposeForm(prev => ({ ...prev, recipient_filter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECIPIENT_FILTERS.map((filter) => (
                      <SelectItem key={filter.id} value={filter.id}>
                        {filter.label} - {filter.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message-html">Message (HTML)</Label>
                <Textarea
                  id="message-html"
                  value={composeForm.message_html}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, message_html: e.target.value }))}
                  placeholder="Enter HTML message..."
                  rows={10}
                />
              </div>

              <div>
                <Label htmlFor="message-text">Message (Text)</Label>
                <Textarea
                  id="message-text"
                  value={composeForm.message_text}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, message_text: e.target.value }))}
                  placeholder="Enter text message..."
                  rows={10}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => createCampaignMutation.mutate(composeForm)}
                  disabled={!composeForm.subject || !composeForm.message_html || createCampaignMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePreviewRecipients}
                  disabled={previewRecipientsMutation.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Recipients
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EMAIL_TEMPLATES.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.subject}
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => handleTemplateSelect(template.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaign History</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{campaign.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {campaign.recipient_count} recipients • 
                            {campaign.sent_count} sent • 
                            {campaign.failed_count} failed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(campaign.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1 capitalize">{campaign.status}</span>
                          </Badge>
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleSendCampaign(campaign.id)}
                              disabled={sendCampaignMutation.isPending}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No email campaigns yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recipient Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {previewRecipients.length} recipients found
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPreview(false)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Close Preview
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {previewRecipients.map((recipient, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{recipient.name}</p>
                            <p className="text-sm text-muted-foreground">{recipient.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Preview Recipients" to see who will receive the email.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Mail, Send, Clock, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getTemplates,
  getCampaigns,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createCampaign,
  sendCampaign,
  type EmailTemplate,
  type EmailCampaign,
} from '@/lib/email-campaigns-api';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { CampaignComposer } from './CampaignComposer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EmailCommunication() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'template' | 'campaign'; id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, campaignsData] = await Promise.all([
        getTemplates(),
        getCampaigns(),
      ]);
      setTemplates(templatesData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Failed to load email data:', error);
      toast.error('Failed to load email data');
    }
  };

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      setIsLoading(true);
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
        toast.success('Template updated successfully');
      } else {
        await createTemplate(templateData as any);
        toast.success('Template created successfully');
      }
      setIsCreatingTemplate(false);
      setEditingTemplate(null);
      loadData();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTarget || deleteTarget.type !== 'template') return;
    
    try {
      setIsLoading(true);
      await deleteTemplate(deleteTarget.id);
      toast.success('Template deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleSaveCampaign = async (campaignData: any) => {
    try {
      setIsLoading(true);
      const campaign = await createCampaign(campaignData);
      
      // Send immediately if not scheduled
      if (!campaignData.scheduled_at) {
        await sendCampaign(campaign.id);
        toast.success('Campaign sent successfully!');
      } else {
        toast.success('Campaign scheduled successfully!');
      }
      
      setIsCreatingCampaign(false);
      loadData();
    } catch (error) {
      console.error('Failed to send campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async (campaignData: any) => {
    try {
      setIsLoading(true);
      const campaign = await createCampaign({ ...campaignData, status: 'draft' });
      await sendCampaign(campaign.id);
      toast.success('Test email sent!');
      loadData();
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'secondary', icon: null },
      scheduled: { variant: 'outline', icon: Clock },
      sending: { variant: 'outline', icon: Send },
      sent: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
    };
    const config = variants[status] || variants.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isCreatingTemplate || editingTemplate) {
    return (
      <EmailTemplateEditor
        template={editingTemplate || undefined}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setIsCreatingTemplate(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  if (isCreatingCampaign) {
    return (
      <CampaignComposer
        onSave={handleSaveCampaign}
        onSendTest={handleSendTestEmail}
        onCancel={() => setIsCreatingCampaign(false)}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Communication
          </CardTitle>
          <CardDescription>
            Manage email templates and send campaigns to your guests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Email Templates</h3>
                <Button onClick={() => setIsCreatingTemplate(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>

              <div className="grid gap-4">
                {templates.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    No templates yet. Create your first email template to get started.
                  </Card>
                ) : (
                  templates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription>{template.subject}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget({ type: 'template', id: template.id });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Email Campaigns</h3>
                <Button onClick={() => setIsCreatingCampaign(true)} disabled={templates.length === 0}>
                  <Send className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>

              <div className="grid gap-4">
                {campaigns.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    {templates.length === 0 ? (
                      <>Create an email template first, then you can send campaigns.</>
                    ) : (
                      <>No campaigns yet. Create your first campaign to send emails to your guests.</>
                    )}
                  </Card>
                ) : (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-base">{campaign.subject}</CardTitle>
                              {getStatusBadge(campaign.status)}
                            </div>
                            <CardDescription>
                              To: {campaign.recipient_list === 'all' ? 'All Guests' : 
                                   campaign.recipient_list === 'rsvp_yes' ? 'Confirmed RSVPs' :
                                   campaign.recipient_list === 'rsvp_pending' ? 'Pending RSVPs' :
                                   `${campaign.custom_recipients?.length || 0} recipients`}
                            </CardDescription>
                            {campaign.sent_at && (
                              <div className="text-sm text-muted-foreground mt-2">
                                Sent: {new Date(campaign.sent_at).toLocaleString()}
                              </div>
                            )}
                            {campaign.status === 'sent' && campaign.stats && (
                              <div className="flex gap-4 mt-2 text-sm">
                                <span>Sent: {campaign.stats.sent}</span>
                                <span>Delivered: {campaign.stats.delivered}</span>
                                {campaign.stats.failed > 0 && (
                                  <span className="text-destructive">Failed: {campaign.stats.failed}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

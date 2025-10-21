import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Mail, Send, Clock, CheckCircle, XCircle, Pencil, Trash2, Megaphone } from "lucide-react";
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
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [pendingCampaign, setPendingCampaign] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, campaignsData] = await Promise.all([
        getTemplates(),
        getCampaigns(),
      ]);
      setTemplates(templatesData || []);
      setCampaigns(campaignsData || []);
    } catch (error) {
      console.error('Failed to load email data:', error);
      // Don't show error toast on initial load failure - just set empty arrays
      setTemplates([]);
      setCampaigns([]);
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
    if (!deleteTarget || deleteTarget.type !== 'template') {
      return;
    }
    
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
    console.log('🔴 START handleSaveCampaign - campaignData:', campaignData);
    console.log('🔴 Current sendDialogOpen state:', sendDialogOpen);
    console.log('🔴 Current pendingCampaign state:', pendingCampaign);
    
    toast.info('Opening confirmation dialog...');
    
    // Set state to show confirmation dialog
    setPendingCampaign(campaignData);
    setSendDialogOpen(true);
    
    // Force a delay to ensure state updates
    setTimeout(() => {
      console.log('🔴 AFTER setState - sendDialogOpen:', sendDialogOpen);
      console.log('🔴 AFTER setState - pendingCampaign:', pendingCampaign);
    }, 100);
    
    console.log('🔴 END handleSaveCampaign function');
  };

  const handleConfirmSend = async () => {
    if (!pendingCampaign) {
      return;
    }
    
    try {
      setIsLoading(true);
      const campaign = await createCampaign(pendingCampaign);
      
      // Send immediately if not scheduled
      if (!pendingCampaign.scheduled_at) {
        await sendCampaign(campaign.id);
        toast.success('Campaign sent successfully!');
      } else {
        toast.success('Campaign scheduled successfully!');
      }
      
      setIsCreatingCampaign(false);
      setSendDialogOpen(false);
      setPendingCampaign(null);
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

  const handleQuickSystemUpdate = () => {
    // Check if system update templates exist
    const adminTemplate = templates.find(t => 
      t.name.toLowerCase().includes('admin summary') || 
      t.name.toLowerCase().includes('system update - admin')
    );
    const userTemplate = templates.find(t => 
      t.name.toLowerCase().includes('guest announcement') || 
      t.name.toLowerCase().includes('system update - guest')
    );
    
    if (!adminTemplate || !userTemplate) {
      toast.warning('System Update templates not found. Creating default templates...');
      // Create default system update templates
      createDefaultSystemUpdateTemplates();
    } else {
      // Open campaign composer with system update pre-selected
      setIsCreatingCampaign(true);
      // You can pre-fill the composer if needed
    }
  };

  const createDefaultSystemUpdateTemplates = async () => {
    try {
      const adminTemplate = {
        name: 'System Update - Admin Summary',
        subject: '🎃 System Update {{VERSION}} - Technical Summary',
        html_content: `
          <h2>System Update - Version {{VERSION}}</h2>
          <p>Technical summary of system updates for administrators.</p>
          
          <h3>✨ Features Added</h3>
          <ul>
            {{#each FEATURES_ADDED}}
            <li><strong>{{this.title}}:</strong> {{this.description}}</li>
            {{/each}}
          </ul>
          
          <h3>🔧 APIs Changed</h3>
          <ul>
            {{#each APIS_CHANGED}}
            <li><code>{{this.endpoint}}</code> - {{this.change}}</li>
            {{/each}}
          </ul>
          
          <h3>🎨 UI Updates</h3>
          <ul>
            {{#each UI_UPDATES}}
            <li><strong>{{this.component}}:</strong> {{this.change}}</li>
            {{/each}}
          </ul>
          
          <h3>🐛 Bug Fixes</h3>
          <ul>
            {{#each BUG_FIXES}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <h3>⚠️ Breaking Changes</h3>
          <ul>
            {{#each BREAKING_CHANGES}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <h3>🗄️ Database Changes</h3>
          <ul>
            {{#each DATABASE_CHANGES}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <p>Technical Contact: <a href="{{SITE_URL}}/admin/contact">Admin Support</a></p>
        `,
        is_active: true,
        category: 'system-admin'
      };

      const userTemplate = {
        name: 'System Update - Guest Announcement',
        subject: '🎃 We Made Your Party Experience Even Better! {{VERSION}}',
        html_content: `
          <h1>🎃 We Made Your Party Experience Even Better!</h1>
          <p>Hey party people! 🎉✨</p>
          
          <h2>✨ What's New & Awesome!</h2>
          <p>We've been working hard to make your party experience even more magical! 🎩✨</p>
          {{#each FEATURES_ADDED}}
          <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 10px; border: 2px solid #d4af37;">
            <h3>🎉 {{this.title}}</h3>
            <p>{{this.benefit}}</p>
          </div>
          {{/each}}
          
          <h2>🔧 What We Fixed!</h2>
          <p>Oops! We found some sneaky bugs and squashed them! 🐛💥</p>
          <ul>
            {{#each BUG_FIXES}}
            <li>🎯 {{this}}</li>
            {{/each}}
          </ul>
          
          <h2>🚀 What's Better Now!</h2>
          <p>We made everything smoother and more fun! 🌟</p>
          <ul>
            {{#each IMPROVEMENTS}}
            <li>⭐ {{this}}</li>
            {{/each}}
          </ul>
          
          {{#if KNOWN_ISSUES}}
          <h2>⚠️ Heads Up, Party People!</h2>
          <p>We found a few little quirks that we're working on fixing:</p>
          <ul>
            {{#each KNOWN_ISSUES}}
            <li>🔍 {{this}}</li>
            {{/each}}
          </ul>
          <p><em>Don't worry - we're on it! These will be fixed soon! 🛠️✨</em></p>
          {{/if}}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{SITE_URL}}" style="background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Check It Out! 🎃</a>
          </div>
          
          <p><strong>See you at the bash! 🎭✨</strong></p>
        `,
        is_active: true,
        category: 'system-user'
      };
      
      await Promise.all([
        createTemplate(adminTemplate),
        createTemplate(userTemplate)
      ]);
      
      toast.success('System Update templates created!');
      loadData(); // Reload templates
    } catch (error) {
      console.error('Failed to create templates:', error);
      toast.error('Failed to create system update templates');
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
      <div>
        <CampaignComposer
          onSave={handleSaveCampaign}
          onSendTest={handleSendTestEmail}
          onCancel={() => setIsCreatingCampaign(false)}
        />

        {/* Send Campaign Confirmation Dialog (rendered while composing) */}
        <AlertDialog 
          open={sendDialogOpen} 
          onOpenChange={(open) => {
            console.log('📧 Dialog open state changed (composer branch):', open);
            setSendDialogOpen(open);
            if (!open) {
              setPendingCampaign(null);
            }
          }}
        >
          <AlertDialogContent className="max-w-[calc(100vw-32px)] sm:max-w-md mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Send Email Campaign?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>You are about to send an email campaign. Please review the details:</p>
                  {pendingCampaign && (
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Subject:</span> {pendingCampaign.subject}
                      </div>
                      <div>
                        <span className="font-semibold">Recipients:</span>{' '}
                        {pendingCampaign.recipient_list === 'all' ? 'All Guests' :
                          pendingCampaign.recipient_list === 'rsvp_yes' ? 'Confirmed RSVPs' :
                          pendingCampaign.recipient_list === 'rsvp_pending' ? 'Pending RSVPs' :
                          `${pendingCampaign.custom_recipients?.length || 0} custom recipients`}
                      </div>
                      {pendingCampaign.scheduled_at && (
                        <div>
                          <span className="font-semibold">Scheduled for:</span>{' '}
                          {new Date(pendingCampaign.scheduled_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-destructive font-semibold">⚠️ This action cannot be undone. Emails will be sent immediately.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                console.log('📧 Cancel clicked (composer branch)');
                setSendDialogOpen(false);
                setPendingCampaign(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSend} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : pendingCampaign?.scheduled_at ? 'Schedule Campaign' : 'Send Now'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div>
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
            <TabsList className="h-auto p-0 bg-transparent gap-1 justify-start border-b border-border">
              <TabsTrigger 
                value="templates"
                className="rounded-t-lg rounded-b-none border border-border border-b-0 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground relative data-[state=active]:z-10 data-[state=active]:-mb-px px-6 py-3"
              >
                Templates
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns"
                className="rounded-t-lg rounded-b-none border border-border border-b-0 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground relative data-[state=active]:z-10 data-[state=active]:-mb-px px-6 py-3"
              >
                Campaigns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-0 pt-6 space-y-4 border border-t-0 border-border rounded-b-lg rounded-tr-lg bg-card p-6">
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

            <TabsContent value="campaigns" className="mt-0 pt-6 space-y-4 border border-t-0 border-border rounded-b-lg rounded-tr-lg bg-card p-6">
              {/* Quick Actions for Common Templates */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h4>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleQuickSystemUpdate()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Megaphone className="h-4 w-4" />
                    Send System Update
                  </Button>
                </div>
              </div>

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
                                   campaign.recipient_list === 'admins' ? 'All Admins' :
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

      {/* Delete Confirmation Dialog */}
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

      {/* Send Campaign Confirmation Dialog */}
      <AlertDialog 
        open={sendDialogOpen} 
        onOpenChange={(open) => {
          console.log('📧 Dialog open state changed:', open);
          setSendDialogOpen(open);
          if (!open) {
            setPendingCampaign(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-[calc(100vw-32px)] sm:max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email Campaign?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You are about to send an email campaign. Please review the details:</p>
                
                {pendingCampaign && (
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Subject:</span> {pendingCampaign.subject}
                    </div>
                    <div>
                      <span className="font-semibold">Recipients:</span>{' '}
                      {pendingCampaign.recipient_list === 'all' ? 'All Guests' :
                       pendingCampaign.recipient_list === 'rsvp_yes' ? 'Confirmed RSVPs' :
                       pendingCampaign.recipient_list === 'rsvp_pending' ? 'Pending RSVPs' :
                       `${pendingCampaign.custom_recipients?.length || 0} custom recipients`}
                    </div>
                    {pendingCampaign.scheduled_at && (
                      <div>
                        <span className="font-semibold">Scheduled for:</span>{' '}
                        {new Date(pendingCampaign.scheduled_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-destructive font-semibold">
                  ⚠️ This action cannot be undone. Emails will be sent immediately.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              console.log('📧 Cancel clicked');
              setSendDialogOpen(false);
              setPendingCampaign(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSend}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : pendingCampaign?.scheduled_at ? 'Schedule Campaign' : 'Send Now'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

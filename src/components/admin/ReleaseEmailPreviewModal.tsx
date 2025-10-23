import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Loader2, 
  Users, 
  UserCheck, 
  ChevronsUpDown, 
  Check, 
  X,
  Mail,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendReleaseEmail, previewReleaseEmail } from '@/lib/release-api';
import { FullRelease } from '@/lib/release-api';

interface User {
  id: string;
  email: string;
  display_name?: string;
}

interface ReleaseEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: FullRelease;
  onEmailSent: () => void;
}

export default function ReleaseEmailPreviewModal({
  isOpen,
  onClose,
  release,
  onEmailSent,
}: ReleaseEmailPreviewModalProps) {
  const [emailType, setEmailType] = useState<'admin' | 'user'>('admin');
  const [recipientGroups, setRecipientGroups] = useState<string[]>([]);
  const [customRecipients, setCustomRecipients] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'html'>('preview');

  // Available recipient groups
  const availableGroups = [
    { id: 'all', label: 'All Users', description: 'All registered users' },
    { id: 'admins', label: 'All Admins', description: 'Administrators only' },
    { id: 'rsvp_yes', label: 'Confirmed RSVPs', description: 'Users who confirmed attendance' },
    { id: 'rsvp_pending', label: 'Pending RSVPs', description: 'Users with pending RSVPs' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
      generatePreview();
    }
  }, [isOpen, emailType]);

  useEffect(() => {
    generatePreview();
  }, [emailType]);

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
      toast.error('Failed to load users');
    }
  };

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      const preview = await previewReleaseEmail(release.id, emailType);
      setRenderedHtml(preview.html);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast.error('Failed to generate email preview');
      setRenderedHtml('<div style="padding: 20px; color: red;">Failed to load email preview</div>');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupToggle = (groupId: string, checked: boolean) => {
    if (checked) {
      setRecipientGroups(prev => [...prev, groupId]);
    } else {
      setRecipientGroups(prev => prev.filter(id => id !== groupId));
    }
  };

  const addUserToRecipients = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user && !customRecipients.includes(user.email)) {
      setCustomRecipients(prev => [...prev, user.email]);
    }
  };

  const removeCustomRecipient = (email: string) => {
    setCustomRecipients(prev => prev.filter(e => e !== email));
  };

  const handleSendEmail = async () => {
    if (recipientGroups.length === 0 && customRecipients.length === 0) {
      toast.error('Please select at least one recipient group or individual users');
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending email with params:', {
        releaseId: release.id,
        emailType,
        recipientGroups,
        customRecipients,
      });

      await sendReleaseEmail({
        releaseId: release.id,
        emailType,
        recipientGroups,
        customRecipients,
      });

      toast.success(`System update email sent successfully to ${emailType} recipients`);
      onEmailSent();
      onClose();
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const getTotalRecipientCount = () => {
    // This is a simplified count - in a real implementation, you'd query the actual counts
    let count = 0;
    if (recipientGroups.includes('all')) count += 100; // Placeholder
    if (recipientGroups.includes('admins')) count += 5; // Placeholder
    if (recipientGroups.includes('rsvp_yes')) count += 50; // Placeholder
    if (recipientGroups.includes('rsvp_pending')) count += 20; // Placeholder
    count += customRecipients.length;
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send System Update Email - v{release.version}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Left Panel - Configuration */}
          <div className="w-1/3 space-y-6 overflow-y-auto">
            {/* Email Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Version</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={emailType} onValueChange={(value) => setEmailType(value as 'admin' | 'user')}>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <div className="space-y-1">
                      <Label htmlFor="admin" className="font-semibold">Admins Only (Technical)</Label>
                      <p className="text-sm text-muted-foreground">
                        Detailed technical information including API changes, database updates, and breaking changes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <div className="space-y-1">
                      <Label htmlFor="user" className="font-semibold">Users Only (Guest-Friendly)</Label>
                      <p className="text-sm text-muted-foreground">
                        Simplified, user-friendly content focusing on benefits and improvements
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Recipient Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipient Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableGroups.map((group) => (
                  <div key={group.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={group.id}
                      checked={recipientGroups.includes(group.id)}
                      onCheckedChange={(checked) => handleGroupToggle(group.id, checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={group.id} className="font-medium">{group.label}</Label>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Individual Recipients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Individual Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Add individual users...
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

                {/* Selected Recipients */}
                {customRecipients.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Users ({customRecipients.length})</Label>
                    <div className="space-y-1">
                      {customRecipients.map((email) => (
                        <div key={email} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">{email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomRecipient(email)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Total Recipients:</strong> {getTotalRecipientCount()}
                  </div>
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={isSending || recipientGroups.length === 0 && customRecipients.length === 0}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'preview' | 'html')} className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML Source</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {emailType === 'admin' ? 'Technical Version' : 'User-Friendly Version'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={generatePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Refresh Preview
                  </Button>
                </div>
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
                        className="w-full h-full bg-white rounded shadow-sm min-h-[500px]"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

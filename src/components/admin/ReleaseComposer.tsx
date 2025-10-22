import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical, Save, Send, Eye } from 'lucide-react';
import { parseVersion, formatVersion, getVersionIncrementOptions, isValidVersion } from '@/lib/version-utils';
import { createReleaseDraft, versionExists, fetchReleaseById, updateRelease } from '@/lib/release-api';
import { toast } from 'sonner';

const releaseSchema = z.object({
  version: z.string().min(1, 'Version is required').refine(isValidVersion, 'Invalid version format'),
  release_date: z.string().min(1, 'Release date is required'),
  environment: z.enum(['development', 'staging', 'production']),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  features: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    benefit: z.string().optional(),
    sort_order: z.number(),
  })).default([]),
  api_changes: z.array(z.object({
    endpoint: z.string().min(1, 'Endpoint is required'),
    change_type: z.enum(['new', 'modified', 'deprecated', 'removed']),
    description: z.string().min(1, 'Description is required'),
    sort_order: z.number(),
  })).default([]),
  bug_fixes: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    component: z.string().optional(),
    sort_order: z.number(),
  })).default([]),
  improvements: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    component: z.string().optional(),
    sort_order: z.number(),
  })).default([]),
  ui_updates: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    component: z.string().optional(),
    sort_order: z.number(),
  })).default([]),
  database_changes: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    sort_order: z.number(),
  })).default([]),
  breaking_changes: z.array(z.object({
    content: z.string().min(1, 'Content is required'),
  })).default([]),
  known_issues: z.array(z.object({
    content: z.string().min(1, 'Content is required'),
  })).default([]),
  technical_notes: z.array(z.object({
    content: z.string().min(1, 'Content is required'),
  })).default([]),
});

type ReleaseFormValues = z.infer<typeof releaseSchema>;

interface ReleaseComposerProps {
  releaseId?: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

export default function ReleaseComposer({ releaseId, onComplete, onCancel }: ReleaseComposerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRelease, setIsLoadingRelease] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [currentVersion] = useState('1.1.7'); // This should come from API

  const form = useForm<ReleaseFormValues>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      version: '',
      release_date: new Date().toISOString().split('T')[0],
      environment: 'production',
      summary: '',
      features: [],
      api_changes: [],
      bug_fixes: [],
      improvements: [],
      ui_updates: [],
      database_changes: [],
      breaking_changes: [],
      known_issues: [],
      technical_notes: [],
    },
  });

  const versionOptions = getVersionIncrementOptions(currentVersion);

  // Load release data when editing
  useEffect(() => {
    if (releaseId) {
      setIsLoadingRelease(true);
      fetchReleaseById(releaseId)
        .then((release) => {
          form.reset({
            version: release.version,
            release_date: release.release_date,
            environment: release.environment,
            summary: release.summary,
            features: release.features || [],
            api_changes: release.api_changes || [],
            bug_fixes: release.changes?.filter(c => c.category === 'bug_fix').map(c => ({
              description: c.description,
              component: c.component,
              sort_order: c.sort_order,
            })) || [],
            improvements: release.changes?.filter(c => c.category === 'improvement').map(c => ({
              description: c.description,
              component: c.component,
              sort_order: c.sort_order,
            })) || [],
            ui_updates: release.changes?.filter(c => c.category === 'ui_update').map(c => ({
              description: c.description,
              component: c.component,
              sort_order: c.sort_order,
            })) || [],
            database_changes: release.changes?.filter(c => c.category === 'database').map(c => ({
              description: c.description,
              sort_order: c.sort_order,
            })) || [],
            breaking_changes: release.notes?.filter(n => n.note_type === 'breaking').map(n => ({
              content: n.content,
            })) || [],
            known_issues: release.notes?.filter(n => n.note_type === 'known_issue').map(n => ({
              content: n.content,
            })) || [],
            technical_notes: release.notes?.filter(n => n.note_type === 'technical').map(n => ({
              content: n.content,
            })) || [],
          });
        })
        .catch((error) => {
          toast.error(`Failed to load release: ${error.message}`);
          onCancel();
        })
        .finally(() => {
          setIsLoadingRelease(false);
        });
    }
  }, [releaseId, form, onCancel]);

  const addItem = (field: keyof ReleaseFormValues) => {
    const currentItems = form.getValues(field) as any[];
    const newItem: any = {
      sort_order: currentItems.length,
    };

    switch (field) {
      case 'features':
        newItem.title = '';
        newItem.description = '';
        newItem.benefit = '';
        break;
      case 'api_changes':
        newItem.endpoint = '';
        newItem.change_type = 'new';
        newItem.description = '';
        break;
      case 'bug_fixes':
      case 'improvements':
      case 'ui_updates':
        newItem.description = '';
        newItem.component = '';
        break;
      case 'database_changes':
        newItem.description = '';
        break;
      case 'breaking_changes':
      case 'known_issues':
      case 'technical_notes':
        newItem.content = '';
        break;
    }

    form.setValue(field, [...currentItems, newItem] as any);
  };

  const removeItem = (field: keyof ReleaseFormValues, index: number) => {
    const currentItems = form.getValues(field) as any[];
    form.setValue(field, currentItems.filter((_, i) => i !== index) as any);
  };

  const handlePreview = () => {
    const data = form.getValues();
    
    // Validate required fields
    if (!data.version || !data.release_date || !data.summary) {
      toast.error('Please fill in Version, Release Date, and Summary before previewing');
      return;
    }
    
    // Create preview content
    const previewContent = `
Version: ${data.version}
Environment: ${data.environment}
Release Date: ${data.release_date}

Summary:
${data.summary}

Features: ${data.features?.length || 0}
API Changes: ${data.api_changes?.length || 0}
Bug Fixes: ${data.bug_fixes?.length || 0}
Improvements: ${data.improvements?.length || 0}
UI Updates: ${data.ui_updates?.length || 0}
Database Changes: ${data.database_changes?.length || 0}
Breaking Changes: ${data.breaking_changes?.length || 0}
Known Issues: ${data.known_issues?.length || 0}
Technical Notes: ${data.technical_notes?.length || 0}
    `;
    
    // Show preview in toast with longer duration
    toast.info(previewContent, { duration: 10000 });
  };

  const onSubmit = async (data: ReleaseFormValues) => {
    setIsSaving(true);
    try {
      // Parse version
      const parsed = parseVersion(data.version);

      // Combine all changes into proper format
      const releaseData = {
        version: data.version,
        major_version: parsed.major,
        minor_version: parsed.minor,
        patch_version: parsed.patch,
        pre_release: parsed.preRelease,
        release_date: data.release_date,
        summary: data.summary,
        environment: data.environment,
        features: data.features.map(f => ({
          title: f.title || '',
          description: f.description || '',
          benefit: f.benefit,
          sort_order: f.sort_order || 0,
        })),
        api_changes: data.api_changes.map(a => ({
          endpoint: a.endpoint || '',
          change_type: a.change_type,
          description: a.description || '',
          sort_order: a.sort_order || 0,
        })),
        changes: [
          ...data.bug_fixes.map(item => ({ description: item.description || '', component: item.component, category: 'bug_fix' as const, sort_order: item.sort_order || 0 })),
          ...data.improvements.map(item => ({ description: item.description || '', component: item.component, category: 'improvement' as const, sort_order: item.sort_order || 0 })),
          ...data.ui_updates.map(item => ({ description: item.description || '', component: item.component, category: 'ui_update' as const, sort_order: item.sort_order || 0 })),
          ...data.database_changes.map(item => ({ description: item.description || '', category: 'database' as const, sort_order: item.sort_order || 0 })),
        ],
        notes: [
          ...data.breaking_changes.map(item => ({ content: item.content || '', note_type: 'breaking' as const })),
          ...data.known_issues.map(item => ({ content: item.content || '', note_type: 'known_issue' as const })),
          ...data.technical_notes.map(item => ({ content: item.content || '', note_type: 'technical' as const })),
        ],
      };

      if (releaseId) {
        // UPDATE existing release
        await updateRelease(releaseId, releaseData as any);
        toast.success(`Release v${data.version} updated successfully`);
      } else {
        // CREATE new release
        const exists = await versionExists(data.version);
        if (exists) {
          toast.error('A release with this version already exists');
          setIsSaving(false);
          return;
        }
        
        const newReleaseId = await createReleaseDraft(releaseData as any);
        toast.success(`Release v${data.version} created successfully`);
      }
      
      onComplete();
    } catch (error: any) {
      toast.error(`Failed to ${releaseId ? 'update' : 'create'} release: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {releaseId ? 'Edit Release' : 'Create Release'}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {releaseId ? 'Update release details' : 'Create a new release with all details'}
          </p>
        </div>
      </div>

      {isLoadingRelease ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Version Info */}
          <Card>
            <CardHeader>
              <CardTitle>Version Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version *</FormLabel>
                      <FormControl>
                        <Input placeholder="3.0.4" {...field} />
                      </FormControl>
                      <FormDescription>
                        Suggested versions:
                        <div className="flex flex-wrap gap-2 mt-2">
                          {versionOptions.map((opt) => (
                            <Button
                              key={opt.type}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange(opt.suggested)}
                              className="text-xs"
                            >
                              {opt.suggested} ({opt.type})
                            </Button>
                          ))}
                        </div>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="release_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Executive Summary *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief overview of this release (max 200 words)..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a concise summary of the key changes in this release
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sections 2-10: Tabbed Content */}
          <Card>
            <CardHeader>
              <CardTitle>Release Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Mobile: Dropdown Selector */}
                <div className="block lg:hidden mb-4">
                  <Select
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="api">API Changes</SelectItem>
                      <SelectItem value="ui">UI Updates</SelectItem>
                      <SelectItem value="bugs">Bug Fixes</SelectItem>
                      <SelectItem value="improvements">Improvements</SelectItem>
                      <SelectItem value="database">Database Changes</SelectItem>
                      <SelectItem value="breaking">Breaking Changes</SelectItem>
                      <SelectItem value="issues">Known Issues</SelectItem>
                      <SelectItem value="technical">Technical Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop: Horizontal Tabs */}
                <div className="hidden lg:block overflow-x-auto">
                  <TabsList className="grid grid-cols-9 w-max min-w-full">
                    <TabsTrigger value="features" className="text-xs sm:text-sm">Features</TabsTrigger>
                    <TabsTrigger value="api" className="text-xs sm:text-sm">API</TabsTrigger>
                    <TabsTrigger value="ui" className="text-xs sm:text-sm">UI</TabsTrigger>
                    <TabsTrigger value="bugs" className="text-xs sm:text-sm">Bugs</TabsTrigger>
                    <TabsTrigger value="improvements" className="text-xs sm:text-sm">Improvements</TabsTrigger>
                    <TabsTrigger value="database" className="text-xs sm:text-sm">Database</TabsTrigger>
                    <TabsTrigger value="breaking" className="text-xs sm:text-sm">Breaking</TabsTrigger>
                    <TabsTrigger value="issues" className="text-xs sm:text-sm">Issues</TabsTrigger>
                    <TabsTrigger value="technical" className="text-xs sm:text-sm">Technical</TabsTrigger>
                  </TabsList>
                </div>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">New features in this release</p>
                    <Button type="button" size="sm" onClick={() => addItem('features')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </div>
                  
                  {form.watch('features').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('features', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`features.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Feature Title</FormLabel>
                              <FormControl>
                                <Input placeholder="New notification system" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`features.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Detailed description of the feature..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`features.${index}.benefit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User Benefit (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Stay informed about important updates..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* API Changes Tab */}
                <TabsContent value="api" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">API modifications</p>
                    <Button type="button" size="sm" onClick={() => addItem('api_changes')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add API Change
                    </Button>
                  </div>
                  
                  {form.watch('api_changes').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('api_changes', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`api_changes.${index}.endpoint`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endpoint</FormLabel>
                                <FormControl>
                                  <Input placeholder="/api/v1/users" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`api_changes.${index}.change_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Change Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="modified">Modified</SelectItem>
                                    <SelectItem value="deprecated">Deprecated</SelectItem>
                                    <SelectItem value="removed">Removed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`api_changes.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Description of the API change..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* UI Updates Tab */}
                <TabsContent value="ui" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">UI updates and improvements</p>
                    <Button type="button" size="sm" onClick={() => addItem('ui_updates')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add UI Update
                    </Button>
                  </div>
                  
                  {form.watch('ui_updates').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('ui_updates', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`ui_updates.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Description of the UI update..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`ui_updates.${index}.component`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Component (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Dashboard, Settings"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Bug Fixes Tab */}
                <TabsContent value="bugs" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Bug fixes in this release</p>
                    <Button type="button" size="sm" onClick={() => addItem('bug_fixes')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bug Fix
                    </Button>
                  </div>
                  
                  {form.watch('bug_fixes').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('bug_fixes', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`bug_fixes.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Description of the bug fix..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`bug_fixes.${index}.component`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Component (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Login, Dashboard"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Improvements Tab */}
                <TabsContent value="improvements" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Performance and quality improvements</p>
                    <Button type="button" size="sm" onClick={() => addItem('improvements')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Improvement
                    </Button>
                  </div>
                  
                  {form.watch('improvements').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('improvements', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`improvements.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Description of the improvement..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`improvements.${index}.component`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Component (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., API, Database"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Database Changes Tab */}
                <TabsContent value="database" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Database schema and migration changes</p>
                    <Button type="button" size="sm" onClick={() => addItem('database_changes')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Database Change
                    </Button>
                  </div>
                  
                  {form.watch('database_changes').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('database_changes', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`database_changes.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Description of the database change..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Breaking Changes Tab */}
                <TabsContent value="breaking" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Breaking changes that require action</p>
                    <Button type="button" size="sm" onClick={() => addItem('breaking_changes')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Breaking Change
                    </Button>
                  </div>
                  
                  {form.watch('breaking_changes').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('breaking_changes', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`breaking_changes.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Breaking Change</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the breaking change and required actions..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Known Issues Tab */}
                <TabsContent value="issues" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Known issues in this release</p>
                    <Button type="button" size="sm" onClick={() => addItem('known_issues')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Known Issue
                    </Button>
                  </div>
                  
                  {form.watch('known_issues').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('known_issues', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`known_issues.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Known Issue</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the known issue..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Technical Notes Tab */}
                <TabsContent value="technical" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Technical notes for developers</p>
                    <Button type="button" size="sm" onClick={() => addItem('technical_notes')} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Technical Note
                    </Button>
                  </div>
                  
                  {form.watch('technical_notes').map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem('technical_notes', index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`technical_notes.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Technical Note</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Technical details for developers..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={handlePreview} className="w-full sm:w-auto">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
      )}
    </div>
  );
}

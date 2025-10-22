import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Papa from 'papaparse';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, GripVertical, Save, Send, Eye, Upload, FileText, AlertCircle, Mail, Users, FileSpreadsheet } from 'lucide-react';
import EmailPreviewModal from '@/components/admin/EmailPreviewModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { parseVersion, formatVersion, getVersionIncrementOptions, isValidVersion } from '@/lib/version-utils';
import { createReleaseDraft, versionExists, fetchReleaseById, updateRelease } from '@/lib/release-api';
import { toast } from 'sonner';

// Helper to safely parse number or fall back to index
const toNumOrIndex = (token: string | undefined, idx: number): number => {
  if (!token) return idx;
  const parsed = parseInt(token.trim());
  return Number.isFinite(parsed) ? parsed : idx;
};

const releaseSchema = z.object({
  version: z.string().min(1, 'Version is required').refine(isValidVersion, 'Invalid version format'),
  release_date: z.string().min(1, 'Release date is required'),
  environment: z.enum(['development', 'staging', 'production']),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  features: z.array(z.object({
    title: z.string().optional().default(''),
    description: z.string().optional().default(''),
    benefit: z.string().optional().default(''),
    sort_order: z.coerce.number().transform(n => Number.isFinite(n) ? n : 0),
  })).default([]),
  api_changes: z.array(z.object({
    endpoint: z.string().optional().default(''),
    change_type: z.enum(['new', 'modified', 'deprecated', 'removed']),
    description: z.string().optional().default(''),
    sort_order: z.coerce.number().transform(n => Number.isFinite(n) ? n : 0),
  })).default([]),
  bug_fixes: z.array(z.object({
    description: z.string().optional().default(''),
    component: z.string().optional().default(''),
    sort_order: z.coerce.number().transform(n => Number.isFinite(n) ? n : 0),
  })).default([]),
  improvements: z.array(z.object({
    description: z.string().optional().default(''),
    component: z.string().optional().default(''),
    sort_order: z.coerce.number().transform(n => Number.isFinite(n) ? n : 0),
  })).default([]),
  ui_updates: z.array(z.object({
    description: z.string().optional().default(''),
    component: z.string().optional().default(''),
    sort_order: z.coerce.number().transform(n => Number.isFinite(n) ? n : 0),
  })).default([]),
  database_changes: z.array(z.object({
    description: z.string().optional().default(''),
    sort_order: z.coerce.number().transform(n => Number.isFinite(n) ? n : 0),
  })).default([]),
  breaking_changes: z.array(z.object({
    content: z.string().optional().default(''),
  })).default([]),
  known_issues: z.array(z.object({
    content: z.string().optional().default(''),
  })).default([]),
  technical_notes: z.array(z.object({
    content: z.string().optional().default(''),
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
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadFileType, setUploadFileType] = useState<'markdown' | 'csv'>('markdown');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showAdminPreview, setShowAdminPreview] = useState(false);
  const [showUserPreview, setShowUserPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
          // Check if email has been sent
          setIsEmailSent(release.email_sent || false);
          
          // If email sent, make form read-only
          if (release.email_sent) {
            toast.info('This release has been sent and cannot be edited');
          }
          
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isMarkdown = file.name.endsWith('.md');
    const isCsv = file.name.endsWith('.csv');
    
    if (!isMarkdown && !isCsv) {
      toast.error('Please upload a Markdown (.md) or CSV (.csv) file');
      return;
    }

    setIsParsingFile(true);

    try {
      const text = await file.text();
      let parsed: Partial<ReleaseFormValues>;
      
      if (isCsv) {
        parsed = parseReleaseCSV(text);
      } else {
        parsed = parseReleaseTemplate(text);
      }
      
      const normalized = normalizeParsedTemplate(parsed);
      
      // Set all normalized values
      Object.entries(normalized).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value);
        }
      });

      // Trigger validation after setting values
      setTimeout(async () => {
        const isValid = await form.trigger();
        if (!isValid) {
          const errors = form.formState.errors;
          const flattened = flattenValidationErrors(errors);
          setValidationErrors(flattened);
          toast.warning(`Template uploaded with ${flattened.length} validation issue(s). Please review and fix.`);
        } else {
          setValidationErrors([]);
          toast.success("Template uploaded and validated successfully!");
        }
      }, 100);
      
      setShowFileUpload(false);
    } catch (error: any) {
      toast.error(`Failed to parse file: ${error.message}`);
    } finally {
      setIsParsingFile(false);
    }
  };

  // Helper to flatten validation errors into readable strings
  const flattenValidationErrors = (errors: any, prefix = ''): string[] => {
    const messages: string[] = [];
    
    Object.keys(errors).forEach(key => {
      const error = errors[key];
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (error?.message) {
        messages.push(`${path}: ${error.message}`);
      } else if (Array.isArray(error)) {
        error.forEach((item, index) => {
          if (item && typeof item === 'object') {
            messages.push(...flattenValidationErrors(item, `${path}[${index}]`));
          }
        });
      } else if (error && typeof error === 'object') {
        messages.push(...flattenValidationErrors(error, path));
      }
    });
    
    return messages;
  };

  // Normalize parsed template data to match schema expectations
  const normalizeParsedTemplate = (parsed: Partial<ReleaseFormValues>): Partial<ReleaseFormValues> => {
    const normalized = { ...parsed };
    let autoNumbered = false;
    
    // Normalize environment
    if (normalized.environment) {
      const env = normalized.environment.toLowerCase();
      if (['production', 'staging', 'development'].includes(env)) {
        normalized.environment = env as 'production' | 'staging' | 'development';
      } else {
        normalized.environment = 'production';
        toast.info('Environment normalized to production');
      }
    }
    
    // Normalize API changes change_type
    if (normalized.api_changes && Array.isArray(normalized.api_changes)) {
      normalized.api_changes = normalized.api_changes.map((change, idx) => {
        const newChange = { ...change };
        if (change.change_type) {
          const type = change.change_type.toLowerCase();
          if (['new', 'modified', 'deprecated', 'removed'].includes(type)) {
            newChange.change_type = type as 'new' | 'modified' | 'deprecated' | 'removed';
          } else {
            newChange.change_type = 'modified' as const;
          }
        }
        // Ensure valid sort_order
        if (!Number.isFinite(newChange.sort_order)) {
          newChange.sort_order = idx;
          autoNumbered = true;
        }
        return newChange;
      });
    }
    
    // Reindex all array fields to ensure valid sort_order
    const arrayFields = ['features', 'bug_fixes', 'improvements', 'ui_updates', 'database_changes'] as const;
    arrayFields.forEach(field => {
      if (normalized[field] && Array.isArray(normalized[field])) {
        (normalized[field] as any) = (normalized[field] as any).map((item: any, idx: number) => {
          if (!Number.isFinite(item.sort_order)) {
            autoNumbered = true;
            return { ...item, sort_order: idx };
          }
          return item;
        });
      }
    });
    
    // Normalize release_date to YYYY-MM-DD
    if (normalized.release_date) {
      try {
        const date = new Date(normalized.release_date);
        if (!isNaN(date.getTime())) {
          normalized.release_date = date.toISOString().split('T')[0];
        } else {
          normalized.release_date = undefined;
        }
      } catch {
        normalized.release_date = undefined;
      }
    }
    
    if (autoNumbered) {
      toast.info('Some items were auto-numbered. You can reorder them in the form.');
    }
    
    return normalized;
  };

  const parseReleaseTemplate = (content: string): Partial<ReleaseFormValues> => {
    const result: Partial<ReleaseFormValues> = {
      features: [],
      api_changes: [],
      ui_updates: [],
      bug_fixes: [],
      improvements: [],
      database_changes: [],
      breaking_changes: [],
      known_issues: [],
      technical_notes: [],
    };

    // Extract version
    const versionMatch = content.match(/VERSION:\s*(.+)/);
    if (versionMatch) result.version = versionMatch[1].trim();

    // Extract release date
    const dateMatch = content.match(/RELEASE_DATE:\s*(.+)/);
    if (dateMatch) result.release_date = dateMatch[1].trim();

    // Extract environment
    const envMatch = content.match(/ENVIRONMENT:\s*(.+)/);
    if (envMatch) result.environment = envMatch[1].trim() as any;

    // Extract summary
    const summaryMatch = content.match(/## Executive Summary\n(.+?)(?=\n+##)/s);
    if (summaryMatch) result.summary = summaryMatch[1].trim();

    // Parse Features section
    const featuresSection = content.match(/## Features\n(?:<!--.*?-->\n)?(.+?)(?=\n+##)/s);
    if (featuresSection) {
      const lines = featuresSection[1].split('\n').filter(l => l.trim().startsWith('-'));
      result.features = lines.map((line, idx) => {
        const parts = line.replace(/^-\s*/, '').split('|').map(p => p.trim());
        
        return {
          title: parts[0] || '',
          description: parts[1] || '',
          benefit: parts[2] || undefined,
          sort_order: toNumOrIndex(parts[3], idx),
        };
      }).filter(f => f.title && f.description);
    }

    // Parse API Changes section
    const apiSection = content.match(/## API Changes\n(?:<!--.*?-->\n)?(.+?)(?=\n+##)/s);
    if (apiSection) {
      const lines = apiSection[1].split('\n').filter(l => l.trim().startsWith('-'));
      result.api_changes = lines.map((line, idx) => {
        const parts = line.replace(/^-\s*/, '').split('|').map(p => p.trim());
        const changeType = (parts[1] || 'modified').toLowerCase();
        const validChangeType = ['new', 'modified', 'deprecated', 'removed'].includes(changeType) 
          ? changeType 
          : 'modified';
        
        return {
          endpoint: parts[0] || '',
          change_type: validChangeType as 'new' | 'modified' | 'deprecated' | 'removed',
          description: parts[2] || '',
          sort_order: toNumOrIndex(parts[3], idx),
        };
      }).filter(a => a.endpoint && a.description);
    }

    // Parse simple list sections (UI, Bugs, Improvements)
    const parseSimpleSection = (sectionName: string, fieldName: keyof ReleaseFormValues) => {
      const regex = new RegExp(`## ${sectionName}\\n(?:<!--.*?-->\\n)?(.+?)(?=\\n+##)`, 's');
      const match = content.match(regex);
      if (match) {
        const lines = match[1].split('\n').filter(l => l.trim().startsWith('-'));
        (result as any)[fieldName] = lines.map((line, idx) => {
          const parts = line.replace(/^-\s*/, '').split('|').map(p => p.trim());
          
          return {
            description: parts[0] || '',
            component: parts[1] || undefined,
            sort_order: toNumOrIndex(parts[2], idx),
          };
        }).filter(item => item.description);
      }
    };

    parseSimpleSection('UI Updates', 'ui_updates');
    parseSimpleSection('Bug Fixes', 'bug_fixes');
    parseSimpleSection('Improvements', 'improvements');

    // Parse Database Changes
    const dbSection = content.match(/## Database Changes\n(?:<!--.*?-->\n)?(.+?)(?=\n+##)/s);
    if (dbSection) {
      const lines = dbSection[1].split('\n').filter(l => l.trim().startsWith('-'));
      result.database_changes = lines.map((line, idx) => {
        const parts = line.replace(/^-\s*/, '').split('|').map(p => p.trim());
        
        return {
          description: parts[0] || '',
          sort_order: toNumOrIndex(parts[1], idx),
        };
      }).filter(item => item.description);
    }

    // Parse content-only sections (Breaking, Issues, Technical)
    const parseContentSection = (sectionName: string, fieldName: keyof ReleaseFormValues) => {
      const regex = new RegExp(`## ${sectionName}\\n(?:<!--.*?-->\\n)?(.+?)(?=\\n+##|$)`, 's');
      const match = content.match(regex);
      if (match) {
        const lines = match[1].split('\n').filter(l => l.trim().startsWith('-'));
        (result as any)[fieldName] = lines
          .map(line => ({
            content: line.replace(/^-\s*/, '').trim(),
          }))
          .filter(item => item.content); // Only include items with content
      }
    };

    parseContentSection('Breaking Changes', 'breaking_changes');
    parseContentSection('Known Issues', 'known_issues');
    parseContentSection('Technical Notes', 'technical_notes');

    return result;
  };

  const parseReleaseCSV = (csvText: string): Partial<ReleaseFormValues> => {
    const result: Partial<ReleaseFormValues> = {
      features: [],
      api_changes: [],
      ui_updates: [],
      bug_fixes: [],
      improvements: [],
      database_changes: [],
      breaking_changes: [],
      known_issues: [],
      technical_notes: [],
    };

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
    });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
    }

    const rows = parsed.data as any[];
    
    rows.forEach((row, idx) => {
      const section = (row.section || '').toLowerCase().trim();
      
      if (section === 'meta') {
        if (row.version) result.version = row.version.trim();
        if (row.release_date) result.release_date = row.release_date.trim();
        if (row.environment) result.environment = row.environment.trim().toLowerCase() as any;
        if (row.summary) result.summary = row.summary.trim();
      } else if (section === 'feature') {
        result.features!.push({
          title: row.title?.trim() || '',
          description: row.description?.trim() || '',
          benefit: row.benefit?.trim() || undefined,
          sort_order: toNumOrIndex(row.sort_order, result.features!.length),
        });
      } else if (section === 'api_change') {
        const changeType = (row.change_type || 'modified').toLowerCase().trim();
        result.api_changes!.push({
          endpoint: row.endpoint?.trim() || '',
          change_type: ['new', 'modified', 'deprecated', 'removed'].includes(changeType) 
            ? changeType as any 
            : 'modified',
          description: row.description?.trim() || '',
          sort_order: toNumOrIndex(row.sort_order, result.api_changes!.length),
        });
      } else if (section === 'bug_fix') {
        result.bug_fixes!.push({
          description: row.description?.trim() || '',
          component: row.component?.trim() || undefined,
          sort_order: toNumOrIndex(row.sort_order, result.bug_fixes!.length),
        });
      } else if (section === 'improvement') {
        result.improvements!.push({
          description: row.description?.trim() || '',
          component: row.component?.trim() || undefined,
          sort_order: toNumOrIndex(row.sort_order, result.improvements!.length),
        });
      } else if (section === 'ui_update') {
        result.ui_updates!.push({
          description: row.description?.trim() || '',
          component: row.component?.trim() || undefined,
          sort_order: toNumOrIndex(row.sort_order, result.ui_updates!.length),
        });
      } else if (section === 'database_change') {
        result.database_changes!.push({
          description: row.description?.trim() || '',
          sort_order: toNumOrIndex(row.sort_order, result.database_changes!.length),
        });
      } else if (section === 'note') {
        const noteType = (row.note_type || '').toLowerCase().trim();
        const content = row.content?.trim() || '';
        
        if (noteType === 'breaking') {
          result.breaking_changes!.push({ content });
        } else if (noteType === 'known_issue') {
          result.known_issues!.push({ content });
        } else if (noteType === 'technical') {
          result.technical_notes!.push({ content });
        }
      }
    });

    return result;
  };

  const handleAdminPreview = () => {
    const data = form.getValues();
    
    // Validate required fields
    if (!data.version || !data.release_date || !data.summary) {
      toast.error('Please fill in Version, Release Date, and Summary before previewing');
      return;
    }
    
    setShowAdminPreview(true);
  };

  const handleUserPreview = () => {
    const data = form.getValues();
    
    // Validate required fields
    if (!data.version || !data.summary) {
      toast.error('Please fill in Version and Summary before previewing');
      return;
    }
    
    setShowUserPreview(true);
  };

  const onInvalid = (errors: any) => {
    const flattened = flattenValidationErrors(errors);
    setValidationErrors(flattened);
    toast.warning(`Please fix ${flattened.length} validation issue(s) before saving.`);
    
    // Try to focus first invalid field
    const firstErrorPath = Object.keys(errors)[0];
    if (firstErrorPath) {
      form.setFocus(firstErrorPath as any);
    }
  };

  const onSubmit = async (data: ReleaseFormValues) => {
    setValidationErrors([]);
    console.log('🚀 Form submission started', { releaseId, data });
    setIsSaving(true);
    setValidationErrors([]);
    
    try {
      // Validate form before submission
      const isValid = await form.trigger();
      if (!isValid) {
        const errors = Object.entries(form.formState.errors).map(([field, error]) => {
          return `${field}: ${error.message || 'Invalid'}`;
        });
        console.error('❌ Form validation failed:', form.formState.errors);
        setValidationErrors(errors);
        toast.error('Please fix validation errors before saving');
        setIsSaving(false);
        return;
      }

      console.log('✅ Form validation passed');

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
        features: data.features.map((f, i) => ({
          title: f.title || '',
          description: f.description || '',
          benefit: f.benefit,
          sort_order: Number.isFinite(f.sort_order) ? f.sort_order : i,
        })),
        api_changes: data.api_changes.map((a, i) => ({
          endpoint: a.endpoint || '',
          change_type: a.change_type,
          description: a.description || '',
          sort_order: Number.isFinite(a.sort_order) ? a.sort_order : i,
        })),
        changes: [
          ...data.bug_fixes.map((item, i) => ({ 
            description: item.description || '', 
            component: item.component, 
            category: 'bug_fix' as const, 
            sort_order: Number.isFinite(item.sort_order) ? item.sort_order : i 
          })),
          ...data.improvements.map((item, i) => ({ 
            description: item.description || '', 
            component: item.component, 
            category: 'improvement' as const, 
            sort_order: Number.isFinite(item.sort_order) ? item.sort_order : i 
          })),
          ...data.ui_updates.map((item, i) => ({ 
            description: item.description || '', 
            component: item.component, 
            category: 'ui_update' as const, 
            sort_order: Number.isFinite(item.sort_order) ? item.sort_order : i 
          })),
          ...data.database_changes.map((item, i) => ({ 
            description: item.description || '', 
            category: 'database' as const, 
            sort_order: Number.isFinite(item.sort_order) ? item.sort_order : i 
          })),
        ],
        notes: [
          ...data.breaking_changes.map(item => ({ content: item.content || '', note_type: 'breaking' as const })),
          ...data.known_issues.map(item => ({ content: item.content || '', note_type: 'known_issue' as const })),
          ...data.technical_notes.map(item => ({ content: item.content || '', note_type: 'technical' as const })),
        ],
      };

      console.log('📦 Prepared release data:', releaseData);

      if (releaseId) {
        // UPDATE existing release
        console.log('🔄 Updating existing release:', releaseId);
        await updateRelease(releaseId, releaseData as any);
        toast.success(`Release v${data.version} updated successfully`);
      } else {
        // CREATE new release
        console.log('✨ Creating new release');
        const exists = await versionExists(data.version);
        if (exists) {
          console.warn('⚠️ Version already exists:', data.version);
          toast.error('A release with this version already exists');
          setIsSaving(false);
          return;
        }
        
        const newReleaseId = await createReleaseDraft(releaseData as any);
        console.log('✅ Release created successfully:', newReleaseId);
        toast.success(`Release v${data.version} created successfully`);
      }
      
      onComplete();
    } catch (error: any) {
      console.error('❌ Failed to save release:', error);
      toast.error(`Failed to ${releaseId ? 'update' : 'create'} release: ${error.message}`);
    } finally {
      setIsSaving(false);
      console.log('🏁 Form submission completed');
    }
  };

  const onError = (errors: any) => {
    console.error('❌ Form validation errors:', errors);
    
    // Flatten nested errors for display
    const errorMessages: string[] = [];
    
    const flattenErrors = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (obj[key].message) {
          errorMessages.push(`${fullKey}: ${obj[key].message}`);
        } else if (typeof obj[key] === 'object') {
          flattenErrors(obj[key], fullKey);
        }
      });
    };
    
    flattenErrors(errors);
    
    setValidationErrors(errorMessages);
    toast.error(`Form validation failed: ${errorMessages.length} error(s) found`);
    
    // Scroll to validation errors alert
    const alertElement = document.querySelector('[role="alert"]');
    if (alertElement) {
      alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      ) : isEmailSent ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Release Locked</AlertTitle>
          <AlertDescription>
            This release has been sent to users and can no longer be edited or deleted.
            View-only mode is active.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* File Upload Section - Only show when creating new release */}
          {!releaseId && (
            <Collapsible open={showFileUpload} onOpenChange={setShowFileUpload}>
              <Card className="border-dashed border-2">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          AI-Assisted Release Creation
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                          Upload a completed release template file to auto-populate all fields
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                      >
                        {showFileUpload ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="upload-markdown"
                            name="uploadType"
                            value="markdown"
                            checked={uploadFileType === 'markdown'}
                            onChange={() => setUploadFileType('markdown')}
                            className="w-4 h-4"
                          />
                          <label htmlFor="upload-markdown" className="text-sm cursor-pointer flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Markdown (.md)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="upload-csv"
                            name="uploadType"
                            value="csv"
                            checked={uploadFileType === 'csv'}
                            onChange={() => setUploadFileType('csv')}
                            className="w-4 h-4"
                          />
                          <label htmlFor="upload-csv" className="text-sm cursor-pointer flex items-center gap-1">
                            <FileSpreadsheet className="h-4 w-4" />
                            CSV (.csv)
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept={uploadFileType === 'markdown' ? '.md' : '.csv'}
                            onChange={handleFileUpload}
                            disabled={isParsingFile}
                            className="cursor-pointer"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            {uploadFileType === 'markdown' ? (
                              <>
                                Upload a filled release template (.md file). Find the template at{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                  docs/RELEASE_TEMPLATE.md
                                </code>
                              </>
                            ) : (
                              <>
                                Upload a structured CSV file. Find the template and instructions at{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                  docs/RELEASE_TEMPLATE.csv
                                </code>
                              </>
                            )}
                          </p>
                        </div>
                        {isParsingFile && (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            <span className="text-sm">Parsing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertTitle>How to use</AlertTitle>
                      <AlertDescription>
                        1. Copy <code>docs/RELEASE_TEMPLATE.{uploadFileType === 'markdown' ? 'md' : 'csv'}</code> and fill it out manually or with an LLM
                        <br />
                        2. Upload the completed file here
                        <br />
                        3. Review and modify the auto-populated fields
                        <br />
                        4. Save as draft or publish
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              
            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.slice(0, 5).map((error, idx) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                  </ul>
                  {validationErrors.length > 5 && (
                    <p className="text-sm mt-2">+ {validationErrors.length - 5} more errors</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

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
              <Button type="button" variant="outline" onClick={handleAdminPreview} className="w-full sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Admin
              </Button>
              <Button type="button" variant="outline" onClick={handleUserPreview} className="w-full sm:w-auto">
                <Users className="mr-2 h-4 w-4" />
                User
              </Button>
              {import.meta.env.DEV && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    console.log('📋 Form State:', form.getValues());
                    console.log('📋 Form Errors:', form.formState.errors);
                    console.log('📋 Is Valid:', form.formState.isValid);
                    console.log('📋 Is Dirty:', form.formState.isDirty);
                    toast.info('Check console for form state');
                  }}
                  className="w-full sm:w-auto"
                >
                  Debug Form
                </Button>
              )}
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Email Preview Modals */}
      <EmailPreviewModal
        isOpen={showAdminPreview}
        onClose={() => setShowAdminPreview(false)}
        emailType="admin"
        releaseData={form.getValues()}
      />
      <EmailPreviewModal
        isOpen={showUserPreview}
        onClose={() => setShowUserPreview(false)}
        emailType="user"
        releaseData={form.getValues()}
      />
        </>
      )}
    </div>
  );
}

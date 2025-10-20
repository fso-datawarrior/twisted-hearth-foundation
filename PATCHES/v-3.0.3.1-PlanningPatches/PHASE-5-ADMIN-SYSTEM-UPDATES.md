# PHASE 5: Admin System Updates Feature

**Branch**: v-3.0.3.6-Phase5-AdminSystemUpdatesFeature  
**Priority**: P2 (Medium - New Features)  
**Estimated Time**: 3-4 hours

## Overview
Add system update email functionality to admin panel, allowing admins to send formatted update announcements to all users about new features, bug fixes, and known issues.

---

## 5.1 System Update Email Template

### File to Create
**File**: `email-templates/07-system-update.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Update - The Ruths' Bash</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #f59e0b;
    }
    .header h1 {
      color: #f59e0b;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .badge-update {
      background-color: #3b82f6;
      color: white;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      color: #1f2937;
      font-size: 20px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-icon {
      font-size: 24px;
    }
    .item-list {
      margin: 0;
      padding-left: 20px;
    }
    .item-list li {
      margin: 10px 0;
      color: #4b5563;
    }
    .item-list li strong {
      color: #1f2937;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 15px;
      border-left: 4px solid #f59e0b;
      border-radius: 5px;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #dc2626;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #f59e0b;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎃 System Update</h1>
      <p style="color: #6b7280; margin: 5px 0;">The Ruths' Twisted Fairytale Halloween Bash</p>
      <span class="badge badge-update">Version {{VERSION}}</span>
    </div>

    <!-- Introduction -->
    <div class="section">
      <p>Hi there! 👋</p>
      <p>We've made some updates to make your experience even better. Here's what's new:</p>
    </div>

    <!-- New Features -->
    {{#if NEW_FEATURES}}
    <div class="section">
      <div class="section-title">
        <span class="section-icon">✨</span>
        <strong>New Features</strong>
      </div>
      <ul class="item-list">
        {{#each NEW_FEATURES}}
        <li><strong>{{this.title}}:</strong> {{this.description}}</li>
        {{/each}}
      </ul>
    </div>
    {{/if}}

    <!-- Bug Fixes -->
    {{#if BUG_FIXES}}
    <div class="section">
      <div class="section-title">
        <span class="section-icon">🐛</span>
        <strong>Bug Fixes</strong>
      </div>
      <ul class="item-list">
        {{#each BUG_FIXES}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/if}}

    <!-- Improvements -->
    {{#if IMPROVEMENTS}}
    <div class="section">
      <div class="section-title">
        <span class="section-icon">🚀</span>
        <strong>Improvements</strong>
      </div>
      <ul class="item-list">
        {{#each IMPROVEMENTS}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/if}}

    <!-- Known Issues -->
    {{#if KNOWN_ISSUES}}
    <div class="highlight">
      <strong style="color: #dc2626;">⚠️ Known Issues</strong>
      <ul class="item-list" style="margin-top: 10px;">
        {{#each KNOWN_ISSUES}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      <p style="margin: 10px 0 0 0; font-size: 14px;">We're actively working on fixes for these issues.</p>
    </div>
    {{/if}}

    <!-- Call to Action -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{SITE_URL}}" class="cta-button">Check Out the Updates</a>
    </div>

    <!-- Additional Notes -->
    {{#if ADDITIONAL_NOTES}}
    <div class="section">
      <p style="color: #6b7280; font-style: italic;">{{ADDITIONAL_NOTES}}</p>
    </div>
    {{/if}}

    <!-- Footer -->
    <div class="footer">
      <p>Thanks for being part of The Ruths' Bash! 🎭</p>
      <p>
        Questions or feedback? <a href="{{SITE_URL}}/contact">Contact us</a><br>
        <a href="{{SITE_URL}}/settings">Manage notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
```

### Plain Text Version
**File**: `email-templates/07-system-update.txt`

```
SYSTEM UPDATE - The Ruths' Twisted Fairytale Halloween Bash
Version {{VERSION}}

Hi there! 👋

We've made some updates to make your experience even better. Here's what's new:

{{#if NEW_FEATURES}}
✨ NEW FEATURES:
{{#each NEW_FEATURES}}
- {{this.title}}: {{this.description}}
{{/each}}
{{/if}}

{{#if BUG_FIXES}}
🐛 BUG FIXES:
{{#each BUG_FIXES}}
- {{this}}
{{/each}}
{{/if}}

{{#if IMPROVEMENTS}}
🚀 IMPROVEMENTS:
{{#each IMPROVEMENTS}}
- {{this}}
{{/each}}
{{/if}}

{{#if KNOWN_ISSUES}}
⚠️ KNOWN ISSUES:
{{#each KNOWN_ISSUES}}
- {{this}}
{{/each}}

We're actively working on fixes for these issues.
{{/if}}

Check out the updates: {{SITE_URL}}

{{#if ADDITIONAL_NOTES}}
Note: {{ADDITIONAL_NOTES}}
{{/if}}

Thanks for being part of The Ruths' Bash! 🎭

Questions or feedback? Visit: {{SITE_URL}}/contact
Manage notification preferences: {{SITE_URL}}/settings
```

---

## 5.2 Quick Send System Update in Admin Panel

### File to Modify
**File**: `src/components/admin/EmailCommunication.tsx`

### Implementation

#### 1. Add System Update Quick Action (After line 345, before campaign list)

```tsx
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
```

#### 2. Add System Update Handler (After handleSendInvite, line 492)

```tsx
const handleQuickSystemUpdate = () => {
  // Check if system update template exists
  const systemTemplate = templates.find(t => 
    t.name.toLowerCase().includes('system update') || 
    t.name.toLowerCase().includes('system-update')
  );
  
  if (!systemTemplate) {
    toast.warning('System Update template not found. Creating default template...');
    // Create default system update template
    createDefaultSystemUpdateTemplate();
  } else {
    // Open campaign composer with system update pre-selected
    setIsCreatingCampaign(true);
    // You can pre-fill the composer if needed
  }
};

const createDefaultSystemUpdateTemplate = async () => {
  try {
    const defaultTemplate = {
      name: 'System Update',
      subject: '🎃 Update: {{VERSION}} - New Features & Improvements',
      content: `
        <h2>System Update - Version {{VERSION}}</h2>
        <p>We've made some updates to improve your experience!</p>
        
        <h3>✨ New Features</h3>
        <ul>
          <li>{{NEW_FEATURE_1}}</li>
          <li>{{NEW_FEATURE_2}}</li>
        </ul>
        
        <h3>🐛 Bug Fixes</h3>
        <ul>
          <li>{{BUG_FIX_1}}</li>
          <li>{{BUG_FIX_2}}</li>
        </ul>
        
        <h3>⚠️ Known Issues</h3>
        <ul>
          <li>{{KNOWN_ISSUE_1}}</li>
        </ul>
        
        <p>Thanks for being part of The Ruths' Bash! 🎭</p>
      `,
      category: 'system'
    };
    
    await createTemplate(defaultTemplate);
    toast.success('System Update template created!');
    loadData(); // Reload templates
  } catch (error) {
    console.error('Failed to create template:', error);
    toast.error('Failed to create system update template');
  }
};
```

#### 3. Add Import for Megaphone Icon (Line 6)

```tsx
import { Plus, Mail, Send, Clock, CheckCircle, XCircle, Pencil, Trash2, Megaphone } from "lucide-react";
```

#### 4. Enhance CampaignComposer for System Updates

**File**: `src/components/admin/CampaignComposer.tsx`

Add pre-fill logic for system updates:

```tsx
// Add prop to indicate system update mode
interface CampaignComposerProps {
  onSave: (campaign: any) => void;
  onSendTest: (campaign: any) => void;
  onCancel: () => void;
  systemUpdateMode?: boolean; // NEW
}

// In component, pre-select "all" recipients for system updates
useEffect(() => {
  if (systemUpdateMode) {
    setRecipientList('all');
  }
}, [systemUpdateMode]);
```

---

## 5.3 Update Email Campaigns API

### File to Modify (if needed)
**File**: `src/lib/email-campaigns-api.ts`

Add helper function to send system updates:

```typescript
/**
 * Send a system update email to all users
 */
export async function sendSystemUpdate(params: {
  version: string;
  newFeatures?: Array<{ title: string; description: string }>;
  bugFixes?: string[];
  improvements?: string[];
  knownIssues?: string[];
  additionalNotes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  // Create campaign with system update template
  const campaign = await createCampaign({
    subject: `🎃 System Update ${params.version} - New Features & Improvements`,
    recipient_list: 'all',
    template_variables: {
      VERSION: params.version,
      NEW_FEATURES: params.newFeatures || [],
      BUG_FIXES: params.bugFixes || [],
      IMPROVEMENTS: params.improvements || [],
      KNOWN_ISSUES: params.knownIssues || [],
      ADDITIONAL_NOTES: params.additionalNotes || '',
      SITE_URL: window.location.origin,
    },
    status: 'draft',
  });

  // Send immediately
  await sendCampaign(campaign.id);

  return campaign;
}
```

---

## 5.4 System Update Form Component (Optional Enhancement)

### New Component
**File**: `src/components/admin/SystemUpdateComposer.tsx`

```tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Send } from "lucide-react";
import { toast } from "sonner";

interface SystemUpdateComposerProps {
  onSend: (update: any) => void;
  onCancel: () => void;
}

export function SystemUpdateComposer({ onSend, onCancel }: SystemUpdateComposerProps) {
  const [version, setVersion] = useState('');
  const [newFeatures, setNewFeatures] = useState<Array<{ title: string; description: string }>>([]);
  const [bugFixes, setBugFixes] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [knownIssues, setKnownIssues] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const addNewFeature = () => {
    setNewFeatures([...newFeatures, { title: '', description: '' }]);
  };

  const addBugFix = () => {
    setBugFixes([...bugFixes, '']);
  };

  const addImprovement = () => {
    setImprovements([...improvements, '']);
  };

  const addKnownIssue = () => {
    setKnownIssues([...knownIssues, '']);
  };

  const handleSend = () => {
    if (!version.trim()) {
      toast.error('Please enter a version number');
      return;
    }

    const filteredFeatures = newFeatures.filter(f => f.title.trim() && f.description.trim());
    const filteredBugFixes = bugFixes.filter(b => b.trim());
    const filteredImprovements = improvements.filter(i => i.trim());
    const filteredKnownIssues = knownIssues.filter(k => k.trim());

    onSend({
      version: version.trim(),
      newFeatures: filteredFeatures.length > 0 ? filteredFeatures : undefined,
      bugFixes: filteredBugFixes.length > 0 ? filteredBugFixes : undefined,
      improvements: filteredImprovements.length > 0 ? filteredImprovements : undefined,
      knownIssues: filteredKnownIssues.length > 0 ? filteredKnownIssues : undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Update Announcement</CardTitle>
        <CardDescription>
          Create a formatted system update email to send to all users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Version */}
        <div className="space-y-2">
          <Label htmlFor="version">Version Number *</Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g., v3.0.4"
          />
        </div>

        {/* New Features */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>✨ New Features</Label>
            <Button type="button" size="sm" variant="outline" onClick={addNewFeature}>
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </Button>
          </div>
          {newFeatures.map((feature, index) => (
            <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Input
                  value={feature.title}
                  onChange={(e) => {
                    const updated = [...newFeatures];
                    updated[index].title = e.target.value;
                    setNewFeatures(updated);
                  }}
                  placeholder="Feature title"
                />
                <Input
                  value={feature.description}
                  onChange={(e) => {
                    const updated = [...newFeatures];
                    updated[index].description = e.target.value;
                    setNewFeatures(updated);
                  }}
                  placeholder="Feature description"
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setNewFeatures(newFeatures.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Bug Fixes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>🐛 Bug Fixes</Label>
            <Button type="button" size="sm" variant="outline" onClick={addBugFix}>
              <Plus className="h-4 w-4 mr-1" />
              Add Fix
            </Button>
          </div>
          {bugFixes.map((fix, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={fix}
                onChange={(e) => {
                  const updated = [...bugFixes];
                  updated[index] = e.target.value;
                  setBugFixes(updated);
                }}
                placeholder="Describe the bug fix"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setBugFixes(bugFixes.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Improvements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>🚀 Improvements</Label>
            <Button type="button" size="sm" variant="outline" onClick={addImprovement}>
              <Plus className="h-4 w-4 mr-1" />
              Add Improvement
            </Button>
          </div>
          {improvements.map((improvement, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={improvement}
                onChange={(e) => {
                  const updated = [...improvements];
                  updated[index] = e.target.value;
                  setImprovements(updated);
                }}
                placeholder="Describe the improvement"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setImprovements(improvements.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Known Issues */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>⚠️ Known Issues</Label>
            <Button type="button" size="sm" variant="outline" onClick={addKnownIssue}>
              <Plus className="h-4 w-4 mr-1" />
              Add Issue
            </Button>
          </div>
          {knownIssues.map((issue, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={issue}
                onChange={(e) => {
                  const updated = [...knownIssues];
                  updated[index] = e.target.value;
                  setKnownIssues(updated);
                }}
                placeholder="Describe the known issue"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setKnownIssues(knownIssues.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any additional information for users..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSend} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Send System Update
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Testing Checklist

### Email Template
- [ ] HTML template renders correctly
- [ ] Plain text version is readable
- [ ] All variables are replaced properly
- [ ] Conditional sections work (if statements)
- [ ] Links are functional
- [ ] Mobile responsive design

### Admin Interface
- [ ] "Send System Update" button visible
- [ ] Quick action creates/uses template
- [ ] Campaign composer opens with correct settings
- [ ] "All Users" pre-selected as recipients
- [ ] System update template created if missing

### Sending
- [ ] Email sends to all users
- [ ] Only users with email_on_admin_announcement enabled receive email
- [ ] Email formatting is correct
- [ ] Version number displays properly
- [ ] All sections (features, bugs, improvements) render
- [ ] Known issues highlighted appropriately

### User Experience
- [ ] Emails are clear and non-technical
- [ ] Links work correctly
- [ ] Unsubscribe/preferences link present
- [ ] Mobile email rendering is good

---

## Completion Checklist

- [ ] Email templates created (HTML & TXT)
- [ ] Quick action button added to admin panel
- [ ] System update handler implemented
- [ ] Default template creation working
- [ ] Campaign composer enhanced
- [ ] API helper functions added
- [ ] System update composer component created (optional)
- [ ] Comprehensive testing complete
- [ ] Documentation updated
- [ ] Ready to commit

## Git Commit Message

```
feat(admin): add system update email functionality

- Create HTML and plain text email templates for system updates
- Add "Send System Update" quick action to admin panel
- Implement automatic template creation if not exists
- Pre-select "All Users" for system update campaigns
- Format emails with sections for features, bug fixes, improvements, known issues
- Respect user notification preferences for admin announcements

Enables admins to easily communicate platform updates to all users.
```

## Usage Example

1. Admin navigates to Email Communication tab
2. Clicks "Send System Update" button
3. System creates/opens system update template
4. Admin fills in version, features, bug fixes, etc.
5. Reviews email preview
6. Sends to all users (respecting notification preferences)
7. Users receive formatted, professional update email


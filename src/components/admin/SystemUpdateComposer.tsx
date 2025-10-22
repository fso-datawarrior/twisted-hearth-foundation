import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, X, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { sendSystemUpdate } from '@/lib/email-campaigns-api';

interface SystemUpdateComposerProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface Feature {
  title: string;
  description: string;
  benefit?: string;
}

interface ApiChange {
  endpoint: string;
  change: string;
}

interface UiUpdate {
  component: string;
  change: string;
}

export function SystemUpdateComposer({ onComplete, onCancel }: SystemUpdateComposerProps) {
  const [version, setVersion] = useState('');
  const [summary, setSummary] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [templateType, setTemplateType] = useState<'admin' | 'user' | 'both'>('both');
  const [isLoading, setIsLoading] = useState(false);

  // Features
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newFeature, setNewFeature] = useState<Feature>({ title: '', description: '', benefit: '' });

  // Bug Fixes
  const [bugFixes, setBugFixes] = useState<string[]>([]);
  const [newBugFix, setNewBugFix] = useState('');

  // Improvements
  const [improvements, setImprovements] = useState<string[]>([]);
  const [newImprovement, setNewImprovement] = useState('');

  // Known Issues
  const [knownIssues, setKnownIssues] = useState<string[]>([]);
  const [newKnownIssue, setNewKnownIssue] = useState('');

  // Admin-specific fields
  const [apiChanges, setApiChanges] = useState<ApiChange[]>([]);
  const [newApiChange, setNewApiChange] = useState<ApiChange>({ endpoint: '', change: '' });

  const [uiUpdates, setUiUpdates] = useState<UiUpdate[]>([]);
  const [newUiUpdate, setNewUiUpdate] = useState<UiUpdate>({ component: '', change: '' });

  const [breakingChanges, setBreakingChanges] = useState<string[]>([]);
  const [newBreakingChange, setNewBreakingChange] = useState('');

  const [databaseChanges, setDatabaseChanges] = useState<string[]>([]);
  const [newDatabaseChange, setNewDatabaseChange] = useState('');

  const [technicalNotes, setTechnicalNotes] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Add handlers for features
  const addFeature = () => {
    if (newFeature.title && newFeature.description) {
      setFeatures([...features, newFeature]);
      setNewFeature({ title: '', description: '', benefit: '' });
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Add handlers for bug fixes
  const addBugFix = () => {
    if (newBugFix.trim()) {
      setBugFixes([...bugFixes, newBugFix.trim()]);
      setNewBugFix('');
    }
  };

  // Add handlers for improvements
  const addImprovement = () => {
    if (newImprovement.trim()) {
      setImprovements([...improvements, newImprovement.trim()]);
      setNewImprovement('');
    }
  };

  // Add handlers for known issues
  const addKnownIssue = () => {
    if (newKnownIssue.trim()) {
      setKnownIssues([...knownIssues, newKnownIssue.trim()]);
      setNewKnownIssue('');
    }
  };

  // Add handlers for API changes
  const addApiChange = () => {
    if (newApiChange.endpoint && newApiChange.change) {
      setApiChanges([...apiChanges, newApiChange]);
      setNewApiChange({ endpoint: '', change: '' });
    }
  };

  // Add handlers for UI updates
  const addUiUpdate = () => {
    if (newUiUpdate.component && newUiUpdate.change) {
      setUiUpdates([...uiUpdates, newUiUpdate]);
      setNewUiUpdate({ component: '', change: '' });
    }
  };

  // Add handlers for breaking changes
  const addBreakingChange = () => {
    if (newBreakingChange.trim()) {
      setBreakingChanges([...breakingChanges, newBreakingChange.trim()]);
      setNewBreakingChange('');
    }
  };

  // Add handlers for database changes
  const addDatabaseChange = () => {
    if (newDatabaseChange.trim()) {
      setDatabaseChanges([...databaseChanges, newDatabaseChange.trim()]);
      setNewDatabaseChange('');
    }
  };

  const handleSend = async () => {
    if (!version) {
      toast.error('Please enter a version number');
      return;
    }

    if (features.length === 0 && bugFixes.length === 0 && improvements.length === 0) {
      toast.error('Please add at least one feature, bug fix, or improvement');
      return;
    }

    try {
      setIsLoading(true);
      
      await sendSystemUpdate({
        version,
        templateType,
        releaseDate,
        summary,
        newFeatures: features,
        bugFixes,
        improvements,
        knownIssues,
        additionalNotes,
        apisChanged: apiChanges,
        uiUpdates,
        breakingChanges,
        databaseChanges,
        technicalNotes,
      });

      toast.success('System update email sent successfully!');
      onComplete?.();
    } catch (error) {
      console.error('Failed to send system update:', error);
      toast.error('Failed to send system update email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            System Update Announcement
          </CardTitle>
          <CardDescription>
            Create and send a system update announcement to users and/or admins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">Version Number *</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., 3.0.4"
                required
              />
            </div>
            <div>
              <Label htmlFor="release-date">Release Date</Label>
              <Input
                id="release-date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="template-type">Send To</Label>
            <Select value={templateType} onValueChange={(v: any) => setTemplateType(v)}>
              <SelectTrigger id="template-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both Users & Admins (Recommended)</SelectItem>
                <SelectItem value="user">Users Only (Guest-Friendly)</SelectItem>
                <SelectItem value="admin">Admins Only (Technical)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief overview of this update..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">User-Facing</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">✨ New Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                    {feature.benefit && (
                      <div className="text-sm text-primary mt-1">Benefit: {feature.benefit}</div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeFeature(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="space-y-2">
                <Input
                  placeholder="Feature title"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                />
                <Textarea
                  placeholder="Technical description"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  rows={2}
                />
                <Textarea
                  placeholder="User-friendly benefit (optional)"
                  value={newFeature.benefit}
                  onChange={(e) => setNewFeature({ ...newFeature, benefit: e.target.value })}
                  rows={2}
                />
                <Button size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bug Fixes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🐛 Bug Fixes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bugFixes.map((fix, index) => (
                <Badge key={index} variant="secondary" className="gap-2">
                  {fix}
                  <button onClick={() => setBugFixes(bugFixes.filter((_, i) => i !== index))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Bug fix description"
                  value={newBugFix}
                  onChange={(e) => setNewBugFix(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBugFix()}
                />
                <Button size="sm" onClick={addBugFix}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">⚡ Improvements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {improvements.map((improvement, index) => (
                <Badge key={index} variant="secondary" className="gap-2">
                  {improvement}
                  <button onClick={() => setImprovements(improvements.filter((_, i) => i !== index))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Improvement description"
                  value={newImprovement}
                  onChange={(e) => setNewImprovement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addImprovement()}
                />
                <Button size="sm" onClick={addImprovement}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          {/* API Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔧 API Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiChanges.map((change, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <code className="text-sm">{change.endpoint}</code>
                    <div className="text-sm text-muted-foreground mt-1">{change.change}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setApiChanges(apiChanges.filter((_, i) => i !== index))}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="space-y-2">
                <Input
                  placeholder="API endpoint"
                  value={newApiChange.endpoint}
                  onChange={(e) => setNewApiChange({ ...newApiChange, endpoint: e.target.value })}
                />
                <Input
                  placeholder="Change description"
                  value={newApiChange.change}
                  onChange={(e) => setNewApiChange({ ...newApiChange, change: e.target.value })}
                />
                <Button size="sm" onClick={addApiChange}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add API Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* UI Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎨 UI Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {uiUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{update.component}</div>
                    <div className="text-sm text-muted-foreground">{update.change}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setUiUpdates(uiUpdates.filter((_, i) => i !== index))}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="space-y-2">
                <Input
                  placeholder="Component name"
                  value={newUiUpdate.component}
                  onChange={(e) => setNewUiUpdate({ ...newUiUpdate, component: e.target.value })}
                />
                <Input
                  placeholder="Change description"
                  value={newUiUpdate.change}
                  onChange={(e) => setNewUiUpdate({ ...newUiUpdate, change: e.target.value })}
                />
                <Button size="sm" onClick={addUiUpdate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add UI Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Technical Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📝 Technical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={technicalNotes}
                onChange={(e) => setTechnicalNotes(e.target.value)}
                placeholder="Additional technical information for admins..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {/* Known Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔍 Known Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {knownIssues.map((issue, index) => (
                <Badge key={index} variant="outline" className="gap-2">
                  {issue}
                  <button onClick={() => setKnownIssues(knownIssues.filter((_, i) => i !== index))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Known issue description"
                  value={newKnownIssue}
                  onChange={(e) => setNewKnownIssue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKnownIssue()}
                />
                <Button size="sm" onClick={addKnownIssue}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📋 Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional information to include in the announcement..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSend} disabled={isLoading || !version}>
          <Send className="w-4 h-4 mr-2" />
          {isLoading ? 'Sending...' : 'Send System Update'}
        </Button>
      </div>
    </div>
  );
}

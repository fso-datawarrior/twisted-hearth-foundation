import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Send } from "lucide-react";
import { toast } from "sonner";

interface SystemUpdateComposerProps {
  onSend: (update: any) => void;
  onCancel: () => void;
}

export function SystemUpdateComposer({ onSend, onCancel }: SystemUpdateComposerProps) {
  const [templateType, setTemplateType] = useState<'admin' | 'user'>('admin');
  const [version, setVersion] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [summary, setSummary] = useState('');
  
  // Admin/Technical fields
  const [featuresAdded, setFeaturesAdded] = useState<Array<{ title: string; description: string; benefit?: string }>>([]);
  const [apisChanged, setApisChanged] = useState<Array<{ endpoint: string; change: string }>>([]);
  const [uiUpdates, setUiUpdates] = useState<Array<{ component: string; change: string }>>([]);
  const [bugFixes, setBugFixes] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [breakingChanges, setBreakingChanges] = useState<string[]>([]);
  const [databaseChanges, setDatabaseChanges] = useState<string[]>([]);
  const [technicalNotes, setTechnicalNotes] = useState('');
  
  // User-friendly fields (simplified)
  const [userFriendlyFeatures, setUserFriendlyFeatures] = useState<Array<{ title: string; benefit: string }>>([]);
  const [userFriendlyFixes, setUserFriendlyFixes] = useState<string[]>([]);
  const [userFriendlyImprovements, setUserFriendlyImprovements] = useState<string[]>([]);
  
  // Common fields
  const [knownIssues, setKnownIssues] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const addFeature = () => {
    if (templateType === 'admin') {
      setFeaturesAdded([...featuresAdded, { title: '', description: '', benefit: '' }]);
    } else {
      setUserFriendlyFeatures([...userFriendlyFeatures, { title: '', benefit: '' }]);
    }
  };

  const addApiChange = () => {
    setApisChanged([...apisChanged, { endpoint: '', change: '' }]);
  };

  const addUiUpdate = () => {
    setUiUpdates([...uiUpdates, { component: '', change: '' }]);
  };

  const addBugFix = () => {
    if (templateType === 'admin') {
      setBugFixes([...bugFixes, '']);
    } else {
      setUserFriendlyFixes([...userFriendlyFixes, '']);
    }
  };

  const addImprovement = () => {
    if (templateType === 'admin') {
      setImprovements([...improvements, '']);
    } else {
      setUserFriendlyImprovements([...userFriendlyImprovements, '']);
    }
  };

  const addBreakingChange = () => {
    setBreakingChanges([...breakingChanges, '']);
  };

  const addDatabaseChange = () => {
    setDatabaseChanges([...databaseChanges, '']);
  };

  const addKnownIssue = () => {
    setKnownIssues([...knownIssues, '']);
  };

  const convertToUserFriendly = (technicalText: string): string => {
    const conversions: Record<string, string> = {
      'authentication': 'logging in',
      'API': 'app features',
      'database': 'data storage',
      'performance': 'speed',
      'bug': 'issue',
      'fix': 'improvement',
      'endpoint': 'feature',
      'component': 'page',
      'UI': 'interface',
      'UX': 'user experience'
    };
    
    let converted = technicalText;
    Object.entries(conversions).forEach(([tech, friendly]) => {
      converted = converted.replace(new RegExp(tech, 'gi'), friendly);
    });
    
    return converted;
  };

  const handleSend = () => {
    if (!version.trim()) {
      toast.error('Please enter a version number');
      return;
    }

    let updateData: any = {
      version: version.trim(),
      releaseDate: releaseDate.trim() || undefined,
      summary: summary.trim() || undefined,
      knownIssues: knownIssues.filter(k => k.trim()).length > 0 ? knownIssues.filter(k => k.trim()) : undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    };

    if (templateType === 'admin') {
      // Admin/Technical data
      const filteredFeatures = featuresAdded.filter(f => f.title.trim() && f.description.trim());
      const filteredApis = apisChanged.filter(a => a.endpoint.trim() && a.change.trim());
      const filteredUi = uiUpdates.filter(u => u.component.trim() && u.change.trim());
      const filteredBugFixes = bugFixes.filter(b => b.trim());
      const filteredImprovements = improvements.filter(i => i.trim());
      const filteredBreaking = breakingChanges.filter(b => b.trim());
      const filteredDatabase = databaseChanges.filter(d => d.trim());

      updateData = {
        ...updateData,
        templateType: 'admin',
        featuresAdded: filteredFeatures.length > 0 ? filteredFeatures : undefined,
        apisChanged: filteredApis.length > 0 ? filteredApis : undefined,
        uiUpdates: filteredUi.length > 0 ? filteredUi : undefined,
        bugFixes: filteredBugFixes.length > 0 ? filteredBugFixes : undefined,
        improvements: filteredImprovements.length > 0 ? filteredImprovements : undefined,
        breakingChanges: filteredBreaking.length > 0 ? filteredBreaking : undefined,
        databaseChanges: filteredDatabase.length > 0 ? filteredDatabase : undefined,
        technicalNotes: technicalNotes.trim() || undefined,
      };
    } else {
      // User-friendly data
      const filteredFeatures = userFriendlyFeatures.filter(f => f.title.trim() && f.benefit.trim());
      const filteredFixes = userFriendlyFixes.filter(f => f.trim());
      const filteredImprovements = userFriendlyImprovements.filter(i => i.trim());

      updateData = {
        ...updateData,
        templateType: 'user',
        featuresAdded: filteredFeatures.length > 0 ? filteredFeatures : undefined,
        bugFixes: filteredFixes.length > 0 ? filteredFixes : undefined,
        improvements: filteredImprovements.length > 0 ? filteredImprovements : undefined,
      };
    }

    onSend(updateData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Update Announcement</CardTitle>
        <CardDescription>
          Create a formatted system update email for {templateType === 'admin' ? 'administrators' : 'party guests'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="template-type">Template Type *</Label>
          <Select value={templateType} onValueChange={(value: 'admin' | 'user') => setTemplateType(value)}>
            <SelectTrigger id="template-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin/Technical Summary</SelectItem>
              <SelectItem value="user">User-Friendly Announcement</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        {/* Release Date */}
        <div className="space-y-2">
          <Label htmlFor="release-date">Release Date (Optional)</Label>
          <Input
            id="release-date"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <Label htmlFor="summary">Summary (Optional)</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={templateType === 'admin' ? "Executive summary of changes..." : "Brief overview of what's new..."}
            rows={3}
          />
        </div>

        {/* Features - Conditional based on template type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>✨ {templateType === 'admin' ? 'Features Added' : 'What\'s New & Awesome!'}</Label>
            <Button type="button" size="sm" variant="outline" onClick={addFeature}>
              <Plus className="h-4 w-4 mr-1" />
              Add {templateType === 'admin' ? 'Feature' : 'New Thing'}
            </Button>
          </div>
          
          {templateType === 'admin' ? (
            featuresAdded.map((feature, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Input
                    value={feature.title}
                    onChange={(e) => {
                      const updated = [...featuresAdded];
                      updated[index].title = e.target.value;
                      setFeaturesAdded(updated);
                    }}
                    placeholder="Feature title"
                  />
                  <Input
                    value={feature.description}
                    onChange={(e) => {
                      const updated = [...featuresAdded];
                      updated[index].description = e.target.value;
                      setFeaturesAdded(updated);
                    }}
                    placeholder="Technical description"
                  />
                  <Input
                    value={feature.benefit || ''}
                    onChange={(e) => {
                      const updated = [...featuresAdded];
                      updated[index].benefit = e.target.value;
                      setFeaturesAdded(updated);
                    }}
                    placeholder="Business benefit (optional)"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setFeaturesAdded(featuresAdded.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            userFriendlyFeatures.map((feature, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Input
                    value={feature.title}
                    onChange={(e) => {
                      const updated = [...userFriendlyFeatures];
                      updated[index].title = e.target.value;
                      setUserFriendlyFeatures(updated);
                    }}
                    placeholder="What's new (e.g., 'New Party Games!')"
                  />
                  <Input
                    value={feature.benefit}
                    onChange={(e) => {
                      const updated = [...userFriendlyFeatures];
                      updated[index].benefit = e.target.value;
                      setUserFriendlyFeatures(updated);
                    }}
                    placeholder="Why it's awesome (e.g., 'Now you can play spooky games with friends!')"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setUserFriendlyFeatures(userFriendlyFeatures.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Admin-only sections */}
        {templateType === 'admin' && (
          <>
            {/* APIs Changed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>🔧 APIs Changed</Label>
                <Button type="button" size="sm" variant="outline" onClick={addApiChange}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add API Change
                </Button>
              </div>
              {apisChanged.map((api, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={api.endpoint}
                      onChange={(e) => {
                        const updated = [...apisChanged];
                        updated[index].endpoint = e.target.value;
                        setApisChanged(updated);
                      }}
                      placeholder="API endpoint (e.g., /api/users)"
                    />
                    <Input
                      value={api.change}
                      onChange={(e) => {
                        const updated = [...apisChanged];
                        updated[index].change = e.target.value;
                        setApisChanged(updated);
                      }}
                      placeholder="What changed (e.g., Added pagination)"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setApisChanged(apisChanged.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* UI Updates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>🎨 UI Updates</Label>
                <Button type="button" size="sm" variant="outline" onClick={addUiUpdate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add UI Update
                </Button>
              </div>
              {uiUpdates.map((ui, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={ui.component}
                      onChange={(e) => {
                        const updated = [...uiUpdates];
                        updated[index].component = e.target.value;
                        setUiUpdates(updated);
                      }}
                      placeholder="Component/page name"
                    />
                    <Input
                      value={ui.change}
                      onChange={(e) => {
                        const updated = [...uiUpdates];
                        updated[index].change = e.target.value;
                        setUiUpdates(updated);
                      }}
                      placeholder="What changed"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setUiUpdates(uiUpdates.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Breaking Changes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>⚠️ Breaking Changes</Label>
                <Button type="button" size="sm" variant="outline" onClick={addBreakingChange}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Breaking Change
                </Button>
              </div>
              {breakingChanges.map((change, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={change}
                    onChange={(e) => {
                      const updated = [...breakingChanges];
                      updated[index] = e.target.value;
                      setBreakingChanges(updated);
                    }}
                    placeholder="Describe the breaking change"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setBreakingChanges(breakingChanges.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Database Changes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>🗄️ Database Changes</Label>
                <Button type="button" size="sm" variant="outline" onClick={addDatabaseChange}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add DB Change
                </Button>
              </div>
              {databaseChanges.map((change, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={change}
                    onChange={(e) => {
                      const updated = [...databaseChanges];
                      updated[index] = e.target.value;
                      setDatabaseChanges(updated);
                    }}
                    placeholder="Describe the database change"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setDatabaseChanges(databaseChanges.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Technical Notes */}
            <div className="space-y-2">
              <Label htmlFor="technical-notes">Technical Notes (Optional)</Label>
              <Textarea
                id="technical-notes"
                value={technicalNotes}
                onChange={(e) => setTechnicalNotes(e.target.value)}
                placeholder="Additional technical details..."
                rows={4}
              />
            </div>
          </>
        )}

        {/* Bug Fixes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{templateType === 'admin' ? '🐛 Bug Fixes' : '🔧 What We Fixed!'}</Label>
            <Button type="button" size="sm" variant="outline" onClick={addBugFix}>
              <Plus className="h-4 w-4 mr-1" />
              Add {templateType === 'admin' ? 'Fix' : 'Fix'}
            </Button>
          </div>
          {(templateType === 'admin' ? bugFixes : userFriendlyFixes).map((fix, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={fix}
                onChange={(e) => {
                  if (templateType === 'admin') {
                    const updated = [...bugFixes];
                    updated[index] = e.target.value;
                    setBugFixes(updated);
                  } else {
                    const updated = [...userFriendlyFixes];
                    updated[index] = e.target.value;
                    setUserFriendlyFixes(updated);
                  }
                }}
                placeholder={templateType === 'admin' ? "Describe the bug fix" : "What we fixed (e.g., 'Login works smoothly now!')"}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (templateType === 'admin') {
                    setBugFixes(bugFixes.filter((_, i) => i !== index));
                  } else {
                    setUserFriendlyFixes(userFriendlyFixes.filter((_, i) => i !== index));
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Improvements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{templateType === 'admin' ? '🚀 Performance Improvements' : '🚀 What\'s Better Now!'}</Label>
            <Button type="button" size="sm" variant="outline" onClick={addImprovement}>
              <Plus className="h-4 w-4 mr-1" />
              Add {templateType === 'admin' ? 'Improvement' : 'Improvement'}
            </Button>
          </div>
          {(templateType === 'admin' ? improvements : userFriendlyImprovements).map((improvement, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={improvement}
                onChange={(e) => {
                  if (templateType === 'admin') {
                    const updated = [...improvements];
                    updated[index] = e.target.value;
                    setImprovements(updated);
                  } else {
                    const updated = [...userFriendlyImprovements];
                    updated[index] = e.target.value;
                    setUserFriendlyImprovements(updated);
                  }
                }}
                placeholder={templateType === 'admin' ? "Describe the improvement" : "What's better (e.g., 'Everything loads faster!')"}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (templateType === 'admin') {
                    setImprovements(improvements.filter((_, i) => i !== index));
                  } else {
                    setUserFriendlyImprovements(userFriendlyImprovements.filter((_, i) => i !== index));
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Known Issues */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{templateType === 'admin' ? '⚠️ Known Issues' : '⚠️ Heads Up, Party People!'}</Label>
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
                placeholder={templateType === 'admin' ? "Describe the known issue" : "What to watch out for (e.g., 'Sometimes the music takes a moment to load')"}
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
            placeholder={templateType === 'admin' ? "Any additional technical information..." : "Any other fun stuff to share..."}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSend} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Send {templateType === 'admin' ? 'Admin' : 'User'} System Update
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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

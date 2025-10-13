import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface WidgetVisibility {
  userEngagement: boolean;
  contentMetrics: boolean;
  rsvpTrends: boolean;
  photoPopularity: boolean;
  guestbookActivity: boolean;
  systemHealth: boolean;
  realtimeActivity: boolean;
}

interface DashboardSettingsProps {
  visibility: WidgetVisibility;
  onSave: (visibility: WidgetVisibility) => void;
}

const WIDGET_LABELS = {
  userEngagement: 'User Engagement',
  contentMetrics: 'Content Metrics',
  rsvpTrends: 'RSVP Trends',
  photoPopularity: 'Photo Popularity',
  guestbookActivity: 'Guestbook Activity',
  systemHealth: 'System Health',
  realtimeActivity: 'Realtime Activity Feed',
};

export function DashboardSettings({ visibility, onSave }: DashboardSettingsProps) {
  const [open, setOpen] = useState(false);
  const [localVisibility, setLocalVisibility] = useState<WidgetVisibility>(visibility);

  const handleSave = () => {
    onSave(localVisibility);
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalVisibility(visibility);
    setOpen(false);
  };

  const toggleWidget = (key: keyof WidgetVisibility) => {
    setLocalVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>
            Customize which widgets are visible on your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {Object.entries(WIDGET_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="cursor-pointer">
                {label}
              </Label>
              <Switch
                id={key}
                checked={localVisibility[key as keyof WidgetVisibility]}
                onCheckedChange={() => toggleWidget(key as keyof WidgetVisibility)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

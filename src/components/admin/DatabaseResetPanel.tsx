import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Database, AlertTriangle } from 'lucide-react';

export default function DatabaseResetPanel() {
  const [confirmText, setConfirmText] = useState('');
  const [preservePhotos, setPreservePhotos] = useState(false);
  const [preserveGuestbook, setPreserveGuestbook] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show in development
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       import.meta.env.DEV;

  if (!isDevelopment) {
    return null;
  }

  const handleReset = async () => {
    if (confirmText !== 'RESET DATABASE') {
      toast.error('Please type "RESET DATABASE" to confirm');
      return;
    }

    try {
      setLoading(true);

      // Delete data based on preservation options
      const operations = [];

      if (!preservePhotos) {
        operations.push(supabase.from('photos').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
        operations.push(supabase.from('photo_reactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
        operations.push(supabase.from('photo_emoji_reactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      }

      if (!preserveGuestbook) {
        operations.push(supabase.from('guestbook').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
        operations.push(supabase.from('guestbook_reactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
        operations.push(supabase.from('guestbook_replies').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
        operations.push(supabase.from('guestbook_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      }

      // Always clear these
      operations.push(supabase.from('rsvps').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      operations.push(supabase.from('hunt_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      operations.push(supabase.from('hunt_runs').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      operations.push(supabase.from('hunt_rewards').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      operations.push(supabase.from('tournament_registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      operations.push(supabase.from('tournament_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      operations.push(supabase.from('potluck_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'));

      await Promise.all(operations);

      toast.success('Database reset complete');
      setConfirmText('');
      setPreservePhotos(false);
      setPreserveGuestbook(false);
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Failed to reset database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 md:p-6 border-destructive">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">
            Database Reset (Development Only)
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="preserve-photos"
              checked={preservePhotos}
              onCheckedChange={(checked) => setPreservePhotos(checked as boolean)}
            />
            <label htmlFor="preserve-photos" className="text-sm cursor-pointer">
              Preserve photos and reactions
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="preserve-guestbook"
              checked={preserveGuestbook}
              onCheckedChange={(checked) => setPreserveGuestbook(checked as boolean)}
            />
            <label htmlFor="preserve-guestbook" className="text-sm cursor-pointer">
              Preserve guestbook posts
            </label>
          </div>
        </div>

        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-destructive">Warning:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>This will delete RSVPs, hunt progress, and tournament data</li>
                <li>Admin accounts and user roles will be preserved</li>
                <li>This action cannot be undone</li>
                <li>Only available in development environment</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full min-h-[44px]">
              Reset Database
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Development Database</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  This will permanently delete selected data from your development database.
                </p>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold text-sm text-foreground mb-2">
                    What will be deleted:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>✓ All RSVPs</li>
                    <li>✓ Hunt progress and runs</li>
                    <li>✓ Tournament registrations</li>
                    <li>✓ Potluck items</li>
                    {!preservePhotos && <li>✓ All photos and reactions</li>}
                    {!preserveGuestbook && <li>✓ All guestbook posts</li>}
                  </ul>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Type <span className="font-mono bg-muted px-1">RESET DATABASE</span> to confirm:
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="RESET DATABASE"
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={() => setConfirmText('')}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={confirmText !== 'RESET DATABASE' || loading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {loading ? 'Resetting...' : 'Reset Database'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

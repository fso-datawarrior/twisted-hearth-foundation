import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface GuestbookEntry {
  id: string;
  display_name: string;
  message: string;
  is_anonymous: boolean;
  created_at: string;
  deleted_at: string | null;
  user_id: string;
}

interface GuestbookManagementProps {
  isLoading?: boolean;
}

export default function GuestbookManagement({ isLoading = false }: GuestbookManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch guestbook entries
  const { data: guestbookEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ['admin-guestbook'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guestbook')
        .select('id, display_name, message, is_anonymous, created_at, deleted_at, user_id')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GuestbookEntry[];
    }
  });

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('guestbook')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', entryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Message hidden",
        description: "The guestbook message has been hidden from public view."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-guestbook'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to hide message: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('guestbook')
        .update({ deleted_at: null })
        .eq('id', entryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Message restored",
        description: "The guestbook message has been restored to public view."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-guestbook'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to restore message: " + error.message,
        variant: "destructive"
      });
    }
  });

  const activeEntries = guestbookEntries?.filter(entry => !entry.deleted_at) || [];
  const hiddenEntries = guestbookEntries?.filter(entry => entry.deleted_at) || [];

  if (isLoading || entriesLoading) {
    return <div className="text-center py-8">Loading guestbook entries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Guestbook Moderation</h2>
          <p className="text-muted-foreground">Manage and moderate guestbook messages</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="secondary">
            {activeEntries.length} Active
          </Badge>
          <Badge variant="outline">
            {hiddenEntries.length} Hidden
          </Badge>
        </div>
      </div>

      {/* Active Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Active Messages ({activeEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeEntries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active guestbook messages</p>
          ) : (
            <div className="space-y-4">
              {activeEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.display_name}</span>
                      {entry.is_anonymous && (
                        <Badge variant="outline" className="text-xs">Anonymous</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => softDeleteMutation.mutate(entry.id)}
                        disabled={softDeleteMutation.isPending}
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm bg-muted/30 p-3 rounded border-l-4 border-primary/20">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden Messages */}
      {hiddenEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Hidden Messages ({hiddenEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hiddenEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.display_name}</span>
                      {entry.is_anonymous && (
                        <Badge variant="outline" className="text-xs">Anonymous</Badge>
                      )}
                      <Badge variant="destructive" className="text-xs">Hidden</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Hidden: {format(new Date(entry.deleted_at!), 'MMM d, yyyy HH:mm')}
                      </span>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => restoreMutation.mutate(entry.id)}
                        disabled={restoreMutation.isPending}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm bg-muted/30 p-3 rounded border-l-4 border-destructive/20">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
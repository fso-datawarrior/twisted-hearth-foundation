import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Images, Check, X, Eye, Star } from 'lucide-react';

interface Photo {
  id: string;
  user_id: string;
  filename: string;
  caption?: string;
  category?: string;
  is_approved: boolean;
  is_featured: boolean;
  likes_count: number;
  created_at: string;
  storage_path: string;
}

interface GalleryManagementProps {
  photos: Photo[];
  isLoading: boolean;
}

export default function GalleryManagement({ photos, isLoading }: GalleryManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Moderate photo mutation
  const moderatePhotoMutation = useMutation({
    mutationFn: async ({ photoId, approve, featured = false }: { photoId: string; approve: boolean; featured?: boolean }) => {
      const { data, error } = await supabase.rpc('moderate_photo', {
        p_photo_id: photoId,
        p_approve: approve,
        p_featured: featured
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({
        title: "Photo Updated",
        description: "Photo status has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update photo: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading photos...</div>
        </div>
      </div>
    );
  }

  const stats = photos ? photos.reduce((acc, photo) => ({
    total: acc.total + 1,
    approved: acc.approved + (photo.is_approved ? 1 : 0),
    pending: acc.pending + (!photo.is_approved ? 1 : 0),
    featured: acc.featured + (photo.is_featured ? 1 : 0),
  }), { total: 0, approved: 0, pending: 0, featured: 0 }) : { total: 0, approved: 0, pending: 0, featured: 0 };

  const pendingPhotos = photos?.filter(p => !p.is_approved) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Gallery Management</h2>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Images className="h-4 w-4 mr-2 text-primary" />
              Total Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-accent" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-2 text-secondary" />
              Featured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Photos Grid */}
      {pendingPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Photos Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={`${supabase.storage.from('gallery').getPublicUrl(photo.storage_path).data.publicUrl}`}
                      alt={photo.caption || 'Photo'}
                      width="640"
                      height="360"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {photo.caption || 'No caption'}
                      </p>
                      <Badge variant="secondary">{photo.category || 'general'}</Badge>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => moderatePhotoMutation.mutate({
                            photoId: photo.id,
                            approve: true
                          })}
                          disabled={moderatePhotoMutation.isPending}
                          className="flex-1"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => moderatePhotoMutation.mutate({
                            photoId: photo.id,
                            approve: false
                          })}
                          disabled={moderatePhotoMutation.isPending}
                          className="flex-1"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pendingPhotos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">No photos awaiting approval.</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
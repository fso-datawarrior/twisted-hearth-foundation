import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Images } from 'lucide-react';
import { moderatePhoto, type Photo } from '@/lib/photo-api';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface GalleryManagementProps {
  photos: Photo[];
  isLoading: boolean;
}

export default function GalleryManagement({ photos, isLoading }: GalleryManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const moderateMutation = useMutation({
    mutationFn: async ({ photoId, approve, featured }: { photoId: string; approve: boolean; featured?: boolean }) => {
      const { error } = await moderatePhoto(photoId, approve, featured);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ title: "Photo Updated", description: "Photo moderation status updated successfully." });
    }
  });

  const pendingPhotos = photos?.filter(p => !p.is_approved) || [];

  if (isLoading) {
    return <div className="text-center py-12">Loading photos...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Gallery Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Pending Photos ({pendingPhotos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pendingPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <img 
                  src={`https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v1/object/public/gallery/${photo.storage_path}`}
                  alt={photo.caption || photo.filename}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-2 space-y-2">
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => moderateMutation.mutate({ photoId: photo.id, approve: true })}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => moderateMutation.mutate({ photoId: photo.id, approve: true, featured: true })}>
                      <Star className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => moderateMutation.mutate({ photoId: photo.id, approve: false })}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {pendingPhotos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No pending photos</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

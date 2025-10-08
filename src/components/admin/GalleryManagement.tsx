import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Star, StarOff, Images } from 'lucide-react';
import { moderatePhoto, type Photo } from '@/lib/photo-api';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GalleryManagementProps {
  photos: Photo[];
  isLoading: boolean;
}

interface PhotoWithUrl extends Photo {
  signedUrl?: string;
}

export default function GalleryManagement({ photos, isLoading }: GalleryManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photosWithUrls, setPhotosWithUrls] = useState<PhotoWithUrl[]>([]);

  // Generate signed URLs for all photos
  useEffect(() => {
    const generateSignedUrls = async () => {
      const photosWithSignedUrls = await Promise.all(
        photos.map(async (photo) => {
          const { data } = await supabase.storage
            .from('gallery')
            .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry
          
          return {
            ...photo,
            signedUrl: data?.signedUrl || ''
          };
        })
      );
      setPhotosWithUrls(photosWithSignedUrls);
    };

    if (photos?.length > 0) {
      generateSignedUrls();
    }
  }, [photos]);

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

  const pendingPhotos = photosWithUrls?.filter(p => !p.is_approved) || [];
  const approvedPhotos = photosWithUrls?.filter(p => p.is_approved) || [];

  if (isLoading) {
    return <div className="text-center py-12">Loading photos...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Gallery Management</h2>
      
      {/* Pending Photos Section */}
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
                  src={photo.signedUrl}
                  alt={photo.caption || photo.filename}
                  className="w-full h-48 object-cover bg-muted"
                  loading="lazy"
                />
                <CardContent className="p-2 space-y-2">
                  <p className="text-xs text-muted-foreground truncate">{photo.filename}</p>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => moderateMutation.mutate({ photoId: photo.id, approve: true })}
                      title="Approve"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => moderateMutation.mutate({ photoId: photo.id, approve: true, featured: true })}
                      title="Approve & Feature"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => moderateMutation.mutate({ photoId: photo.id, approve: false })}
                      title="Reject"
                    >
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

      {/* Approved Photos Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Approved Photos ({approvedPhotos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {approvedPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={photo.signedUrl}
                    alt={photo.caption || photo.filename}
                    className="w-full h-48 object-cover bg-muted"
                    loading="lazy"
                  />
                  {photo.is_featured && (
                    <Badge className="absolute top-2 right-2" variant="default">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-2 space-y-2">
                  <p className="text-xs text-muted-foreground truncate">{photo.filename}</p>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant={photo.is_featured ? "default" : "outline"}
                      onClick={() => moderateMutation.mutate({ 
                        photoId: photo.id, 
                        approve: true, 
                        featured: !photo.is_featured 
                      })}
                      title={photo.is_featured ? "Unfeature" : "Feature"}
                    >
                      {photo.is_featured ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => moderateMutation.mutate({ photoId: photo.id, approve: false })}
                      title="Unapprove"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {approvedPhotos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No approved photos yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

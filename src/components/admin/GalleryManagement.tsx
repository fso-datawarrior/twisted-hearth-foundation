import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Star, StarOff, Images, ArrowDown, ArrowUp } from 'lucide-react';
import { moderatePhoto, updatePhotoMetadata, type Photo } from '@/lib/photo-api';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CategorySelector from './CategorySelector';

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
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string[]>>({});
  const [captionEdits, setCaptionEdits] = useState<Record<string, string>>({});

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

  const updateCategoriesMutation = useMutation({
    mutationFn: async ({ photoId, categories }: { photoId: string; categories: string[] }) => {
      const { error } = await updatePhotoMetadata(photoId, { tags: categories });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ title: "Categories Updated", description: "Photo categories saved successfully." });
    }
  });

  const updateCaptionMutation = useMutation({
    mutationFn: async ({ photoId, caption }: { photoId: string; caption: string }) => {
      const { error } = await updatePhotoMetadata(photoId, { caption });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ title: "Caption Updated", description: "Photo description saved successfully." });
    }
  });

  const handleCategoryChange = (photoId: string, categories: string[]) => {
    setCategoryEdits(prev => ({ ...prev, [photoId]: categories }));
  };

  const handleCategorySave = (photoId: string) => {
    const categories = categoryEdits[photoId];
    if (categories) {
      updateCategoriesMutation.mutate({ photoId, categories });
    }
  };

  const handleCaptionChange = (photoId: string, caption: string) => {
    if (caption.length <= 250) {
      setCaptionEdits(prev => ({ ...prev, [photoId]: caption }));
    }
  };

  const handleCaptionSave = (photoId: string) => {
    const caption = captionEdits[photoId];
    if (caption !== undefined) {
      updateCaptionMutation.mutate({ photoId, caption });
    }
  };

  const toggleVignetteSelection = useMutation({
    mutationFn: async ({ photoId, selected }: { photoId: string; selected: boolean }) => {
      // Get current photo data
      const { data: currentPhoto, error: fetchError } = await supabase
        .from('photos')
        .select('tags')
        .eq('id', photoId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update tags to include or remove 'vignette-selected'
      const currentTags = currentPhoto.tags || [];
      let newTags;
      
      if (selected) {
        // Add vignette-selected tag if not already present
        newTags = currentTags.includes('vignette-selected') 
          ? currentTags 
          : [...currentTags, 'vignette-selected'];
      } else {
        // Remove vignette-selected tag
        newTags = currentTags.filter(tag => tag !== 'vignette-selected');
      }
      
      const { error } = await supabase
        .from('photos')
        .update({ tags: newTags })
        .eq('id', photoId)
        .eq('is_approved', true);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ 
        title: "Vignette Selection Updated", 
        description: "Photo vignette selection has been updated." 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update vignette selection: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleVignetteToggle = (photoId: string, selected: boolean) => {
    toggleVignetteSelection.mutate({ photoId, selected });
  };

  const pendingPhotos = photosWithUrls?.filter(p => !p.is_approved) || [];
  const approvedPhotos = photosWithUrls?.filter(p => p.is_approved) || [];

  if (isLoading) {
    return <div className="text-center py-12">Loading photos...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Gallery Management</h2>
      
      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => document.getElementById('pending-photos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ArrowDown className="h-4 w-4 mr-2" />
          Go to Pending Photos
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => document.getElementById('approved-photos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ArrowDown className="h-4 w-4 mr-2" />
          Go to Approved Photos
        </Button>
      </div>
      
      {/* Pending Photos Section */}
      <Card id="pending-photos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Pending Photos ({pendingPhotos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <img 
                  src={photo.signedUrl}
                  alt={photo.caption || photo.filename}
                  className="w-full h-48 sm:h-40 object-cover bg-muted"
                  loading="lazy"
                />
                <CardContent className="p-4 sm:p-2 space-y-3 sm:space-y-2">
                  <p className="text-xs text-muted-foreground truncate">{photo.filename}</p>
                  <CategorySelector
                    selectedCategories={categoryEdits[photo.id] || photo.tags || []}
                    onChange={(categories) => handleCategoryChange(photo.id, categories)}
                    onSave={() => handleCategorySave(photo.id)}
                  />
                  <div className="space-y-1">
                    <Textarea
                      placeholder="Add description (250 char max)"
                      value={captionEdits[photo.id] ?? photo.caption ?? ''}
                      onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                      maxLength={250}
                      className="text-xs min-h-[60px] resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {(captionEdits[photo.id] ?? photo.caption ?? '').length}/250
                      </span>
                      {captionEdits[photo.id] !== undefined && (
                        <Button size="sm" variant="ghost" onClick={() => handleCaptionSave(photo.id)}>
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-4"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Back to Top
          </Button>
        </CardContent>
      </Card>

      {/* Approved Photos Section */}
      <Card id="approved-photos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Approved Photos ({approvedPhotos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {approvedPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={photo.signedUrl}
                    alt={photo.caption || photo.filename}
                    className="w-full h-48 sm:h-40 object-cover bg-muted"
                    loading="lazy"
                  />
                  {photo.is_featured && (
                    <Badge className="absolute top-2 right-2" variant="default">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 sm:p-2 space-y-3 sm:space-y-2">
                  <p className="text-xs text-muted-foreground truncate">{photo.filename}</p>
                  <CategorySelector
                    selectedCategories={categoryEdits[photo.id] || photo.tags || []}
                    onChange={(categories) => handleCategoryChange(photo.id, categories)}
                    onSave={() => handleCategorySave(photo.id)}
                  />
                  <div className="space-y-1">
                    <Textarea
                      placeholder="Add description (250 char max)"
                      value={captionEdits[photo.id] ?? photo.caption ?? ''}
                      onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                      maxLength={250}
                      className="text-xs min-h-[60px] resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {(captionEdits[photo.id] ?? photo.caption ?? '').length}/250
                      </span>
                      {captionEdits[photo.id] !== undefined && (
                        <Button size="sm" variant="ghost" onClick={() => handleCaptionSave(photo.id)}>
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Vignette Selection Controls */}
                  <div className="flex items-center space-x-2 border-t pt-2">
                    <Checkbox
                      id={`vignette-approved-${photo.id}`}
                      checked={photo.tags?.includes('vignette-selected') || false}
                      onCheckedChange={(checked) => handleVignetteToggle(photo.id, checked as boolean)}
                      disabled={toggleVignetteSelection.isPending}
                    />
                    <label 
                      htmlFor={`vignette-approved-${photo.id}`} 
                      className="text-xs font-medium text-accent-gold cursor-pointer"
                    >
                      Use for Vignette
                    </label>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-4"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Back to Top
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

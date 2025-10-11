import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Theater, ArrowUp, ArrowDown, X, Save, RotateCcw, Eye } from 'lucide-react';
import { PhotoLightbox } from '@/components/gallery/PhotoLightbox';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  createVignette, 
  updateVignette, 
  deleteVignette, 
  getAllVignettes,
  type PastVignette,
  type CreateVignetteData 
} from '@/lib/vignette-api';

interface VignettePhoto {
  id: string;
  filename: string;
  caption?: string;
  storage_path: string;
  signedUrl?: string;
  is_vignette_selected: boolean;
}

interface VignetteFormData {
  title: string;
  description: string;
  year: number;
  theme_tag: string;
  is_active: boolean;
  sort_order: number;
}

export default function VignetteManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPhotos, setSelectedPhotos] = useState<VignettePhoto[]>([]);
  const [vignetteData, setVignetteData] = useState<Record<string, VignetteFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch photos selected for vignettes
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['vignette-selected-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .contains('tags', ['vignette-selected'])
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VignettePhoto[];
    }
  });

  // Fetch existing vignettes
  const { data: existingVignettes, isLoading: vignettesLoading } = useQuery({
    queryKey: ['all-vignettes'],
    queryFn: getAllVignettes,
    select: (data) => data.data || []
  });

  // Generate signed URLs for photos
  useEffect(() => {
    const generateSignedUrls = async () => {
      if (!photos || photos.length === 0) return;

      const photosWithUrls = await Promise.all(
        photos.map(async (photo) => {
          const { data } = await supabase.storage
            .from('gallery')
            .createSignedUrl(photo.storage_path, 3600);
          
          return {
            ...photo,
            signedUrl: data?.signedUrl || ''
          };
        })
      );
      setSelectedPhotos(photosWithUrls);
    };

    generateSignedUrls();
  }, [photos]);

  // Initialize vignette data from existing vignettes
  useEffect(() => {
    if (existingVignettes && selectedPhotos.length > 0) {
      const initialData: Record<string, VignetteFormData> = {};
      
      selectedPhotos.forEach((photo, index) => {
        // Check if this photo already has a vignette
        const existingVignette = existingVignettes.find(v => 
          v.photo_ids && v.photo_ids.includes(photo.id)
        );
        
        if (existingVignette) {
          initialData[photo.id] = {
            title: existingVignette.title,
            description: existingVignette.description,
            year: existingVignette.year,
            theme_tag: existingVignette.theme_tag,
            is_active: existingVignette.is_active,
            sort_order: existingVignette.sort_order
          };
        } else {
          // Default values for new vignettes
          initialData[photo.id] = {
            title: '',
            description: '',
            year: new Date().getFullYear(),
            theme_tag: '',
            is_active: true,
            sort_order: index
          };
        }
      });
      
      setVignetteData(initialData);
    }
  }, [existingVignettes, selectedPhotos]);

  const createVignetteMutation = useMutation({
    mutationFn: async (data: CreateVignetteData) => {
      const { error } = await createVignette(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-vignettes'] });
      queryClient.invalidateQueries({ queryKey: ['active-vignettes'] });
      toast({ 
        title: "Success", 
        description: "Vignette saved successfully!" 
      });
    }
  });

  const updateVignetteMutation = useMutation({
    mutationFn: async ({ vignetteId, data }: { vignetteId: string; data: any }) => {
      const { error } = await updateVignette(vignetteId, data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-vignettes'] });
      queryClient.invalidateQueries({ queryKey: ['active-vignettes'] });
      toast({ 
        title: "Success", 
        description: "Vignette updated successfully!" 
      });
    }
  });

  const deleteVignetteMutation = useMutation({
    mutationFn: async (vignetteId: string) => {
      const { error } = await deleteVignette(vignetteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-vignettes'] });
      queryClient.invalidateQueries({ queryKey: ['active-vignettes'] });
      toast({ 
        title: "Success", 
        description: "Vignette deleted successfully!" 
      });
    }
  });

  const handleDataChange = (photoId: string, field: keyof VignetteFormData, value: any) => {
    setVignetteData(prev => ({
      ...prev,
      [photoId]: {
        ...prev[photoId],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const movePhoto = (photoId: string, direction: 'up' | 'down') => {
    const currentIndex = selectedPhotos.findIndex(p => p.id === photoId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === selectedPhotos.length - 1)
    ) {
      return;
    }

    const newPhotos = [...selectedPhotos];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newPhotos[currentIndex], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[currentIndex]];
    setSelectedPhotos(newPhotos);
    
    // Update sort orders
    const newData = { ...vignetteData };
    newData[photoId] = { ...newData[photoId], sort_order: swapIndex };
    newData[newPhotos[currentIndex].id] = { ...newData[newPhotos[currentIndex].id], sort_order: currentIndex };
    setVignetteData(newData);
    setHasChanges(true);
  };

  const removeFromVignettes = async (photoId: string) => {
    // Get current photo data
    const { data: currentPhoto, error: fetchError } = await supabase
      .from('photos')
      .select('tags')
      .eq('id', photoId)
      .single();
    
    if (fetchError) {
      toast({ 
        title: "Error", 
        description: "Failed to remove photo from vignettes",
        variant: "destructive"
      });
      return;
    }
    
    // Remove vignette-selected tag
    const currentTags = currentPhoto.tags || [];
    const newTags = currentTags.filter(tag => tag !== 'vignette-selected');
    
    const { error } = await supabase
      .from('photos')
      .update({ tags: newTags })
      .eq('id', photoId);
    
    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to remove photo from vignettes",
        variant: "destructive"
      });
      return;
    }

    // Remove from local state
    setSelectedPhotos(prev => prev.filter(p => p.id !== photoId));
    setVignetteData(prev => {
      const newData = { ...prev };
      delete newData[photoId];
      return newData;
    });

    // Delete existing vignette if it exists
    const existingVignette = existingVignettes?.find(v => 
      v.photo_ids && v.photo_ids.includes(photoId)
    );
    if (existingVignette) {
      deleteVignetteMutation.mutate(existingVignette.id);
    }

    queryClient.invalidateQueries({ queryKey: ['vignette-selected-photos'] });
    toast({ 
      title: "Success", 
      description: "Photo removed from vignettes" 
    });
  };

  const saveAllChanges = async () => {
    for (const photo of selectedPhotos) {
      const data = vignetteData[photo.id];
      if (!data.title || !data.description || !data.theme_tag) {
        toast({
          title: "Missing Data",
          description: `Please fill in all fields for ${photo.filename}`,
          variant: "destructive"
        });
        return;
      }

      const existingVignette = existingVignettes?.find(v => 
        v.photo_ids && v.photo_ids.includes(photo.id)
      );

      const vignettePayload = {
        title: data.title,
        description: data.description,
        year: data.year,
        theme_tag: data.theme_tag,
        photo_ids: [photo.id],
        is_active: data.is_active,
        sort_order: data.sort_order
      };

      if (existingVignette) {
        await updateVignetteMutation.mutateAsync({
          vignetteId: existingVignette.id,
          data: vignettePayload
        });
      } else {
        await createVignetteMutation.mutateAsync(vignettePayload);
      }
    }

    setHasChanges(false);
  };

  const resetChanges = () => {
    // Reset to original data
    setHasChanges(false);
    queryClient.invalidateQueries({ queryKey: ['all-vignettes'] });
  };

  if (photosLoading || vignettesLoading) {
    return <div className="text-center py-12">Loading vignette data...</div>;
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-accent-gold mb-2">VIGNETTE MANAGEMENT</h2>
          <p className="text-muted-foreground">
            Manage selected photos for Past Twisted Vignettes display
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Theater className="h-3 w-3 mr-1" />
            {selectedPhotos.length} Selected
          </Badge>
        </div>
      </div>

      {selectedPhotos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Theater className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No photos selected for vignettes</p>
          <p className="text-sm">
            Go to the Gallery tab and check "Use for Vignette" on approved photos to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedPhotos.map((photo, index) => {
            const data: VignetteFormData = vignetteData[photo.id] || {
              title: '',
              description: '',
              year: new Date().getFullYear(),
              theme_tag: '',
              is_active: true,
              sort_order: index
            };
            
            return (
              <Card key={photo.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Photo Preview */}
                    <div className="flex-shrink-0 mx-auto lg:mx-0">
                      <img
                        src={photo.signedUrl}
                        alt={photo.caption || photo.filename}
                        className="w-full max-w-xs lg:w-32 h-48 lg:h-32 object-cover rounded border"
                      />
                    </div>

                    {/* Vignette Form */}
                    <div className="flex-1 space-y-4 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="text-sm text-muted-foreground truncate">
                            {photo.filename}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap sm:flex-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => movePhoto(photo.id, 'up')}
                            disabled={index === 0}
                            className="flex-1 sm:flex-none"
                          >
                            <ArrowUp className="h-3 w-3" />
                            <span className="sm:hidden ml-1">Up</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => movePhoto(photo.id, 'down')}
                            disabled={index === selectedPhotos.length - 1}
                            className="flex-1 sm:flex-none"
                          >
                            <ArrowDown className="h-3 w-3" />
                            <span className="sm:hidden ml-1">Down</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromVignettes(photo.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <X className="h-3 w-3" />
                            <span className="sm:hidden ml-1">Remove</span>
                          </Button>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                        className="w-full sm:w-auto mb-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            placeholder="e.g., Goldilocks: Home Invasion"
                            value={data.title || ''}
                            onChange={(e) => handleDataChange(photo.id, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Theme Tag (20 chars max)</label>
                          <Input
                            placeholder="e.g., Breaking & Entering"
                            value={data.theme_tag || ''}
                            onChange={(e) => handleDataChange(photo.id, 'theme_tag', e.target.value)}
                            maxLength={20}
                          />
                          <div className="text-xs text-muted-foreground text-right">
                            {(data.theme_tag || '').length}/20
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="e.g., What really happened when Goldilocks broke into the Bears' house?"
                          value={data.description || ''}
                          onChange={(e) => handleDataChange(photo.id, 'description', e.target.value)}
                          className="min-h-[80px] resize-none"
                          maxLength={1000}
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {(data.description || '').length}/1000
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Year</label>
                          <Input
                            type="number"
                            min="1900"
                            max="2100"
                            value={data.year || new Date().getFullYear()}
                            onChange={(e) => handleDataChange(photo.id, 'year', parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={data.is_active ?? true}
                              onCheckedChange={(checked) => handleDataChange(photo.id, 'is_active', checked)}
                            />
                            <span className="text-sm">
                              {data.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sort Order</label>
                          <Input
                            type="number"
                            min="0"
                            value={data.sort_order ?? index}
                            onChange={(e) => handleDataChange(photo.id, 'sort_order', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={saveAllChanges}
              disabled={!hasChanges || createVignetteMutation.isPending || updateVignetteMutation.isPending}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {createVignetteMutation.isPending || updateVignetteMutation.isPending ? 'Saving...' : 'Save All Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetChanges}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <PhotoLightbox
          photos={selectedPhotos.map(p => ({
            id: p.id,
            url: p.signedUrl || '',
            caption: vignetteData[p.id]?.title || p.caption || '',
            user_id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_approved: true,
            is_featured: false,
            is_favorite: false,
            likes_count: 0,
            tags: [],
            storage_path: p.storage_path,
            filename: p.filename,
          }))}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

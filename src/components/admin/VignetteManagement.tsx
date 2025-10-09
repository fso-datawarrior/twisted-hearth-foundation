import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Theater, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVignette, type CreateVignetteData } from '@/lib/vignette-api';

interface VignetteSelection {
  photoId: string;
  year: number;
  themeTag: string;
}

interface PhotoWithUrl {
  id: string;
  filename: string;
  caption?: string;
  signedUrl?: string;
}

interface VignetteManagementProps {
  vignetteSelections: Record<string, VignetteSelection>;
  photos: PhotoWithUrl[];
  onClearSelections: () => void;
}

interface VignetteFormData {
  title: string;
  description: string;
}

export default function VignetteManagement({ 
  vignetteSelections, 
  photos, 
  onClearSelections 
}: VignetteManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vignetteData, setVignetteData] = useState<Record<string, VignetteFormData>>({});
  const [sortOrder, setSortOrder] = useState<string[]>(Object.keys(vignetteSelections));

  const createVignetteMutation = useMutation({
    mutationFn: async (data: CreateVignetteData) => {
      const { error } = await createVignette(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vignettes'] });
      toast({ 
        title: "Success", 
        description: "Vignettes have been saved successfully!" 
      });
      onClearSelections();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to save vignettes: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleVignetteDataChange = (photoId: string, field: keyof VignetteFormData, value: string) => {
    setVignetteData(prev => ({
      ...prev,
      [photoId]: {
        ...prev[photoId],
        [field]: value
      }
    }));
  };

  const moveVignette = (photoId: string, direction: 'up' | 'down') => {
    const currentIndex = sortOrder.indexOf(photoId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortOrder.length - 1)
    ) {
      return;
    }

    const newOrder = [...sortOrder];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newOrder[currentIndex], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[currentIndex]];
    setSortOrder(newOrder);
  };

  const removeVignette = (photoId: string) => {
    setSortOrder(prev => prev.filter(id => id !== photoId));
    setVignetteData(prev => {
      const newData = { ...prev };
      delete newData[photoId];
      return newData;
    });
  };

  const saveAllVignettes = async () => {
    const vignettesToCreate: CreateVignetteData[] = [];

    for (let i = 0; i < sortOrder.length; i++) {
      const photoId = sortOrder[i];
      const selection = vignetteSelections[photoId];
      const data = vignetteData[photoId];

      if (!data?.title || !data?.description) {
        toast({
          title: "Missing Data",
          description: `Please fill in title and description for all vignettes.`,
          variant: "destructive"
        });
        return;
      }

      if (!selection?.themeTag) {
        toast({
          title: "Missing Theme",
          description: `Please add a theme tag for all selected photos.`,
          variant: "destructive"
        });
        return;
      }

      vignettesToCreate.push({
        title: data.title,
        description: data.description,
        year: selection.year,
        theme_tag: selection.themeTag,
        photo_ids: [photoId],
        sort_order: i,
        is_active: true
      });
    }

    // Create vignettes one by one
    for (const vignetteData of vignettesToCreate) {
      await createVignetteMutation.mutateAsync(vignetteData);
    }
  };

  const getPhotoById = (photoId: string) => {
    return photos.find(p => p.id === photoId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Theater className="h-5 w-5 text-accent-gold" />
          Vignette Management ({sortOrder.length}/3)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortOrder.map((photoId, index) => {
          const selection = vignetteSelections[photoId];
          const photo = getPhotoById(photoId);
          const data = vignetteData[photoId] || { title: '', description: '' };

          if (!selection || !photo) return null;

          return (
            <Card key={photoId} className="p-4">
              <div className="flex gap-4">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  <img
                    src={photo.signedUrl}
                    alt={photo.caption || photo.filename}
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>

                {/* Vignette Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Badge variant="secondary">{selection.year}</Badge>
                      <Badge className="bg-accent-gold/20 text-accent-gold">
                        {selection.themeTag}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveVignette(photoId, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveVignette(photoId, 'down')}
                        disabled={index === sortOrder.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeVignette(photoId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Input
                      placeholder="Vignette Title (e.g., 'Goldilocks: Home Invasion')"
                      value={data.title}
                      onChange={(e) => handleVignetteDataChange(photoId, 'title', e.target.value)}
                      className="font-medium"
                    />
                    <Textarea
                      placeholder="Vignette Description (e.g., 'What really happened when Goldilocks broke into the Bears' house?')"
                      value={data.description}
                      onChange={(e) => handleVignetteDataChange(photoId, 'description', e.target.value)}
                      className="min-h-[80px] resize-none"
                      maxLength={1000}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {data.description?.length || 0}/1000 characters
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {sortOrder.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No vignettes selected. Select photos from the gallery above to create vignettes.
          </div>
        )}

        {/* Action Buttons */}
        {sortOrder.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={saveAllVignettes}
              disabled={createVignetteMutation.isPending}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {createVignetteMutation.isPending ? 'Saving...' : 'Save All Vignettes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClearSelections}
              disabled={createVignetteMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

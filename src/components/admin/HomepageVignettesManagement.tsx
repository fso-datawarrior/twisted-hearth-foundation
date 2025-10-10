import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getHomepageVignettes, updateVignette, uploadHomepageImage } from '@/lib/vignette-api';
import { ArrowUp, ArrowDown, Upload, Save, X } from 'lucide-react';

interface VignetteFormData {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  teaser_url: string;
  sort_order: number;
}

export default function HomepageVignettesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VignetteFormData | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingTeaser, setUploadingTeaser] = useState(false);

  const { data: vignettes = [], isLoading } = useQuery({
    queryKey: ['homepage-vignettes'],
    queryFn: getHomepageVignettes,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateVignette(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-vignettes'] });
      toast({ title: 'Vignette updated successfully' });
      setEditingId(null);
      setFormData(null);
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update vignette', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleEdit = (vignette: any) => {
    setEditingId(vignette.id);
    setFormData({
      id: vignette.id,
      title: vignette.title,
      description: vignette.description,
      thumbnail_url: vignette.thumbnail_url || '',
      teaser_url: vignette.teaser_url || '',
      sort_order: vignette.sort_order,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  const handleSave = () => {
    if (!formData) return;
    
    updateMutation.mutate({
      id: formData.id,
      updates: {
        title: formData.title,
        description: formData.description,
        thumbnail_url: formData.thumbnail_url,
        teaser_url: formData.teaser_url,
      }
    });
  };

  const handleReorder = (vignetteId: string, direction: 'up' | 'down') => {
    const currentVignette = vignettes.find(v => v.id === vignetteId);
    if (!currentVignette) return;

    const currentOrder = currentVignette.sort_order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Check bounds
    if (newOrder < 1 || newOrder > vignettes.length) return;

    updateMutation.mutate({
      id: vignetteId,
      updates: { sort_order: newOrder }
    });
  };

  const handleFileUpload = async (
    file: File, 
    type: 'thumbnail' | 'teaser'
  ) => {
    if (!formData) return;

    const setUploading = type === 'thumbnail' ? setUploadingThumb : setUploadingTeaser;
    setUploading(true);

    try {
      const publicUrl = await uploadHomepageImage(file, type);
      
      setFormData({
        ...formData,
        [type === 'thumbnail' ? 'thumbnail_url' : 'teaser_url']: publicUrl
      });
      
      toast({ title: `${type} uploaded successfully` });
    } catch (error: any) {
      toast({ 
        title: `Failed to upload ${type}`, 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading homepage vignettes...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-accent-gold mb-2">Homepage Vignettes</h2>
        <p className="text-muted-foreground text-sm">
          ℹ️ These 3 vignettes appear on the home page "Twisted Tales of Years Past" section
        </p>
      </div>

      <div className="space-y-6">
        {vignettes.map((vignette, index) => {
          const isEditing = editingId === vignette.id;
          const data = isEditing && formData ? formData : vignette;

          return (
            <Card key={vignette.id} className="bg-bg-2 border-accent-purple/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{vignette.sort_order}</Badge>
                    {isEditing ? (
                      <Input
                        value={data.title}
                        onChange={(e) => setFormData({ ...formData!, title: e.target.value })}
                        className="text-lg font-bold max-w-md"
                      />
                    ) : (
                      <span className="text-accent-gold">{data.title}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(vignette.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(vignette.id, 'down')}
                          disabled={index === vignettes.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(vignette)}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    {/* Description */}
                    <div>
                      <Label>Description / Hook</Label>
                      <Textarea
                        value={data.description}
                        onChange={(e) => setFormData({ ...formData!, description: e.target.value })}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <Label>Thumbnail Image</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={data.thumbnail_url}
                          onChange={(e) => setFormData({ ...formData!, thumbnail_url: e.target.value })}
                          placeholder="/img/example.jpg or full URL"
                        />
                        <label htmlFor={`thumb-${vignette.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={uploadingThumb}
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4" />
                            </span>
                          </Button>
                        </label>
                        <input
                          id={`thumb-${vignette.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'thumbnail');
                          }}
                        />
                      </div>
                      {data.thumbnail_url && (
                        <img
                          src={data.thumbnail_url}
                          alt="Thumbnail preview"
                          className="mt-2 w-48 h-32 object-cover rounded border"
                        />
                      )}
                    </div>

                    {/* Teaser */}
                    <div>
                      <Label>Teaser Image (Modal)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={data.teaser_url}
                          onChange={(e) => setFormData({ ...formData!, teaser_url: e.target.value })}
                          placeholder="/img/example-teaser.jpg or full URL"
                        />
                        <label htmlFor={`teaser-${vignette.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={uploadingTeaser}
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4" />
                            </span>
                          </Button>
                        </label>
                        <input
                          id={`teaser-${vignette.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'teaser');
                          }}
                        />
                      </div>
                      {data.teaser_url && (
                        <img
                          src={data.teaser_url}
                          alt="Teaser preview"
                          className="mt-2 w-64 h-40 object-cover rounded border"
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">{data.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {data.thumbnail_url && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Thumbnail</Label>
                          <img
                            src={data.thumbnail_url}
                            alt="Thumbnail"
                            className="mt-1 w-full h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                      {data.teaser_url && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Teaser</Label>
                          <img
                            src={data.teaser_url}
                            alt="Teaser"
                            className="mt-1 w-full h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

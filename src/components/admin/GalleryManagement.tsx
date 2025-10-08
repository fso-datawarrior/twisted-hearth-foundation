import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Images, Check, X, Eye, Star, Upload, Trash2, RotateCcw, 
  ArrowUp, ArrowDown, Filter, Search, Plus, Settings
} from 'lucide-react';
import { 
  softDeletePhoto, 
  restorePhoto, 
  moderatePhotoEnhanced,
  uploadPreviewPhoto,
  type Photo 
} from '@/lib/photo-api';

interface GalleryManagementProps {
  photos: Photo[];
  isLoading: boolean;
}

const PREVIEW_CATEGORIES = [
  { id: 'vignettes', label: 'Past Vignettes', description: 'Twisted tales from previous gatherings' },
  { id: 'activities', label: 'Event Activities', description: 'Games, competitions, and twisted fun' },
  { id: 'costumes', label: 'Costume Inspiration', description: 'Twisted fairytale character ideas' },
  { id: 'thumbnails', label: 'Event Memories', description: 'Quick glimpses of past celebrations' }
];

export default function GalleryManagement({ photos, isLoading }: GalleryManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('user-uploads');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    files: null as FileList | null,
    previewCategory: 'vignettes',
    caption: '',
    sortOrder: 0
  });

  // Moderate photo mutation
  const moderatePhotoMutation = useMutation({
    mutationFn: async ({ photoId, approve, featured = false, isPreview, previewCategory, sortOrder }: { 
      photoId: string; 
      approve: boolean; 
      featured?: boolean;
      isPreview?: boolean;
      previewCategory?: string;
      sortOrder?: number;
    }) => {
      const { error } = await moderatePhotoEnhanced(photoId, approve, featured, isPreview, previewCategory, sortOrder);
      if (error) throw error;
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

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await softDeletePhoto(photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({
        title: "Photo Deleted",
        description: "Photo has been hidden from public view."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete photo: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await restorePhoto(photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({
        title: "Photo Restored",
        description: "Photo has been restored to public view."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to restore photo: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Upload preview photo mutation
  const uploadPreviewMutation = useMutation({
    mutationFn: async (formData: { files: FileList; previewCategory: string; caption: string; sortOrder: number }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not authenticated');
      
      const userId = userData.user.id;
      const results = [];

      for (const file of Array.from(formData.files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = file.name;
        const filePath = `preview-uploads/${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Create database record
        const { data, error } = await uploadPreviewPhoto(
          filePath,
          fileName,
          formData.previewCategory,
          formData.caption || undefined,
          formData.sortOrder
        );

        if (error) throw error;
        results.push(data);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      setUploadForm({ files: null, previewCategory: 'vignettes', caption: '', sortOrder: 0 });
      toast({
        title: "Photos Uploaded",
        description: "Preview photos have been uploaded successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: `Failed to upload photos: ${error.message}`,
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

  // Calculate statistics
  const stats = photos ? photos.reduce((acc, photo) => ({
    total: acc.total + 1,
    approved: acc.approved + (photo.is_approved ? 1 : 0),
    pending: acc.pending + (!photo.is_approved ? 1 : 0),
    featured: acc.featured + (photo.is_featured ? 1 : 0),
    preview: acc.preview + (photo.is_preview ? 1 : 0),
    deleted: acc.deleted + (photo.deleted_at ? 1 : 0),
  }), { total: 0, approved: 0, pending: 0, featured: 0, preview: 0, deleted: 0 }) : { total: 0, approved: 0, pending: 0, featured: 0, preview: 0, deleted: 0 };

  // Filter photos based on search and category
  const filteredPhotos = photos?.filter(photo => {
    const matchesSearch = !searchTerm || 
      photo.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.caption && photo.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || 
      (categoryFilter === 'preview' && photo.is_preview) ||
      (categoryFilter === 'user' && !photo.is_preview) ||
      (categoryFilter === 'deleted' && photo.deleted_at) ||
      (categoryFilter === 'pending' && !photo.is_approved) ||
      (categoryFilter === 'approved' && photo.is_approved);
    
    return matchesSearch && matchesCategory;
  }) || [];

  const pendingPhotos = photos?.filter(p => !p.is_approved && !p.deleted_at) || [];
  const previewPhotos = photos?.filter(p => p.is_preview && !p.deleted_at) || [];
  const deletedPhotos = photos?.filter(p => p.deleted_at) || [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadForm(prev => ({ ...prev, files }));
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadForm.files || uploadForm.files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }

    uploadPreviewMutation.mutate(uploadForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Gallery Management</h2>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Images className="h-4 w-4 mr-2 text-primary" />
              Total
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

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Settings className="h-4 w-4 mr-2 text-blue-600" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.preview}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Photos</SelectItem>
            <SelectItem value="preview">Preview Photos</SelectItem>
            <SelectItem value="user">User Uploads</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="user-uploads">User Uploads</TabsTrigger>
          <TabsTrigger value="preview-gallery">Preview Gallery</TabsTrigger>
          <TabsTrigger value="upload">Upload Preview</TabsTrigger>
          <TabsTrigger value="deleted">Deleted Photos</TabsTrigger>
        </TabsList>

        {/* User Uploads Tab */}
        <TabsContent value="user-uploads" className="space-y-4">
          {pendingPhotos.length > 0 ? (
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
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">No photos awaiting approval.</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Preview Gallery Tab */}
        <TabsContent value="preview-gallery" className="space-y-4">
          {PREVIEW_CATEGORIES.map((category) => {
            const categoryPhotos = previewPhotos.filter(p => p.preview_category === category.id);
            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.label}</span>
                    <Badge variant="secondary">{categoryPhotos.length}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardHeader>
                <CardContent>
                  {categoryPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryPhotos.map((photo) => (
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
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => softDeleteMutation.mutate(photo.id)}
                                  disabled={softDeleteMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No photos in this category yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Upload Preview Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Preview Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preview-category">Category</Label>
                  <Select 
                    value={uploadForm.previewCategory} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, previewCategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREVIEW_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Input
                    id="sort-order"
                    type="number"
                    value={uploadForm.sortOrder}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Input
                  id="caption"
                  value={uploadForm.caption}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Enter photo caption..."
                />
              </div>

              <div>
                <Label htmlFor="file-upload">Select Photos</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>

              <Button 
                onClick={handleUploadSubmit}
                disabled={!uploadForm.files || uploadPreviewMutation.isPending}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadPreviewMutation.isPending ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deleted Photos Tab */}
        <TabsContent value="deleted" className="space-y-4">
          {deletedPhotos.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Deleted Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deletedPhotos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden opacity-60">
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
                          <Badge variant="destructive">Deleted</Badge>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => restoreMutation.mutate(photo.id)}
                              disabled={restoreMutation.isPending}
                              className="flex-1"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">No deleted photos.</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
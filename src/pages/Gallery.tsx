import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import HuntRune from "@/components/hunt/HuntRune";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Heart, Clock, CheckCircle } from "lucide-react";
import { getAllPreviewImages, PREVIEW_CATEGORIES } from "@/config/previewImages";
import MultiPreviewCarousel from "@/components/MultiPreviewCarousel";
import RequireAuth from "@/components/RequireAuth";
import { 
  uploadPhotoMetadata, 
  getApprovedPhotos, 
  getUserPhotos,
  togglePhotoReaction,
  deletePhoto,
  updatePhotoMetadata,
  Photo 
} from "@/lib/photo-api";
import { PhotoCarousel } from "@/components/gallery/PhotoCarousel";
import { PhotoCard } from "@/components/gallery/PhotoCard";

const Gallery = () => {
  const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([]);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Load approved photos for public gallery
      const { data: approved, error: approvedError } = await getApprovedPhotos();
      if (approvedError) throw approvedError;
      setApprovedPhotos(approved || []);

      // Load user's own photos (including pending)
      const { data: user, error: userError } = await getUserPhotos();
      if (userError) throw userError;
      setUserPhotos(user || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const getPhotoUrl = async (storagePath: string): Promise<string> => {
    // Generate signed URL for private bucket
    const { data } = await supabase.storage
      .from('gallery')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry
    return data?.signedUrl || '';
  };

  // Convert static images to Photo-like objects
  const getStaticPhotosForCategory = (categoryId: string): Photo[] => {
    const category = PREVIEW_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];
    
    return category.images.map((img, index) => ({
      id: `static-${categoryId}-${index}`,
      user_id: 'system',
      storage_path: img.path,
      filename: img.filename,
      caption: img.title,
      tags: [categoryId],
      category: categoryId as any,
      is_approved: true,
      is_featured: false,
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  // Get filtered photos based on active category
  const getFilteredPhotos = (): Photo[] => {
    const dbPhotos = approvedPhotos || [];
    
    if (activeCategory === 'all') {
      // Show all database photos + all static images
      const allStaticPhotos = PREVIEW_CATEGORIES.flatMap(cat => getStaticPhotosForCategory(cat.id));
      return [...dbPhotos, ...allStaticPhotos];
    }
    
    // Filter database photos by category
    const filteredDbPhotos = dbPhotos.filter(photo => 
      photo.tags?.includes(activeCategory) || photo.category === activeCategory
    );
    
    // Get static images for this category
    const staticPhotos = getStaticPhotosForCategory(activeCategory);
    
    return [...filteredDbPhotos, ...staticPhotos];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not authenticated');
      const userId = userData.user.id;

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = file.name;
        const filePath = `user-uploads/${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Create database record
        const { error: metadataError } = await uploadPhotoMetadata(
          filePath,
          fileName,
          undefined, // caption
          [], // tags
          'general' // category
        );

        if (metadataError) {
          console.error('Metadata error:', metadataError);
          // Still continue - photo is uploaded to storage
        }
      }
      
      toast({
        title: "Photos uploaded!",
        description: "Your photos are pending approval and will appear in the gallery once reviewed.",
      });
      
      loadImages();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleLike = async (photoId: string) => {
    try {
      const { error } = await togglePhotoReaction(photoId, 'like');
      if (error) throw error;
      
      // Refresh photos to update like counts
      loadImages();
    } catch (error) {
      console.error('Like error:', error);
      toast({
        title: "Error",
        description: "Failed to update like.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (photoId: string, storagePath: string) => {
    try {
      const { error } = await deletePhoto(photoId, storagePath);
      if (error) throw error;
      
      // Immediately update state by filtering out deleted photo
      setUserPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
      
      toast({
        title: "Photo deleted",
        description: "Your photo has been removed.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (photoId: string, updates: any) => {
    try {
      const { error } = await updatePhotoMetadata(photoId, updates);
      if (error) throw error;
      
      toast({
        title: "Photo updated",
        description: "Your photo metadata has been saved.",
      });
      
      loadImages();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update photo.",
        variant: "destructive",
      });
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background relative">
        <main className="pt-20 relative z-10">
          {/* <CSSFogBackground /> */}
          <section className="py-16 px-6">
            <div className="container mx-auto max-w-6xl">
              <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
                Gallery of Twisted Tales
              </h1>
              
              <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
                Memories from past celebrations and previews of what's to come. 
                Every image tells a story... some darker than others.
              </p>
              
              {/* Upload Section */}
              <div className="mb-12 text-center relative">
                <HuntRune 
                  id="7" 
                  label="A picture is a promise"
                  bonus={true}
                  className="absolute -top-2 -right-2"
                />
                <div className="bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                  <h2 className="font-subhead text-2xl mb-4 text-accent-gold">Share Your Photos</h2>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-accent-purple/50 rounded-lg p-8 hover:border-accent-gold/50 transition-colors">
                      <Upload className="mx-auto mb-4 text-accent-gold" size={48} />
                      <p className="font-subhead text-accent-gold mb-2">Click to upload images</p>
                      <p className="font-body text-sm text-muted-foreground">
                        Multiple files supported. By uploading, you confirm you have permission to share these images.
                      </p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </Label>
                  {uploading && (
                    <p className="font-body text-sm text-accent-gold mt-4">Uploading...</p>
                  )}
              </div>
            </div>

            {/* My Photos Section */}
            {userPhotos.length > 0 && (
              <div className="mb-12">
                <h2 className="font-subhead text-2xl mb-6 text-accent-gold">
                  My Photos ({userPhotos.length})
                </h2>
                <PhotoCarousel
                  photos={userPhotos}
                  onLike={handleLike}
                  getPhotoUrl={getPhotoUrl}
                  showStatus={true}
                  showEditControls={true}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  photosPerView={window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2}
                  className="mb-4"
                />
              </div>
            )}

            {/* Gallery from Halloween's Past */}
            <div className="mb-16">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Gallery from Halloween's Past
              </h2>
              
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setActiveCategory('all')}
                  className="font-subhead"
                >
                  All Photos
                </Button>
                {PREVIEW_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(category.id)}
                    className="font-subhead"
                  >
                    {category.title}
                  </Button>
                ))}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getFilteredPhotos().map((photo) => (
                  <PhotoCard 
                    key={photo.id} 
                    photo={photo} 
                    onLike={photo.user_id !== 'system' ? handleLike : undefined}
                    getPhotoUrl={photo.user_id === 'system' ? undefined : getPhotoUrl}
                    showStatus={false}
                  />
                ))}
              </div>

              {getFilteredPhotos().length === 0 && (
                <div className="text-center py-12 bg-card rounded-lg border border-accent-purple/30">
                  <p className="font-body text-muted-foreground mb-2">
                    No photos in this category yet.
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    Be the first to upload a photo for {PREVIEW_CATEGORIES.find(c => c.id === activeCategory)?.title}!
                  </p>
                </div>
              )}
            </div>
            
            {/* Photo Guidelines */}
            <div className="bg-bg-2 p-8 rounded-lg border border-accent-purple/30">
              <h2 className="font-subhead text-2xl text-center mb-6 text-accent-gold">
                Photography Guidelines
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-subhead text-lg mb-4 text-accent-gold text-center">During the Event</h3>
                  <ul className="font-body text-sm text-muted-foreground space-y-2">
                    <li>• Photography encouraged during designated times</li>
                    <li>• Respect others' privacy and consent</li>
                    <li>• No flash during performances</li>
                    <li>• Tag us on social media: #TwistedFairytalesBash</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-subhead text-lg mb-4 text-accent-gold text-center">Share Your Photos</h3>
                  <ul className="font-body text-sm text-muted-foreground space-y-2">
                    <li>• Email your best shots for the gallery</li>
                    <li>• Professional portrait station available</li>
                    <li>• Group photos encouraged</li>
                    <li>• Behind-the-scenes moments welcome</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="font-body text-muted-foreground italic">
                  "Some memories are too dark to develop, but the best ones glow in the shadows."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  </RequireAuth>
  );
};

export default Gallery;
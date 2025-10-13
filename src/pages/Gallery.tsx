import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import MultiPreviewCarousel from "@/components/MultiPreviewCarousel";
import EmptyGalleryState from "@/components/gallery/EmptyGalleryState";
import RequireAuth from "@/components/RequireAuth";
import { 
  uploadPhotoMetadata, 
  getApprovedPhotos, 
  getUserPhotos,
  togglePhotoReaction,
  togglePhotoFavorite,
  togglePhotoEmojiReaction,
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
  const [loading, setLoading] = useState(true);
  const [photosPerView, setPhotosPerView] = useState(1);
  
  // Pagination state
  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const PAGE_SIZE = 20; // Load 20 photos at a time
  
  const { toast } = useToast();

  // Dynamic photos per view based on window width (with throttling for Edge)
  useEffect(() => {
    const updatePhotosPerView = () => {
      if (window.innerWidth >= 1280) setPhotosPerView(5);
      else if (window.innerWidth >= 1024) setPhotosPerView(4);
      else if (window.innerWidth >= 640) setPhotosPerView(3);
      else setPhotosPerView(2);
    };
    
    updatePhotosPerView();
    
    // Throttle resize listener for Edge performance
    let timeoutId: NodeJS.Timeout;
    const throttledUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updatePhotosPerView, 150);
    };
    
    window.addEventListener('resize', throttledUpdate);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', throttledUpdate);
    };
  }, []);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async (loadMore: boolean = false) => {
    // Performance monitoring
    const startTime = performance.now();
    console.log(`[Gallery] Loading images - loadMore: ${loadMore}`);

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Load approved photos with pagination
      const currentApprovedPage = loadMore ? approvedPage + 1 : 1;
      const { data: approved, error: approvedError, totalCount: approvedCount } = 
        await getApprovedPhotos(currentApprovedPage, PAGE_SIZE);
      
      if (approvedError) throw approvedError;
      
      if (loadMore) {
        // Append to existing photos
        setApprovedPhotos(prev => [...prev, ...(approved || [])]);
        setApprovedPage(currentApprovedPage);
      } else {
        // Replace photos
        setApprovedPhotos(approved || []);
        setApprovedPage(1);
      }
      setApprovedTotal(approvedCount);

      // Load user photos with pagination
      const currentUserPage = loadMore ? userPage + 1 : 1;
      const { data: user, error: userError, totalCount: userCount } = 
        await getUserPhotos(currentUserPage, PAGE_SIZE);
      
      if (userError) throw userError;
      
      if (loadMore) {
        setUserPhotos(prev => [...prev, ...(user || [])]);
        setUserPage(currentUserPage);
      } else {
        setUserPhotos(user || []);
        setUserPage(1);
      }
      setUserTotal(userCount);

      // Performance logging
      const loadTime = performance.now() - startTime;
      console.log(`[Gallery] Images loaded in ${loadTime.toFixed(2)}ms - Approved: ${approved?.length}/${approvedCount}, User: ${user?.length}/${userCount}`);
      
      // Memory usage (Edge debugging)
      if ((performance as any).memory) {
        const memoryMB = ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2);
        console.log(`[Gallery] Memory usage: ${memoryMB} MB`);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error loading photos",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getPhotoUrl = async (storagePath: string): Promise<string> => {
    try {
      const { data } = supabase.storage
        .from('gallery')
        .getPublicUrl(storagePath);
      
      if (!data?.publicUrl) {
        console.warn('[Gallery] No public URL for:', storagePath);
        return '/img/no-photos-placeholder.jpg';
      }
      
      return data.publicUrl;
    } catch (error) {
      console.error('[Gallery] Error generating URL:', error, storagePath);
      return '/img/no-photos-placeholder.jpg';
    }
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

  const handleFavorite = async (photoId: string) => {
    try {
      const { data, error } = await togglePhotoFavorite(photoId);
      if (error) throw error;
      
      toast({
        title: data ? "Added to favorites" : "Removed from favorites",
        description: data ? "Photo has been marked as favorite." : "Photo removed from favorites.",
      });
      
      loadImages();
    } catch (error) {
      console.error('Favorite error:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite.",
        variant: "destructive",
      });
    }
  };

  const handleEmojiReaction = async (photoId: string, emoji: string) => {
    try {
      const { error } = await togglePhotoEmojiReaction(photoId, emoji);
      if (error) throw error;
      
      loadImages();
    } catch (error) {
      console.error('Emoji reaction error:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction.",
        variant: "destructive",
      });
    }
  };

  const handleCaptionUpdate = async (photoId: string, caption: string) => {
    try {
      // Validate caption length
      if (caption.length > 250) {
        toast({
          title: "Caption too long",
          description: "Caption must be 250 characters or less.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await updatePhotoMetadata(photoId, { caption });
      if (error) throw error;
      
      toast({
        title: "Caption updated",
        description: "Your photo caption has been saved.",
      });
      
      loadImages();
    } catch (error) {
      console.error('Caption update error:', error);
      toast({
        title: "Error",
        description: "Failed to update caption.",
        variant: "destructive",
      });
    }
  };

  return (
    <RequireAuth>
      <ErrorBoundary>
        <div className="min-h-screen bg-background relative">
          <main className="pt-20 md:pt-24 relative z-10">
            {/* <CSSFogBackground /> */}
            <section className="py-16 px-6">
              <div className="container mx-auto max-w-7xl px-4">
                <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
                  Gallery of Twisted Tales
                </h1>
              
              <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
                Memories from past celebrations and previews of what's to come. 
                Every image tells a story... some darker than others.
              </p>
              
            {/* Gallery from Halloween's Past */}
            <div className="mb-16">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Gallery from Halloween's Past
              </h2>

              {/* Gallery Carousel */}
              <div className="w-full gallery-container">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full h-[400px] rounded-lg" />
                    <div className="flex justify-center space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="w-2 h-2 rounded-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <MultiPreviewCarousel
                      defaultCategory="all"
                      showCategoryTabs={false}
                      autoPlay={true}
                      autoPlayInterval={5000}
                      previewPhotos={approvedPhotos}
                    />
                    
                    {/* Load More button */}
                    {approvedPhotos.length < approvedTotal && (
                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={() => loadImages(true)}
                          disabled={loadingMore}
                          className="bg-accent-gold text-ink hover:bg-accent-gold/80"
                        >
                          {loadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink mr-2" />
                              Loading...
                            </>
                          ) : (
                            `Load More Photos (${approvedPhotos.length} of ${approvedTotal})`
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
              {!loading && (!approvedPhotos || approvedPhotos.length === 0) && (
                <EmptyGalleryState 
                  categoryName="gallery"
                  message="Be the first to share your Twisted Tales memories!"
                />
              )}
            </div>

            {/* Upload Section */}
            <div className="mb-8 text-center relative">
              <div className="bg-card p-6 rounded-lg border border-accent-purple/30 max-w-4xl mx-auto">
                <h2 className="font-subhead text-2xl mb-4 text-accent-gold">Share Your Photos</h2>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-accent-purple/50 rounded-lg p-6 hover:border-accent-gold/50 transition-colors">
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

            {/* My Photos Section - Moved Below */}
            {loading ? (
              <div className="mb-12">
                <h2 className="font-subhead text-2xl mb-6 text-accent-gold">
                  My Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-64 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : userPhotos.length > 0 && (
              <div className="mb-12">
                <h2 className="font-subhead text-2xl mb-6 text-accent-gold">
                  My Photos
                </h2>
                <PhotoCarousel
                  photos={userPhotos}
                  onLike={handleLike}
                  getPhotoUrl={getPhotoUrl}
                  showStatus={true}
                  showUserActions={true}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onFavorite={handleFavorite}
                  onEmojiReaction={handleEmojiReaction}
                  onCaptionUpdate={handleCaptionUpdate}
                  photosPerView={photosPerView}
                  className="mb-4"
                />
                
                {/* Load More button for user photos */}
                {userPhotos.length < userTotal && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={() => loadImages(true)}
                      disabled={loadingMore}
                      className="bg-accent-gold text-ink hover:bg-accent-gold/80"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink mr-2" />
                          Loading...
                        </>
                      ) : (
                        `Load More (${userPhotos.length} of ${userTotal})`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
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
    </ErrorBoundary>
  </RequireAuth>
  );
};

export default Gallery;
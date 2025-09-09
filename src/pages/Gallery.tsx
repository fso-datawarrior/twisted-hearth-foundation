import { useState, useEffect } from "react";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HuntHintTrigger from "@/components/hunt/HuntHintTrigger";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const Gallery = () => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('gallery')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      
      if (error) throw error;
      
      const imageUrls = data
        ?.filter(file => file.name.includes('/'))
        ?.map(file => supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl)
        || [];
      
      setImages(imageUrls);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('gallery')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;
      }
      
      toast({
        title: "Images uploaded!",
        description: "Your photos have been added to the gallery.",
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
  const placeholderImages = [
    "https://images.unsplash.com/photo-1509557965043-e78fcf5299ad?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop"
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
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
            {user ? (
              <div className="mb-12 text-center relative">
                <HuntHintTrigger 
                  id="gallery.upload" 
                  label="A picture is a promise"
                  bonus={true}
                  className="absolute -top-2 -right-2"
                />
                <div className="bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                  <h2 className="font-subhead text-2xl mb-4 text-accent-gold">Share Your Photos</h2>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-accent-purple/50 rounded-lg p-8 hover:border-accent-gold/50 transition-colors">
                      <Upload className="mx-auto mb-4 text-accent-purple" size={48} />
                      <p className="font-subhead text-accent-purple mb-2">Click to upload images</p>
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
            ) : (
              <div className="mb-12 text-center">
                <div className="bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                  <h2 className="font-subhead text-2xl mb-4 text-accent-gold">Sign In to Share</h2>
                  <p className="font-body text-muted-foreground mb-6">
                    Sign in to upload and share your photos from the event.
                  </p>
                </div>
              </div>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.length > 0 ? (
                images.map((url, index) => (
                  <div key={index} className="aspect-square bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors">
                    <img 
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="font-body text-muted-foreground">
                    No images yet. Be the first to share memories from the bash!
                  </p>
                </div>
              )}
            </div>
            <div className="text-center mb-16">
              <div className="bg-card p-12 rounded-lg border border-accent-purple/30 max-w-3xl mx-auto">
                <div className="font-heading text-6xl mb-6 text-accent-gold">🖼️</div>
                <h2 className="font-subhead text-3xl mb-6 text-accent-red">
                  Gallery Opening Soon
                </h2>
                <p className="font-body text-muted-foreground mb-8 text-lg">
                  Our photographers are still developing the film from last year's celebration. 
                  Some images are too dark to process... others refuse to develop at all.
                </p>
                <p className="font-body text-muted-foreground mb-6">
                  This gallery will feature:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="bg-bg-2 p-4 rounded-lg">
                    <h3 className="font-subhead text-lg mb-2 text-accent-gold">Past Events</h3>
                    <ul className="font-body text-sm text-muted-foreground space-y-1">
                      <li>• Costume contest winners</li>
                      <li>• Interactive vignette moments</li>
                      <li>• Behind-the-scenes preparations</li>
                    </ul>
                  </div>
                  <div className="bg-bg-2 p-4 rounded-lg">
                    <h3 className="font-subhead text-lg mb-2 text-accent-gold">This Year</h3>
                    <ul className="font-body text-sm text-muted-foreground space-y-1">
                      <li>• Live event photography</li>
                      <li>• Guest submissions welcome</li>
                      <li>• Professional portrait station</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Placeholder Gallery Grid */}
            <div className="mb-16">
              <h2 className="font-subhead text-2xl text-center mb-8 text-accent-gold">
                Preview: Atmospheric Inspiration
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {placeholderImages.map((image, index) => (
                  <div 
                    key={index}
                    className="aspect-square bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe hover-tilt"
                  >
                    <img 
                      src={image}
                      alt={`Gallery preview ${index + 1}`}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all motion-safe"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Photo Guidelines */}
            <div className="bg-bg-2 p-8 rounded-lg border border-accent-purple/30">
              <h2 className="font-subhead text-2xl text-center mb-6 text-accent-gold">
                Photography Guidelines
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-subhead text-lg mb-4 text-accent-purple">During the Event</h3>
                  <ul className="font-body text-sm text-muted-foreground space-y-2">
                    <li>• Photography encouraged during designated times</li>
                    <li>• Respect others' privacy and consent</li>
                    <li>• No flash during performances</li>
                    <li>• Tag us on social media: #TwistedFairytalesBash</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-subhead text-lg mb-4 text-accent-purple">Share Your Photos</h3>
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
  );
};

export default Gallery;
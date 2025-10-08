import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, CheckCircle, Star } from "lucide-react";
import { Photo } from "@/lib/photo-api";
import { PhotoEditControls } from "./PhotoEditControls";

interface PhotoCardProps {
  photo: Photo;
  onLike: (photoId: string) => void;
  getPhotoUrl: (storagePath: string) => Promise<string>;
  showStatus?: boolean;
  showEditControls?: boolean;
  onUpdate?: (photoId: string, updates: any) => void;
  onDelete?: (photoId: string, storagePath: string) => void;
}

export const PhotoCard = ({ photo, onLike, getPhotoUrl, showStatus, showEditControls, onUpdate, onDelete }: PhotoCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUrl = async () => {
      try {
        const url = await getPhotoUrl(photo.storage_path);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading photo URL:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUrl();
  }, [photo.storage_path, getPhotoUrl]);

  const getStatusBadge = () => {
    if (!showStatus) return null;

    if (photo.is_featured) {
      return (
        <Badge className="absolute top-2 left-2 bg-accent-gold/90 text-background">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </Badge>
      );
    }

    if (photo.is_approved) {
      return (
        <Badge className="absolute top-2 left-2 bg-green-500/90 text-background">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }

    return (
      <Badge className="absolute top-2 left-2 bg-amber-500/90 text-background">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="group relative aspect-square bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-all">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
        </div>
      ) : (
        <>
          <img 
            src={imageUrl}
            alt={photo.caption || 'Gallery photo'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          
          {getStatusBadge()}

          {showEditControls && !photo.is_approved && onUpdate && onDelete && (
            <PhotoEditControls
              photo={photo}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          )}

          {/* Photo info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {photo.caption && (
              <p className="font-body text-xs text-ink mb-2 line-clamp-2">
                {photo.caption}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onLike(photo.id)}
                className="h-8 px-2 text-accent-gold hover:text-accent-gold hover:bg-accent-gold/10"
              >
                <Heart className="w-4 h-4 mr-1" />
                {photo.likes_count}
              </Button>
              
              {photo.category && (
                <Badge variant="outline" className="text-xs">
                  {photo.category}
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

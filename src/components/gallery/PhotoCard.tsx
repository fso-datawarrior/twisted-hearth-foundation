import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, CheckCircle, Star } from "lucide-react";
import { Photo } from "@/lib/photo-api";
import { PhotoEditControls } from "./PhotoEditControls";
import UserPhotoActions from "./UserPhotoActions";
import PhotoEmojiReactions from "./PhotoEmojiReactions";

interface PhotoCardProps {
  photo: Photo;
  onLike?: (photoId: string) => void;
  getPhotoUrl?: (storagePath: string) => Promise<string>;
  showStatus?: boolean;
  showEditControls?: boolean;
  showUserActions?: boolean;
  onUpdate?: (photoId: string, updates: any) => void;
  onDelete?: (photoId: string, storagePath: string) => void;
  onFavorite?: (photoId: string) => void;
  onEmojiReaction?: (photoId: string, emoji: string) => void;
}

export const PhotoCard = ({ 
  photo, 
  onLike, 
  getPhotoUrl, 
  showStatus, 
  showEditControls, 
  showUserActions,
  onUpdate, 
  onDelete,
  onFavorite,
  onEmojiReaction
}: PhotoCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUrl = async () => {
      try {
        // If getPhotoUrl is not provided, use storage_path directly (for static images)
        if (!getPhotoUrl) {
          setImageUrl(photo.storage_path);
        } else {
          // Otherwise, generate signed URL (for database images)
          const url = await getPhotoUrl(photo.storage_path);
          setImageUrl(url || null);
        }
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
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={photo.caption || 'Gallery photo'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              onError={() => setImageUrl(null)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-sm">Photo unavailable</span>
            </div>
          )}
          
          {getStatusBadge()}

          {/* Photo Edit Controls (only for unapproved photos) */}
          {showEditControls && !photo.is_approved && onUpdate && onDelete && (
            <div className="absolute top-2 right-2 z-20">
              <PhotoEditControls
                photo={photo}
                onUpdate={onUpdate}
                onDelete={(photoId) => onDelete(photoId, photo.storage_path)}
              />
            </div>
          )}

          {/* User Photo Actions (delete, favorite) */}
          {showUserActions && (onDelete || onFavorite) && (
            <div className="absolute top-2 right-2 z-20">
              <UserPhotoActions
                photo={photo}
                onDelete={onDelete ? (photoId) => onDelete(photoId, photo.storage_path) : undefined}
                onFavorite={onFavorite}
              />
            </div>
          )}

          {/* Photo info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {photo.caption && (
              <p className="font-body text-xs text-ink mb-2 line-clamp-2">
                {photo.caption}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {onLike && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLike(photo.id)}
                  className="h-8 px-2 text-accent-gold hover:text-accent-gold hover:bg-accent-gold/10"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {photo.likes_count}
                </Button>
              )}
              
              {photo.category && (
                <Badge variant="outline" className="text-xs">
                  {photo.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Emoji Reactions (shown for user's own photos) */}
          {showUserActions && onEmojiReaction && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-bg-1/95 border-t border-accent-purple/20">
              <PhotoEmojiReactions
                photoId={photo.id}
                onReaction={onEmojiReaction}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Clock, CheckCircle, Star, Pencil, Save, X } from "lucide-react";
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
  onCaptionUpdate?: (photoId: string, caption: string) => void;
  allowCaptionEdit?: boolean;
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
  onEmojiReaction,
  onCaptionUpdate,
  allowCaptionEdit
}: PhotoCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(photo.caption || '');
  const [charCount, setCharCount] = useState(photo.caption?.length || 0);

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

  const handleCaptionChange = (value: string) => {
    if (value.length <= 250) {
      setEditedCaption(value);
      setCharCount(value.length);
    }
  };

  const handleSaveCaption = () => {
    if (onCaptionUpdate) {
      onCaptionUpdate(photo.id, editedCaption.trim());
      setIsEditingCaption(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedCaption(photo.caption || '');
    setCharCount(photo.caption?.length || 0);
    setIsEditingCaption(false);
  };

  return (
    <>
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
          </>
        )}
      </div>

      {/* Emoji Reactions - Horizontal Layout Below Photo */}
      {showUserActions && onEmojiReaction && (
        <div className="mt-2 p-2 bg-bg-2/50 rounded border-t border-b border-accent-gold/30">
          <PhotoEmojiReactions
            photoId={photo.id}
            onReaction={onEmojiReaction}
          />
        </div>
      )}

      {/* Caption Display/Edit Below Card - Fixed Height */}
      <div className="mt-2 p-3 bg-bg-2/50 rounded-lg border-2 border-accent-gold/60 min-h-[120px] flex flex-col">
        {allowCaptionEdit && onCaptionUpdate ? (
          isEditingCaption ? (
            // Edit Mode
            <div className="flex flex-col flex-1">
              <Textarea
                value={editedCaption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                placeholder="Add a caption to your photo..."
                maxLength={250}
                rows={4}
                className="flex-1 bg-bg-1 border-accent-purple/50 text-spooky-gold placeholder:text-accent-gold/50 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-accent-gold/70">{charCount}/250</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-7 px-2 text-xs border-accent-purple/50 text-accent-gold hover:bg-accent-purple/20"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveCaption}
                    className="h-7 px-2 text-xs bg-accent-gold text-ink hover:bg-accent-gold/80"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="flex flex-col flex-1 items-center justify-center">
              <p className="text-spooky-gold text-sm text-center leading-relaxed break-words w-full flex-1 flex items-center justify-center">
                {photo.caption || 'No caption yet'}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingCaption(true)}
                className="mt-2 h-7 px-2 text-xs text-accent-gold hover:bg-accent-gold/10"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit Caption
              </Button>
            </div>
          )
        ) : (
          // Display Only Mode (no editing allowed)
          <div className="flex items-center justify-center flex-1">
            <p className="text-spooky-gold text-sm text-center leading-relaxed break-words w-full">
              {photo.caption || ''}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

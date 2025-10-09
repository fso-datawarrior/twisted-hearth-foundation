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
  onImageClick?: (photo: Photo) => void;
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
  allowCaptionEdit,
  onImageClick
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
    <div className="flex flex-col gap-2 w-full">
      {/* Photo Container */}
      <div 
        className={`group relative aspect-[16/9] bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-all ${onImageClick ? 'cursor-pointer' : ''}`}
        onClick={() => onImageClick?.(photo)}
      >
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
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                loading="lazy"
                onError={() => setImageUrl(null)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-xs md:text-sm">Photo unavailable</span>
              </div>
            )}
            
            {getStatusBadge()}

            {/* Photo Edit Controls (only for unapproved photos) - Keep absolute positioned */}
            {showEditControls && !photo.is_approved && onUpdate && onDelete && (
              <div className="absolute top-2 right-2 z-20">
                <PhotoEditControls
                  photo={photo}
                  onUpdate={onUpdate}
                  onDelete={(photoId) => onDelete(photoId, photo.storage_path)}
                />
              </div>
            )}

            {/* Photo info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.caption && (
                <p className="font-body text-[10px] md:text-xs text-ink mb-1 md:mb-2 line-clamp-2">
                  {photo.caption}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                {onLike && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLike(photo.id)}
                    className="h-6 md:h-8 px-1 md:px-2 text-[10px] md:text-xs text-accent-gold hover:text-accent-gold hover:bg-accent-gold/10"
                  >
                    <Heart className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                    {photo.likes_count}
                  </Button>
                )}
                
                {photo.category && (
                  <Badge variant="outline" className="text-[10px] md:text-xs">
                    {photo.category}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Actions Row - Below Photo */}
      {showUserActions && (onDelete || onFavorite) && (
        <div className="flex justify-center">
          <UserPhotoActions
            photo={photo}
            onDelete={onDelete ? (photoId) => onDelete(photoId, photo.storage_path) : undefined}
            onFavorite={onFavorite}
          />
        </div>
      )}

      {/* Emoji Reactions - Below User Actions */}
      {showUserActions && onEmojiReaction && (
        <PhotoEmojiReactions
          photoId={photo.id}
          onReaction={onEmojiReaction}
        />
      )}

      {/* Caption Display/Edit - Fixed Height with Responsive Sizing */}
      <div className="p-2 md:p-3 bg-bg-2/50 rounded-lg border md:border-2 border-accent-gold/60 min-h-[160px] md:min-h-[140px] flex flex-col">
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
                className="flex-1 bg-bg-1 border-accent-purple/50 text-spooky-gold text-xs md:text-sm placeholder:text-accent-gold/50 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] md:text-xs text-accent-gold/70">{charCount}/250</p>
                <div className="flex gap-1 md:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-6 md:h-7 px-1.5 md:px-2 text-[10px] md:text-xs border-accent-purple/50 text-accent-gold hover:bg-accent-purple/20"
                  >
                    <X className="w-3 h-3 mr-0.5 md:mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveCaption}
                    className="h-6 md:h-7 px-1.5 md:px-2 text-[10px] md:text-xs bg-accent-gold text-ink hover:bg-accent-gold/80"
                  >
                    <Save className="w-3 h-3 mr-0.5 md:mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="flex flex-col flex-1 items-center justify-center">
              <p className="text-spooky-gold text-xs md:text-sm text-center leading-snug md:leading-relaxed break-words w-full flex-1 flex items-center justify-center px-1">
                {photo.caption || 'No caption yet'}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingCaption(true)}
                className="mt-2 h-6 md:h-7 px-1.5 md:px-2 text-[10px] md:text-xs text-accent-gold hover:bg-accent-gold/10"
              >
                <Pencil className="w-3 h-3 mr-0.5 md:mr-1" />
                Edit Caption
              </Button>
            </div>
          )
        ) : (
          // Display Only Mode (no editing allowed)
          <div className="flex items-center justify-center flex-1">
            <p className="text-spooky-gold text-xs md:text-sm text-center leading-snug md:leading-relaxed break-words w-full px-1">
              {photo.caption || ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

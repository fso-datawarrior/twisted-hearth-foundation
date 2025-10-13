import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Star } from 'lucide-react';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Photo } from '@/lib/photo-api';

interface UserPhotoActionsProps {
  photo: Photo;
  onDelete?: (photoId: string) => void;
  onFavorite?: (photoId: string) => void;
}

const UserPhotoActions: React.FC<UserPhotoActionsProps> = ({
  photo,
  onDelete,
  onFavorite,
}) => {
  const { trackInteraction } = useAnalytics();

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(photo.id);
      trackInteraction('photo', photo.id, 'favorite', photo.is_favorite ? 'remove' : 'add');
    }
  };

  return (
    <div className="flex gap-2">
      {/* Favorite Button */}
      {onFavorite && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavorite}
          className={`h-8 px-2 ${
            photo.is_favorite
              ? 'text-accent-gold hover:text-accent-gold/80'
              : 'text-muted-foreground hover:text-accent-gold'
          }`}
          title={photo.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`w-4 h-4 ${photo.is_favorite ? 'fill-current' : ''}`}
          />
        </Button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive hover:text-destructive/80"
              title="Delete photo"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-bg-1 border-accent-purple/30">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Photo</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this photo? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-accent-purple/30">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(photo.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default UserPhotoActions;

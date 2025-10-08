import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface PhotoEmojiReactionsProps {
  photoId: string;
  onReaction?: (photoId: string, emoji: string) => void;
}

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

const AVAILABLE_EMOJIS = ['🎃', '🕯️', '🩸', '🕷️', '👻', '💀', '❤️'];

const PhotoEmojiReactions: React.FC<PhotoEmojiReactionsProps> = ({ photoId, onReaction }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadReactions();
  }, [photoId, user]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('photo_emoji_reactions')
      .select('emoji, user_id')
      .eq('photo_id', photoId);

    if (error || !data) return;

    // Count reactions and check if user has reacted
    const reactionCounts = AVAILABLE_EMOJIS.map(emoji => {
      const emojiReactions = data.filter(r => r.emoji === emoji);
      return {
        emoji,
        count: emojiReactions.length,
        userReacted: user ? emojiReactions.some(r => r.user_id === user.id) : false
      };
    }).filter(r => r.count > 0 || r.userReacted);

    setReactions(reactionCounts);
  };

  const handleReaction = async (emoji: string) => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      if (onReaction) {
        await onReaction(photoId, emoji);
      }
      await loadReactions();
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {AVAILABLE_EMOJIS.map(emoji => {
        const reaction = reactions.find(r => r.emoji === emoji);
        const count = reaction?.count || 0;
        const userReacted = reaction?.userReacted || false;
        
        return (
          <Button
            key={emoji}
            variant={userReacted ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleReaction(emoji)}
            disabled={isLoading}
            className={`h-8 px-2 text-sm border-accent-purple/20 hover:border-accent-gold/50 ${
              userReacted 
                ? 'bg-accent-purple/20 text-accent-gold border-accent-purple/40' 
                : 'hover:bg-accent-gold/10'
            }`}
          >
            <span className="mr-1">{emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default PhotoEmojiReactions;

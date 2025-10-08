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

const AVAILABLE_EMOJIS = ['🎃', '🕯️', '🕷️', '👻', '💀'];

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
    <div className="flex flex-row flex-wrap md:flex-nowrap items-center justify-center gap-1.5 md:gap-2 py-1.5 md:py-2">
      {AVAILABLE_EMOJIS.map(emoji => {
        const reaction = reactions.find(r => r.emoji === emoji);
        const count = reaction?.count || 0;
        const userReacted = reaction?.userReacted || false;
        
        return (
          <Button
            key={emoji}
            variant={userReacted ? "default" : "outline"}
            size="sm"
            onClick={() => handleReaction(emoji)}
            disabled={isLoading}
            className={`px-2 py-1 h-7 md:h-8 min-w-[40px] md:min-w-[45px] ${
              userReacted 
                ? "bg-accent-gold text-ink hover:bg-accent-gold/80" 
                : "border-accent-purple/50 hover:bg-accent-purple/20"
            }`}
          >
            <span className="text-sm md:text-base">{emoji}</span>
            {count > 0 && <span className="ml-1 text-[10px] md:text-xs">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default PhotoEmojiReactions;

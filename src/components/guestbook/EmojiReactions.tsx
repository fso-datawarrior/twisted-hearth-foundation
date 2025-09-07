import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface EmojiReactionsProps {
  postId: string;
}

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

const AVAILABLE_EMOJIS = ['🎃', '🕯️', '🩸', '🕷️', '👻', '💀', '❤️'];

const EmojiReactions: React.FC<EmojiReactionsProps> = ({ postId }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadReactions();
  }, [postId, user]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('guestbook_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);

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
      const existingReaction = reactions.find(r => r.emoji === emoji && r.userReacted);
      
      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('guestbook_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
        
        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('guestbook_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            emoji
          });
        
        if (error) throw error;
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
                ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/40' 
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

export default EmojiReactions;
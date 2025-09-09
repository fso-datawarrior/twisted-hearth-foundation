import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle } from 'lucide-react';

interface MessageComposerProps {
  onMessagePosted?: () => void;
  isReply?: boolean;
  postId?: string;
  onCancel?: () => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onMessagePosted, 
  isReply = false, 
  postId, 
  onCancel 
}) => {
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user?.email && !displayName) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user, displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    if (message.length > 2000) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 2000 characters.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isReply && postId) {
        // Insert reply
        const { error } = await supabase
          .from('guestbook_replies')
          .insert({
            post_id: postId,
            user_id: user.id,
            display_name: isAnonymous ? 'Anonymous' : displayName.trim(),
            message: message.trim(),
            is_anonymous: isAnonymous
          });

        if (error) throw error;
        toast({ title: "Reply posted!" });
      } else {
        // Insert main post using RPC
        const { error } = await supabase.rpc('guestbook_insert_message', {
          p_display_name: isAnonymous ? 'Anonymous' : displayName.trim(),
          p_message: message.trim(),
          p_is_anonymous: isAnonymous
        });

        if (error) throw error;
        toast({ title: "Message posted!", description: "Your note has been added to the guestbook." });
      }

      // Reset form
      setMessage('');
      if (!isAnonymous) setDisplayName(user.email?.split('@')[0] || '');
      setIsAnonymous(false);
      
      onMessagePosted?.();
      if (isReply) onCancel?.();
    } catch (error) {
      toast({ 
        title: "Failed to post", 
        description: "Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm p-6 rounded-lg border border-accent-purple/30">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-accent-gold" />
        <h3 className="font-subhead text-lg text-accent-gold">
          {isReply ? 'Reply to Message' : 'Share Your Twisted Tale'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="font-body text-sm">
            Display Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should others know you?"
            disabled={isAnonymous}
            className="bg-bg-2 border-accent-purple/20 focus:border-accent-gold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="font-body text-sm">
            Your Message
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts, theories, or twisted tales..."
            className="min-h-[100px] bg-bg-2 border-accent-purple/20 focus:border-accent-gold resize-none"
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground text-right">
            {message.length}/2000 characters
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <Label htmlFor="anonymous" className="font-body text-sm cursor-pointer">
            Post anonymously (hosts can still see who posted)
          </Label>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead px-6"
          >
            {isLoading ? 'Posting...' : isReply ? 'Post Reply' : 'Post Message'}
          </Button>
          {isReply && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-accent-purple/30 hover:bg-accent-purple/10"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageComposer;
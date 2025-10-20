import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Edit, Trash2, Flag, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EmojiReactions from './EmojiReactions';
import MessageComposer from './MessageComposer';
import { formatDistanceToNow } from 'date-fns';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { UserProfileCard } from '@/components/UserProfileCard';
import { getDisplayName } from '@/lib/display-name-utils';
import type { Profile } from '@/lib/profile-api';

interface GuestbookPostProps {
  post: {
    id: string;
    user_id: string;
    display_name: string;
    message: string;
    is_anonymous: boolean;
    created_at: string;
    updated_at?: string;
  };
  authorProfile?: Profile;
  onUpdate?: () => void;
}

interface Reply {
  id: string;
  user_id: string;
  display_name: string;
  message: string;
  is_anonymous: boolean;
  created_at: string;
}

const GuestbookPost: React.FC<GuestbookPostProps> = ({ post, authorProfile, onUpdate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(post.message);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [authorRsvp, setAuthorRsvp] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackInteraction } = useAnalytics();

  const isOwner = user?.id === post.user_id;
  const displayNameToShow = post.is_anonymous 
    ? 'Anonymous Guest' 
    : getDisplayName(authorProfile, authorRsvp);

  useEffect(() => {
    loadReplies();
    // Track guestbook post view
    trackInteraction('guestbook', post.id, 'view');
    
    // Fetch author's RSVP for display name
    if (post.user_id && !post.is_anonymous) {
      supabase
        .from('rsvps')
        .select('first_name, last_name, display_name, name')
        .eq('user_id', post.user_id)
        .maybeSingle()
        .then(({ data }) => setAuthorRsvp(data));
    }
  }, [post.id, post.user_id, post.is_anonymous, trackInteraction]);

  const loadReplies = async () => {
    const { data, error } = await supabase
      .from('guestbook_replies')
      .select('id, post_id, user_id, display_name, message, is_anonymous, created_at')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setReplies(data);
    }
  };

  const handleEdit = async () => {
    if (!editMessage.trim() || editMessage === post.message) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('guestbook')
        .update({ 
          message: editMessage.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      toast({ title: "Message updated!" });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      toast({ title: "Failed to update message", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('guestbook')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', post.id);

      if (error) throw error;

      toast({ title: "Message deleted" });
      onUpdate?.();
    } catch (error) {
      toast({ title: "Failed to delete message", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Please describe why you are reporting this message (optional):');
    if (reason === null) return; // User cancelled

    try {
      const { error } = await supabase
        .from('guestbook_reports')
        .insert([{
          post_id: post.id,
          user_id: user?.id,
          reason: reason?.trim() || 'No reason provided'
        }]);

      if (error) throw error;
      toast({ title: "Message reported", description: "Thank you for helping keep our community safe." });
    } catch (error) {
      toast({ title: "Failed to report message", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="bg-black/90 backdrop-blur-sm p-2 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors">
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="flex items-start gap-3 flex-1">
            {/* Avatar */}
            <button
              onClick={() => !post.is_anonymous && setShowProfileCard(true)}
              className={`flex-shrink-0 ${!post.is_anonymous ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
              disabled={post.is_anonymous}
            >
              <Avatar className="h-10 w-10 border-2 border-accent-purple/30 hover:border-accent-gold transition-colors">
                <AvatarImage 
                  src={authorProfile?.avatar_url || undefined} 
                  alt={displayNameToShow} 
                />
                <AvatarFallback className="bg-accent-purple/20 text-accent-gold">
                  {displayNameToShow.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => !post.is_anonymous && setShowProfileCard(true)}
                  className={`font-subhead text-base text-accent-gold ${!post.is_anonymous ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
                  disabled={post.is_anonymous}
                >
                  {displayNameToShow}
                </button>
                <span className="text-muted-foreground">•</span>
                <p className="font-body text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  {post.updated_at && post.updated_at !== post.created_at && ' (edited)'}
                </p>
              </div>
            </div>
          </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete} 
                    className="flex items-center gap-2 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {!isOwner && (
                <DropdownMenuItem 
                  onClick={handleReport}
                  className="flex items-center gap-2"
                >
                  <Flag className="h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mb-3 ml-14">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              className="w-full p-3 bg-bg-2 border border-accent-purple/20 rounded-md font-body text-muted-foreground resize-none focus:outline-none focus:border-accent-gold"
              rows={4}
              maxLength={2000}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleEdit} 
                disabled={isLoading}
                size="sm"
                className="bg-accent-red hover:bg-accent-red/80"
              >
                Save
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setEditMessage(post.message);
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="font-body text-muted-foreground whitespace-pre-wrap">
            "{post.message}"
          </p>
        )}
      </div>

      <div className="space-y-3 ml-14">
        <EmojiReactions postId={post.id} />
        
        <div className="flex gap-2 text-sm">
          {user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-accent-gold hover:bg-accent-gold/10"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Reply
              </Button>
              {replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-muted-foreground hover:text-accent-gold"
                >
                  {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </>
          )}
        </div>

        {showReplyForm && (
          <MessageComposer
            isReply
            postId={post.id}
            onCancel={() => setShowReplyForm(false)}
            onMessagePosted={() => {
              setShowReplyForm(false);
              loadReplies();
            }}
          />
        )}

        {showReplies && replies.length > 0 && (
          <div className="ml-11 space-y-2 border-l border-accent-purple/20 pl-4">
            {replies.map((reply) => (
              <div key={reply.id} className="bg-bg-2 p-2 rounded-lg">
                <div className="flex items-center gap-2 text-xs mb-2">
                  <h4 className="font-subhead text-sm text-accent-gold">
                    {reply.is_anonymous ? 'Anonymous Guest' : reply.display_name}
                  </h4>
                  <span className="text-muted-foreground">•</span>
                  <p className="font-body text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="font-body text-sm text-muted-foreground whitespace-pre-wrap">
                  {reply.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    
    {/* Profile Card Dialog */}
    {!post.is_anonymous && post.user_id && (
      <UserProfileCard
        userId={post.user_id}
        isOpen={showProfileCard}
        onClose={() => setShowProfileCard(false)}
      />
    )}
  </>
  );
};

export default GuestbookPost;
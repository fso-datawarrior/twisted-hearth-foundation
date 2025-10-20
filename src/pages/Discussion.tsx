import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
// import CSSFogBackground from "@/components/CSSFogBackground";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MessageComposer from "@/components/guestbook/MessageComposer";
import GuestbookPost from "@/components/guestbook/GuestbookPost";
import { AuthModal } from "@/components/AuthModal";
import { LoaderIcon } from "lucide-react";
import type { Profile } from "@/lib/profile-api";

const Discussion = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  const PAGE_SIZE = 25;

  useEffect(() => {
    loadPosts();
  }, [user]);

  useEffect(() => {
    // Set up realtime subscription for new posts
    const channel = supabase
      .channel('guestbook-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guestbook'
        },
        (payload) => {
          const newPost = payload.new;
          setPosts(prevPosts => [newPost, ...prevPosts]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'guestbook'
        },
        (payload) => {
          const updatedPost = payload.new;
          if (updatedPost.deleted_at) {
            // Remove deleted post
            setPosts(prevPosts => prevPosts.filter(post => post.id !== updatedPost.id));
          } else {
            // Update existing post
            setPosts(prevPosts =>
              prevPosts.map(post =>
                post.id === updatedPost.id ? updatedPost : post
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-heading text-2xl mb-4">Loading...</div>
          <div className="font-body text-muted-foreground">Checking authentication status</div>
        </div>
      </div>
    );
  }

  const loadPosts = async (reset = true) => {
    setIsLoading(reset);
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('id, user_id, display_name, message, is_anonymous, created_at, updated_at, deleted_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(reset ? 0 : posts.length, reset ? PAGE_SIZE - 1 : posts.length + PAGE_SIZE - 1);
      
      if (error) throw error;
      
      if (data) {
        // Extract unique user IDs from posts
        const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))] as string[];
        
        // Batch fetch profiles for all users
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);
          
          // Update profiles map
          if (profilesData) {
            setProfiles(prev => {
              const newMap = new Map(prev);
              profilesData.forEach(p => newMap.set(p.id, p));
              return newMap;
            });
          }
        }
        
        if (reset) {
          setPosts(data);
        } else {
          setPosts(prev => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await loadPosts(false);
  };

  const handleMessagePosted = () => {
    loadPosts(true);
  };
  return (
    <div className="min-h-screen bg-background relative">
      <main className="pt-28 sm:pt-32 md:pt-36 relative z-10">
        {/* <CSSFogBackground /> */}
        <section className="py-8 px-3">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-heading text-4xl md:text-6xl text-shadow-gothic">
                The Dark Guestbook
              </h1>
            </div>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Share your thoughts, theories, and twisted tales. What darkness will you bring 
              to this year's celebration? Join the conversation...
            </p>

            {/* Authentication Check */}
            {!user ? (
              <div className="text-center mb-12">
                <div className="bg-card p-2 sm:p-3 md:p-4 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                  <div className="font-heading text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 text-accent-gold">📖</div>
                  <h2 className="font-subhead text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-accent-red tracking-tight text-balance">
                    Sign In to Share Your Tale
                  </h2>
                  <p className="font-body text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Ready to add your voice to the guestbook? Sign in to share your twisted tales, 
                    theories, and connect with fellow adventurers.
                  </p>
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base"
                  >
                    Sign In to Post
                  </Button>
                </div>
              </div>
            ) : (
              /* Message Composer for authenticated users */
              <div className="mb-12">
                <MessageComposer onMessagePosted={handleMessagePosted} />
              </div>
            )}

            {/* Guestbook Feed */}
            <div className="space-y-3">
              {isLoading && posts.length === 0 ? (
                <div className="text-center py-12">
                  <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-accent-gold" />
                  <p className="font-body text-muted-foreground">Loading messages...</p>
                </div>
              ) : posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <GuestbookPost
                      key={post.id}
                      post={post}
                      authorProfile={profiles.get(post.user_id)}
                      onUpdate={() => loadPosts(true)}
                    />
                  ))}
                  
                  {hasMore && (
                    <div className="text-center py-6">
                      <Button
                        onClick={loadMorePosts}
                        disabled={loadingMore}
                        variant="outline"
                        className="border-accent-purple/30 hover:bg-accent-purple/10"
                      >
                        {loadingMore ? (
                          <>
                            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </>
                        ) : (
                          'Load More Messages'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="font-heading text-6xl mb-4 text-accent-gold opacity-50">👻</div>
                  <h3 className="font-subhead text-xl mb-2 text-muted-foreground">
                    No messages yet...
                  </h3>
                  <p className="font-body text-muted-foreground">
                    {user 
                      ? "Be the first to write in the Dark Guestbook."
                      : "Sign in to see and share twisted tales."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
};

export default Discussion;
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CollapsibleSection from '@/components/admin/CollapsibleSection';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import RequireAdmin from '@/components/RequireAdmin';
import RSVPManagement from '@/components/admin/RSVPManagement';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
const LazyAnalyticsWidgets = lazy(() => import('@/components/admin/AnalyticsWidgets'));
import { Skeleton } from '@/components/ui/skeleton';
import { useSwipe } from '@/hooks/use-swipe';
import { useIsMobile } from '@/hooks/use-mobile';
import TournamentManagement from '@/components/admin/TournamentManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';
import GuestbookManagement from '@/components/admin/GuestbookManagement';
import { EmailCommunication } from '@/components/admin/EmailCommunication';
import VignetteManagementTab from '@/components/admin/VignetteManagementTab';
import HomepageVignettesManagement from '@/components/admin/HomepageVignettesManagement';
import { LibationsManagement } from '@/components/admin/LibationsManagement';
import AdminRoleManagement from '@/components/admin/AdminRoleManagement';
import UserManagement from '@/components/admin/UserManagement';
import DatabaseResetPanel from '@/components/admin/DatabaseResetPanel';
import { OnHoldOverlay } from '@/components/admin/OnHoldOverlay';
import { AdminFooter } from '@/components/admin/AdminFooter';
import { getTournamentRegistrationsAdmin } from '@/lib/tournament-api';
import { getAllVignettes } from '@/lib/vignette-api';
import { getAllLibations } from '@/lib/libations-api';
import { 
  Users, 
  Trophy, 
  Images, 
  Calendar,
  Settings,
  Theater,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import SupportReportManagement from '@/components/admin/SupportReportManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);

  // Tab order for swipe navigation (grouped by category)
  const tabGroups = {
    content: ['gallery', 'vignettes', 'homepage', 'guestbook', 'libations'],
    users: ['rsvps', 'tournament', 'user-management', 'admin-roles'],
    settings: ['email', 'support-reports', 'database-reset'],
  };

  const getCurrentGroup = (tab: string): string[] | null => {
    for (const [_, tabs] of Object.entries(tabGroups)) {
      if (tabs.includes(tab)) return tabs;
    }
    return null;
  };

  const handleTabChange = (newTab: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTransitioning(false);
    }, 200);
  };

  // Swipe gesture handlers for mobile
  const handleSwipeLeft = () => {
    if (!isMobile || activeTab === 'overview') return;
    const group = getCurrentGroup(activeTab);
    if (!group) return;
    
    const currentIndex = group.indexOf(activeTab);
    if (currentIndex < group.length - 1) {
      handleTabChange(group[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    if (!isMobile || activeTab === 'overview') return;
    const group = getCurrentGroup(activeTab);
    if (!group) return;
    
    const currentIndex = group.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(group[currentIndex - 1]);
    }
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  useEffect(() => {
    if (!contentRef.current || !isMobile) return;
    
    const element = contentRef.current;
    element.addEventListener('touchstart', swipeHandlers.onTouchStart as any);
    element.addEventListener('touchmove', swipeHandlers.onTouchMove as any);
    element.addEventListener('touchend', swipeHandlers.onTouchEnd as any);
    
    return () => {
      element.removeEventListener('touchstart', swipeHandlers.onTouchStart as any);
      element.removeEventListener('touchmove', swipeHandlers.onTouchMove as any);
      element.removeEventListener('touchend', swipeHandlers.onTouchEnd as any);
    };
  }, [isMobile, swipeHandlers]);

  // RSVPs query - include all tracking fields
  const { data: rsvps, isLoading: rsvpsLoading } = useQuery({
    queryKey: ['admin-rsvps'],
    queryFn: async () => {
      console.log('🔍 AdminDashboard: Fetching RSVPs...');
      
      // First check admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('check_admin_status');
      console.log('🔐 AdminDashboard: Admin check result:', adminCheck, 'Error:', adminError);
      
      // Test: Try to count all RSVPs without RLS (using service role would be better, but this is a quick test)
      const { count: totalRsvps, error: countError } = await supabase
        .from('rsvps')
        .select('*', { count: 'exact', head: true });
      console.log('📈 AdminDashboard: Total RSVPs in database:', totalRsvps, 'Count error:', countError);
      
      const { data, error } = await supabase
        .from('rsvps' as any)
        .select(`
          id, user_id, name, email, status, num_guests, 
          dietary_restrictions, additional_guests, is_approved, 
          email_sent_at, created_at, updated_at
        `)
        .order('created_at', { ascending: false });
      
      console.log('📊 AdminDashboard: RSVPs query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('❌ AdminDashboard: RSVPs query error:', error);
        throw error;
      }
      return data as any;
    }
  });

  // Tournament registrations query using admin API
  const { data: tournamentRegs, isLoading: tournamentLoading } = useQuery({
    queryKey: ['admin-tournament'],
    queryFn: async () => {
      const { data, error } = await getTournamentRegistrationsAdmin();
      
      if (error) throw error;
      return data;
    }
  });

  // Gallery photos query - include signed URLs
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['admin-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos' as any)
        .select(`
          id, user_id, filename, storage_path, caption, category, 
          is_approved, is_featured, tags, created_at, updated_at, likes_count
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Generate signed URLs for each photo
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo: any) => {
          try {
            const { data: urlData } = await supabase.storage
              .from('gallery')
              .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry
            
            return {
              ...photo,
              signedUrl: urlData?.signedUrl || ''
            };
          } catch (error) {
            console.error('Error generating signed URL for photo:', photo.id, error);
            return {
              ...photo,
              signedUrl: ''
            };
          }
        })
      );
      
      return photosWithUrls;
    }
  });

  // Vignettes statistics
  const { data: vignettes, isLoading: vignettesLoading } = useQuery({
    queryKey: ['admin-vignettes'],
    queryFn: getAllVignettes,
    select: (data) => data.data || []
  });

  // Libations query
  const { data: libations, isLoading: libationsLoading } = useQuery({
    queryKey: ['admin-libations'],
    queryFn: getAllLibations,
  });

  // Count vignette-selected photos
  const { data: vignettePhotosCount } = useQuery({
    queryKey: ['vignette-photos-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('id')
        .contains('tags', ['vignette-selected'])
        .eq('is_approved', true);
      
      if (error) throw error;
      return data?.length || 0;
    }
  });

  const totalGuests = rsvps?.reduce((sum, rsvp) => sum + rsvp.num_guests, 0) || 0;
  const pendingPhotos = photos?.filter(p => !p.is_approved).length || 0;
  const confirmedRsvps = rsvps?.filter(r => r.status === 'confirmed').length || 0;
  const activeVignettes = vignettes?.filter(v => v.is_active).length || 0;
  const totalVignettes = vignettes?.length || 0;
  const selectedVignettePhotos = vignettePhotosCount || 0;
  const activeLibations = libations?.filter(l => l.is_active).length || 0;

  // Support reports count
  const { data: supportReportsCount } = useQuery({
    queryKey: ['support-reports-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('support_reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open');
      
      if (error) throw error;
      return count || 0;
    }
  });

   return (
     <RequireAdmin>
       <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
         <div className="max-w-7xl mx-auto">
           <div className="mb-6 sm:mb-8 mt-28 sm:mt-32 md:mt-36">
             <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">Admin Control Tower</h1>
             <p className="text-sm sm:text-base text-muted-foreground">Manage the Twisted Hearth Foundation event</p>
           </div>
          
          {/* Consolidated Navigation */}
           <AdminNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={{
              rsvps: rsvps?.length,
              tournamentRegs: tournamentRegs?.length,
              photos: photos?.length,
              selectedVignettePhotos,
              activeLibations,
              supportReports: supportReportsCount,
            }}
          />

          {/* Breadcrumb Navigation (Mobile Only) */}
          <AdminBreadcrumb activeTab={activeTab} onNavigate={handleTabChange} />

          {/* Content Area with Swipe Support */}
          <div ref={contentRef} className="mt-0">
            {isTransitioning ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
               </div>
             ) : activeTab === 'overview' ? (
               <div className="space-y-4 sm:space-y-6">
                 <h2 className="text-xl sm:text-2xl font-bold text-accent-gold">OVERVIEW</h2>
                 
                 {/* Stats Overview */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" />
                        <span className="truncate">Total RSVPs</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">{confirmedRsvps}</div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{totalGuests} total guests expected</p>
                    </CardContent>
                  </Card>
                
                  <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 relative">
                    <OnHoldOverlay />
                    <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                        <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-secondary flex-shrink-0" />
                        <span className="truncate">Tournament</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                      <div className="text-2xl sm:text-3xl font-bold text-secondary">{tournamentRegs?.length || 0}</div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">teams registered</p>
                    </CardContent>
                  </Card>
                
                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                    <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                        <Images className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-accent flex-shrink-0" />
                        <span className="truncate">Gallery</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                      <div className="text-2xl sm:text-3xl font-bold text-accent">{pendingPhotos}</div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">photos awaiting approval</p>
                    </CardContent>
                  </Card>
                
                  <Card className="bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 border-accent-gold/20">
                    <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                        <Theater className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-accent-gold flex-shrink-0" />
                        <span className="truncate">Vignettes</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                      <div className="text-2xl sm:text-3xl font-bold text-accent-gold">{selectedVignettePhotos}</div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">photos selected ({activeVignettes} active)</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions - Collapsible */}
                <CollapsibleSection 
                  title="Quick Actions" 
                  icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}
                  defaultOpen={true}
                >
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto min-h-[56px] sm:min-h-[64px] flex-col gap-2 p-3 sm:p-4"
                      onClick={() => handleTabChange('rsvps')}
                    >
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm text-center">Export RSVPs</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto min-h-[56px] sm:min-h-[64px] flex-col gap-2 p-3 sm:p-4 relative"
                      onClick={() => handleTabChange('tournament')}
                    >
                      <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        ON HOLD
                      </div>
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm text-center">Tournament Bracket</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto min-h-[56px] sm:min-h-[64px] flex-col gap-2 p-3 sm:p-4"
                      onClick={() => handleTabChange('gallery')}
                    >
                      <Images className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm text-center">Approve Photos</span>
                    </Button>
                  </div>
                 </CollapsibleSection>

                 {/* Analytics Widgets (lazy-loaded) */}
                 <Suspense fallback={<div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-48 w-full" /></div>}>
                   <LazyAnalyticsWidgets />
                 </Suspense>
               </div>
             ) : activeTab === 'rsvps' ? (
              <RSVPManagement rsvps={rsvps} isLoading={rsvpsLoading} />
            ) : activeTab === 'tournament' ? (
              <TournamentManagement tournaments={tournamentRegs} isLoading={tournamentLoading} />
            ) : activeTab === 'gallery' ? (
              <GalleryManagement photos={photos} isLoading={photosLoading} />
            ) : activeTab === 'vignettes' ? (
              <VignetteManagementTab />
            ) : activeTab === 'homepage' ? (
              <HomepageVignettesManagement />
            ) : activeTab === 'libations' ? (
              <LibationsManagement />
            ) : activeTab === 'guestbook' ? (
              <GuestbookManagement />
            ) : activeTab === 'email' ? (
              <EmailCommunication />
            ) : activeTab === 'support-reports' ? (
              <SupportReportManagement />
            ) : activeTab === 'admin-roles' ? (
              <AdminRoleManagement />
            ) : activeTab === 'user-management' ? (
              <UserManagement />
            ) : activeTab === 'database-reset' ? (
              <DatabaseResetPanel />
            ) : null}
          </div>
          
          {/* Admin Footer with Version */}
          <AdminFooter />
        </div>
      </div>
    </RequireAdmin>
  );
}
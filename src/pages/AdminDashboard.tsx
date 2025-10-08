import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import RequireAdmin from '@/components/RequireAdmin';
import RSVPManagement from '@/components/admin/RSVPManagement';
import TournamentManagement from '@/components/admin/TournamentManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';
import HuntManagement from '@/components/admin/HuntManagement';
import GuestbookManagement from '@/components/admin/GuestbookManagement';
import EmailCommunication from '@/components/admin/EmailCommunication';
import { getTournamentRegistrationsAdmin } from '@/lib/tournament-api';
import { 
  Users, 
  Trophy, 
  Images, 
  MessageSquare,
  Search,
  Calendar,
  Map,
  Settings,
  Mail
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // RSVPs query
  const { data: rsvps, isLoading: rsvpsLoading } = useQuery({
    queryKey: ['admin-rsvps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps' as any)
        .select(`
          rsvp_id, user_id, status, num_guests, costume_idea, dietary_restrictions, contributions, created_at, updated_at,
          users!inner(name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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

  // Gallery photos query - include new fields
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['admin-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos' as any)
        .select(`
          id, user_id, filename, storage_path, caption, category, 
          is_approved, is_featured, is_preview, preview_category, 
          deleted_at, sort_order, created_at, likes_count
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any;
    }
  });

  // Hunt statistics
  const { data: huntStats, isLoading: huntLoading } = useQuery({
    queryKey: ['admin-hunt'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hunt_progress' as any)
        .select(`
          id, user_id, hunt_run_id, hint_id, found_at, points_earned, created_at,
          hunt_runs(user_id, status),
          hunt_hints(title, points)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any;
    }
  });

  const totalGuests = rsvps?.reduce((sum, rsvp) => sum + rsvp.num_guests, 0) || 0;
  const pendingPhotos = photos?.filter(p => !p.is_approved).length || 0;
  const confirmedRsvps = rsvps?.filter(r => r.status === 'confirmed').length || 0;
  const activeHuntRuns = huntStats?.length || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings, count: null },
    { id: 'rsvps', label: 'RSVPs', icon: Users, count: rsvps?.length },
    { id: 'tournament', label: 'Tournament', icon: Trophy, count: tournamentRegs?.length },
    { id: 'gallery', label: 'Gallery', icon: Images, count: photos?.length },
    { id: 'hunt', label: 'Hunt', icon: Search, count: activeHuntRuns },
    { id: 'guestbook', label: 'Guestbook', icon: MessageSquare, count: null },
    { id: 'email', label: 'Email', icon: Mail, count: null }
  ];

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 mt-24">
            <h1 className="text-4xl font-bold text-primary mb-2">Admin Control Tower</h1>
            <p className="text-muted-foreground">Manage the Twisted Hearth Foundation event</p>
          </div>
          
          {activeTab === 'overview' && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      Total RSVPs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{confirmedRsvps}</div>
                    <p className="text-xs text-muted-foreground">{totalGuests} total guests expected</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-secondary" />
                      Tournament
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary">{tournamentRegs?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">teams registered</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Images className="h-4 w-4 mr-2 text-accent" />
                      Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent">{pendingPhotos}</div>
                    <p className="text-xs text-muted-foreground">photos awaiting approval</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Search className="h-4 w-4 mr-2 text-green-600" />
                      Hunt Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{activeHuntRuns}</div>
                    <p className="text-xs text-muted-foreground">active participants</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col space-y-2"
                      onClick={() => setActiveTab('rsvps')}
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Export RSVPs</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col space-y-2"
                      onClick={() => setActiveTab('tournament')}
                    >
                      <Trophy className="h-6 w-6" />
                      <span className="text-sm">Tournament Bracket</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col space-y-2"
                      onClick={() => setActiveTab('gallery')}
                    >
                      <Images className="h-6 w-6" />
                      <span className="text-sm">Approve Photos</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col space-y-2"
                      onClick={() => setActiveTab('hunt')}
                    >
                      <Map className="h-6 w-6" />
                      <span className="text-sm">Hunt Stats</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== null && tab.count !== undefined && (
                    <Badge variant="secondary" className="ml-1">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Tab Content Placeholders */}
          <div className="bg-card rounded-lg border p-6">
            {activeTab === 'rsvps' && (
              <RSVPManagement rsvps={rsvps} isLoading={rsvpsLoading} />
            )}
            {activeTab === 'tournament' && (
              <TournamentManagement tournaments={tournamentRegs} isLoading={tournamentLoading} />
            )}
            {activeTab === 'gallery' && (
              <GalleryManagement photos={photos} isLoading={photosLoading} />
            )}
            {activeTab === 'hunt' && (
              <HuntManagement huntStats={huntStats} isLoading={huntLoading} />
            )}
            {activeTab === 'guestbook' && (
              <GuestbookManagement />
            )}
            {activeTab === 'email' && (
              <EmailCommunication />
            )}
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
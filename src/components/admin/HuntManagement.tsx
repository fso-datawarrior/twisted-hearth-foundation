import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Trophy, Users, Target } from 'lucide-react';
import { OnHoldOverlay } from '@/components/admin/OnHoldOverlay';

interface HuntProgress {
  id: string;
  user_id: string;
  hunt_run_id: string;
  hint_id: number;
  points_earned: number;
  found_at: string;
  hunt_runs?: {
    user_id: string;
    status: string;
  };
  hunt_hints?: {
    title: string;
    points: number;
  };
}

interface HuntManagementProps {
  huntStats: HuntProgress[];
  isLoading: boolean;
}

export default function HuntManagement({ huntStats, isLoading }: HuntManagementProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading hunt statistics...</div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const uniqueParticipants = new Set(huntStats?.map(stat => stat.user_id)).size || 0;
  const totalHintsFound = huntStats?.length || 0;
  const totalPointsEarned = huntStats?.reduce((sum, stat) => sum + stat.points_earned, 0) || 0;
  const activeRuns = huntStats?.filter(stat => stat.hunt_runs?.status === 'active').length || 0;

  // Group progress by user for leaderboard
  const userProgress = huntStats?.reduce((acc: Record<string, any>, stat) => {
    const userId = stat.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        hintsFound: 0,
        totalPoints: 0,
        status: stat.hunt_runs?.status || 'unknown'
      };
    }
    acc[userId].hintsFound += 1;
    acc[userId].totalPoints += stat.points_earned;
    return acc;
  }, {}) || {};

  const leaderboard = Object.values(userProgress).sort((a: any, b: any) => b.totalPoints - a.totalPoints);

  return (
    <div className="relative">
      <OnHoldOverlay />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Scavenger Hunt Management</h2>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{uniqueParticipants}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Search className="h-4 w-4 mr-2 text-green-600" />
              Hints Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalHintsFound}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-accent" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalPointsEarned}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-secondary" />
              Active Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{activeRuns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Hunt Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Hints Found</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((participant: any, index) => (
                  <TableRow key={participant.user_id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{participant.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>{participant.hintsFound}</TableCell>
                    <TableCell className="font-bold text-primary">{participant.totalPoints}</TableCell>
                    <TableCell>
                      <Badge variant={participant.status === 'active' ? 'default' : 'secondary'}>
                        {participant.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No hunt activity yet.</div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
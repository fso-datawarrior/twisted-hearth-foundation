import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar } from 'lucide-react';
import { TournamentRegistration } from '@/lib/tournament-api';
import { OnHoldOverlay } from '@/components/admin/OnHoldOverlay';

interface TournamentManagementProps {
  tournaments: TournamentRegistration[];
  isLoading: boolean;
}

export default function TournamentManagement({ tournaments, isLoading }: TournamentManagementProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading tournament registrations...</div>
        </div>
      </div>
    );
  }

  const stats = tournaments ? tournaments.reduce((acc, reg) => ({
    total: acc.total + 1,
    confirmed: acc.confirmed + (reg.status === 'confirmed' ? 1 : 0),
    pending: acc.pending + (reg.status === 'pending' ? 1 : 0),
  }), { total: 0, confirmed: 0, pending: 0 }) : { total: 0, confirmed: 0, pending: 0 };

  return (
    <div className="relative">
      <OnHoldOverlay />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Tournament Management</h2>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-primary" />
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-green-600" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-accent" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments?.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.tournament_name}</TableCell>
                    <TableCell>{tournament.team_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(tournament.status)}>
                        {tournament.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-32 truncate" title={tournament.contact_info || ''}>
                      {tournament.contact_info || '-'}
                    </TableCell>
                    <TableCell className="max-w-32 truncate" title={tournament.special_requirements || ''}>
                      {tournament.special_requirements || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tournament.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {tournaments?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No tournament registrations found.</div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
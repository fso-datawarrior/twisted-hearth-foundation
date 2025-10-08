import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Download, Check, X, Users, ArrowUpDown, Filter } from 'lucide-react';

interface RSVP {
  id: string;
  user_id: string;
  name: string;
  email: string;
  num_guests: number;
  dietary_restrictions: string | null;
  additional_guests: any[] | null;
  is_approved: boolean;
  status: string;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RSVPManagementProps {
  rsvps: RSVP[];
  isLoading: boolean;
}

export default function RSVPManagement({ rsvps, isLoading }: RSVPManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof RSVP>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRsvps, setSelectedRsvps] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update RSVP status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ rsvpId, status, isApproved }: { 
      rsvpId: string; 
      status: 'confirmed' | 'cancelled' | 'pending'; 
      isApproved?: boolean 
    }) => {
      const { data, error } = await supabase.rpc('admin_update_rsvp_status', {
        p_rsvp_id: rsvpId,
        p_status: status,
        p_is_approved: isApproved
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      toast({
        title: "RSVP Updated",
        description: "Status has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update RSVP: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Filtered and sorted RSVPs
  const filteredRsvps = useMemo(() => {
    if (!rsvps) return [];
    
    return rsvps
      .filter(rsvp => {
        const matchesSearch = !searchTerm || 
          rsvp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rsvp.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || rsvp.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
  }, [rsvps, searchTerm, statusFilter, sortField, sortDirection]);

  // Summary statistics
  const stats = useMemo(() => {
    if (!rsvps) return { 
      total: 0, confirmed: 0, pending: 0, cancelled: 0, totalGuests: 0, approved: 0
    };
    
    return rsvps.reduce((acc, rsvp) => ({
      total: acc.total + 1,
      confirmed: acc.confirmed + (rsvp.status === 'confirmed' ? 1 : 0),
      pending: acc.pending + (rsvp.status === 'pending' ? 1 : 0),
      cancelled: acc.cancelled + (rsvp.status === 'cancelled' ? 1 : 0),
      totalGuests: acc.totalGuests + (rsvp.status === 'confirmed' ? rsvp.num_guests : 0),
      approved: acc.approved + (rsvp.is_approved ? 1 : 0)
    }), { 
      total: 0, confirmed: 0, pending: 0, cancelled: 0, totalGuests: 0, approved: 0
    });
  }, [rsvps]);

  // CSV Export function
  const exportToCSV = () => {
    if (!filteredRsvps.length) {
      toast({
        title: "No Data",
        description: "No RSVPs to export.",
        variant: "destructive"
      });
      return;
    }
    
    const headers = [
      'Name', 'Email', 'Status', 'Guests', 'Dietary Restrictions', 
      'Additional Guests', 'Is Approved', 'Created Date'
    ];
    
    const csvData = filteredRsvps.map(rsvp => [
      rsvp.name,
      rsvp.email,
      rsvp.status,
      rsvp.num_guests,
      rsvp.dietary_restrictions || '',
      rsvp.additional_guests ? JSON.stringify(rsvp.additional_guests) : '',
      rsvp.is_approved ? 'Yes' : 'No',
      new Date(rsvp.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rsvps-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Exported ${filteredRsvps.length} RSVPs to CSV`
    });
  };

  const handleSort = (field: keyof RSVP) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRsvps(filteredRsvps.map(rsvp => rsvp.id));
    } else {
      setSelectedRsvps([]);
    }
  };

  const handleSelectRsvp = (rsvpId: string, checked: boolean) => {
    if (checked) {
      setSelectedRsvps(prev => [...prev, rsvpId]);
    } else {
      setSelectedRsvps(prev => prev.filter(id => id !== rsvpId));
    }
  };

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
          <div className="text-muted-foreground">Loading RSVPs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">RSVP Management</h2>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Total RSVPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">{stats.totalGuests} total guests</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Check className="h-4 w-4 mr-2 text-blue-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RSVPs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedRsvps.length === filteredRsvps.length && filteredRsvps.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Name
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('num_guests')}>
                    <div className="flex items-center gap-2">
                      Guests
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Dietary</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-2">
                      Created
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRsvps.includes(rsvp.id)}
                        onCheckedChange={(checked) => handleSelectRsvp(rsvp.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{rsvp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{rsvp.email}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(rsvp.status)}>
                        {rsvp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{rsvp.num_guests}</TableCell>
                    <TableCell className="max-w-32 truncate" title={rsvp.dietary_restrictions || ''}>
                      {rsvp.dietary_restrictions || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rsvp.is_approved ? 'default' : 'secondary'}>
                        {rsvp.is_approved ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rsvp.status !== 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({
                              rsvpId: rsvp.id,
                              status: 'confirmed',
                              isApproved: true
                            })}
                            disabled={updateStatusMutation.isPending}
                            className="h-8 px-2"
                            title="Confirm RSVP"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        {rsvp.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({
                              rsvpId: rsvp.id,
                              status: 'cancelled'
                            })}
                            disabled={updateStatusMutation.isPending}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            title="Cancel RSVP"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRsvps.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No RSVPs found matching your criteria.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

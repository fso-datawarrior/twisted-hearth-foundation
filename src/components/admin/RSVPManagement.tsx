import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Download, 
  Check, 
  X, 
  Users, 
  Calendar,
  ChefHat,
  Shirt,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Edit,
  UserCheck,
  UserX,
  MoreHorizontal,
  Plus
} from 'lucide-react';

interface RSVP {
  id: string;
  user_id: string;
  name: string;
  email: string;
  num_guests: number;
  costume_idea: string | null;
  dietary_restrictions: string | null;
  contributions: string | null;
  additional_guests: any[] | null;
  is_approved: boolean;
  status: string;
  attended: boolean;
  checked_in_at: string | null;
  rsvp_notes: string | null;
  payment_status: string;
  payment_amount: number | null;
  payment_date: string | null;
  special_requests: string | null;
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
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof RSVP>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRsvps, setSelectedRsvps] = useState<string[]>([]);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [currentRsvp, setCurrentRsvp] = useState<RSVP | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update RSVP status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ rsvpId, status }: { rsvpId: string; status: 'confirmed' | 'cancelled' }) => {
      const { data, error } = await supabase.rpc('admin_update_rsvp_status', {
        p_rsvp_id: rsvpId,
        p_status: status
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

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async ({ rsvpId, attended }: { rsvpId: string; attended: boolean }) => {
      const { data, error } = await supabase.rpc('admin_checkin_guest', {
        p_rsvp_id: rsvpId,
        p_attended: attended
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      toast({
        title: "Check-in Updated",
        description: "Guest check-in status has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update check-in: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ rsvpId, notes }: { rsvpId: string; notes: string }) => {
      const { data, error } = await supabase.rpc('admin_update_rsvp_notes', {
        p_rsvp_id: rsvpId,
        p_notes: notes
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      setNotesModalOpen(false);
      toast({
        title: "Notes Updated",
        description: "RSVP notes have been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update notes: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ rsvpId, status, amount, date }: { 
      rsvpId: string; 
      status: string; 
      amount?: number; 
      date?: string; 
    }) => {
      const { data, error } = await supabase.rpc('admin_update_payment_status', {
        p_rsvp_id: rsvpId,
        p_payment_status: status,
        p_payment_amount: amount || null,
        p_payment_date: date || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      setPaymentModalOpen(false);
      toast({
        title: "Payment Updated",
        description: "Payment status has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update payment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Bulk check-in mutation
  const bulkCheckinMutation = useMutation({
    mutationFn: async ({ rsvpIds, attended }: { rsvpIds: string[]; attended: boolean }) => {
      const { data, error } = await supabase.rpc('admin_bulk_checkin_guests', {
        p_rsvp_ids: rsvpIds,
        p_attended: attended
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      setSelectedRsvps([]);
      toast({
        title: "Bulk Check-in Complete",
        description: `${count} guests have been checked in.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to bulk check-in: ${error.message}`,
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
        const matchesAttendance = attendanceFilter === 'all' || 
          (attendanceFilter === 'attended' && rsvp.attended) ||
          (attendanceFilter === 'not_attended' && !rsvp.attended);
        const matchesPayment = paymentFilter === 'all' || rsvp.payment_status === paymentFilter;
        
        return matchesSearch && matchesStatus && matchesAttendance && matchesPayment;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
  }, [rsvps, searchTerm, statusFilter, attendanceFilter, paymentFilter, sortField, sortDirection]);

  // Summary statistics
  const stats = useMemo(() => {
    if (!rsvps) return { 
      total: 0, confirmed: 0, pending: 0, cancelled: 0, totalGuests: 0,
      attended: 0, checkedIn: 0, paid: 0, pendingPayment: 0
    };
    
    return rsvps.reduce((acc, rsvp) => ({
      total: acc.total + 1,
      confirmed: acc.confirmed + (rsvp.status === 'confirmed' ? 1 : 0),
      pending: acc.pending + (rsvp.status === 'pending' ? 1 : 0),
      cancelled: acc.cancelled + (rsvp.status === 'cancelled' ? 1 : 0),
      totalGuests: acc.totalGuests + (rsvp.status === 'confirmed' ? rsvp.num_guests : 0),
      attended: acc.attended + (rsvp.attended ? 1 : 0),
      checkedIn: acc.checkedIn + (rsvp.checked_in_at ? 1 : 0),
      paid: acc.paid + (rsvp.payment_status === 'paid' ? 1 : 0),
      pendingPayment: acc.pendingPayment + (rsvp.payment_status === 'pending' ? 1 : 0)
    }), { 
      total: 0, confirmed: 0, pending: 0, cancelled: 0, totalGuests: 0,
      attended: 0, checkedIn: 0, paid: 0, pendingPayment: 0
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
      'Name', 'Email', 'Status', 'Guests', 'Costume Idea', 'Dietary Restrictions', 
      'Contributions', 'Additional Guests', 'Attended', 'Checked In At', 
      'RSVP Notes', 'Payment Status', 'Payment Amount', 'Payment Date', 
      'Special Requests', 'Created Date'
    ];
    
    const csvData = filteredRsvps.map(rsvp => [
      rsvp.name,
      rsvp.email,
      rsvp.status,
      rsvp.num_guests,
      rsvp.costume_idea || '',
      rsvp.dietary_restrictions || '',
      rsvp.contributions || '',
      rsvp.additional_guests ? JSON.stringify(rsvp.additional_guests) : '',
      rsvp.attended ? 'Yes' : 'No',
      rsvp.checked_in_at ? new Date(rsvp.checked_in_at).toLocaleString() : '',
      rsvp.rsvp_notes || '',
      rsvp.payment_status,
      rsvp.payment_amount || '',
      rsvp.payment_date ? new Date(rsvp.payment_date).toLocaleDateString() : '',
      rsvp.special_requests || '',
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

  const openNotesModal = (rsvp: RSVP) => {
    setCurrentRsvp(rsvp);
    setNotes(rsvp.rsvp_notes || '');
    setNotesModalOpen(true);
  };

  const openPaymentModal = (rsvp: RSVP) => {
    setCurrentRsvp(rsvp);
    setPaymentStatus(rsvp.payment_status);
    setPaymentAmount(rsvp.payment_amount?.toString() || '');
    setPaymentDate(rsvp.payment_date ? new Date(rsvp.payment_date).toISOString().split('T')[0] : '');
    setPaymentModalOpen(true);
  };

  const openCheckinModal = (rsvp: RSVP) => {
    setCurrentRsvp(rsvp);
    setCheckinModalOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'refunded': return 'destructive';
      case 'waived': return 'outline';
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
          {selectedRsvps.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => bulkCheckinMutation.mutate({ 
                rsvpIds: selectedRsvps, 
                attended: true 
              })}
              disabled={bulkCheckinMutation.isPending}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Check In ({selectedRsvps.length})
            </Button>
          )}
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
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">{stats.attended} attended</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-yellow-600" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingPayment} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <UserCheck className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by attendance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Attendance</SelectItem>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="not_attended">Not Attended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <DollarSign className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="not_required">Not Required</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="waived">Waived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RSVP Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
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
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('num_guests')}>
                    <div className="flex items-center gap-2">
                      Guests
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Costume
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      Dietary
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Check-in
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Payment
                    </div>
                  </TableHead>
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
                    <TableCell className="max-w-32 truncate" title={rsvp.costume_idea || ''}>
                      {rsvp.costume_idea || '-'}
                    </TableCell>
                    <TableCell className="max-w-32 truncate" title={rsvp.dietary_restrictions || ''}>
                      {rsvp.dietary_restrictions || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {rsvp.attended ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Not Checked In
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentBadgeVariant(rsvp.payment_status)}>
                        {rsvp.payment_status}
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
                              status: 'confirmed'
                            })}
                            disabled={updateStatusMutation.isPending}
                            className="h-8 px-2"
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
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCheckinModal(rsvp)}
                          className="h-8 px-2"
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openNotesModal(rsvp)}
                          className="h-8 px-2"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPaymentModal(rsvp)}
                          className="h-8 px-2"
                        >
                          <DollarSign className="h-3 w-3" />
                        </Button>
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

      {/* Notes Modal */}
      <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSVP Notes - {currentRsvp?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this RSVP..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotesModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => updateNotesMutation.mutate({ 
                  rsvpId: currentRsvp!.id, 
                  notes 
                })}
                disabled={updateNotesMutation.isPending}
              >
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Status - {currentRsvp?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_required">Not Required</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => updatePaymentMutation.mutate({ 
                  rsvpId: currentRsvp!.id, 
                  status: paymentStatus,
                  amount: paymentAmount ? parseFloat(paymentAmount) : undefined,
                  date: paymentDate || undefined
                })}
                disabled={updatePaymentMutation.isPending}
              >
                Update Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-in Modal */}
      <Dialog open={checkinModalOpen} onOpenChange={setCheckinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in Guest - {currentRsvp?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Mark this guest as checked in for the event?
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => checkinMutation.mutate({ 
                    rsvpId: currentRsvp!.id, 
                    attended: false 
                  })}
                  disabled={checkinMutation.isPending}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Not Attended
                </Button>
                <Button 
                  onClick={() => checkinMutation.mutate({ 
                    rsvpId: currentRsvp!.id, 
                    attended: true 
                  })}
                  disabled={checkinMutation.isPending}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
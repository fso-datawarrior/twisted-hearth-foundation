import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SupportReport {
  id: string;
  email: string;
  description: string;
  screenshot_url: string | null;
  user_agent: string | null;
  browser_logs: any[] | null;
  created_at: string;
  status: 'open' | 'investigating' | 'resolved';
  admin_notes: string | null;
}

export default function SupportReportManagement() {
  const [selectedReport, setSelectedReport] = useState<SupportReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['support-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportReport[];
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from('support_reports')
        .update({ status, admin_notes: notes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-reports'] });
      toast({
        title: "Report updated",
        description: "The support report has been updated successfully.",
      });
      setSelectedReport(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewReport = (report: SupportReport) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || '');
    setSelectedStatus(report.status);
  };

  const handleUpdateReport = () => {
    if (!selectedReport) return;
    updateReportMutation.mutate({
      id: selectedReport.id,
      status: selectedStatus,
      notes: adminNotes,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'investigating':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-destructive/20 text-destructive';
      case 'investigating':
        return 'bg-accent-gold/20 text-accent-gold';
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const openReportsCount = reports?.filter(r => r.status === 'open').length || 0;
  const investigatingCount = reports?.filter(r => r.status === 'investigating').length || 0;

  if (isLoading) {
    return <div className="p-6">Loading support reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-accent-gold">Support Reports</h2>
          <p className="text-sm text-muted-foreground">
            Manage user sign-in issues and support requests
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-destructive/10 border-destructive/30">
            {openReportsCount} Open
          </Badge>
          <Badge variant="outline" className="bg-accent-gold/10 border-accent-gold/30">
            {investigatingCount} Investigating
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {reports?.map((report) => (
          <Card key={report.id} className="border-accent-gold/20">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1 capitalize">{report.status}</span>
                    </Badge>
                    <span className="text-muted-foreground truncate">{report.email}</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewReport(report)}
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-2">{report.description}</p>
            </CardContent>
          </Card>
        ))}

        {reports?.length === 0 && (
          <Card className="border-accent-gold/20">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">No support reports yet!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-accent-gold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Support Report Details
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base">{selectedReport.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                <p className="text-base">
                  {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.screenshot_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Screenshot
                  </label>
                  <a
                    href={selectedReport.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent-gold hover:underline"
                  >
                    View Screenshot <ExternalLink className="h-4 w-4" />
                  </a>
                  <img
                    src={selectedReport.screenshot_url}
                    alt="Support screenshot"
                    className="mt-2 max-w-full rounded-lg border border-accent-gold/20"
                  />
                </div>
              )}

              {selectedReport.user_agent && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                  <p className="text-xs font-mono bg-muted/50 p-2 rounded">
                    {selectedReport.user_agent}
                  </p>
                </div>
              )}

              {selectedReport.browser_logs && selectedReport.browser_logs.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Console Logs ({selectedReport.browser_logs.length})
                  </label>
                  <div className="bg-muted/50 p-3 rounded-lg max-h-64 overflow-y-auto">
                    {selectedReport.browser_logs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className={`text-xs font-mono mb-2 pb-2 border-b border-border/50 last:border-0 ${
                          log.level === 'error' ? 'text-destructive' :
                          log.level === 'warn' ? 'text-accent-gold' :
                          'text-foreground'
                        }`}
                      >
                        <span className="text-muted-foreground">[{log.timestamp}]</span>{' '}
                        <span className="font-semibold">[{log.level.toUpperCase()}]</span>{' '}
                        {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={4}
                  className="bg-background/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateReport}
                  disabled={updateReportMutation.isPending}
                  className="flex-1 bg-accent-gold hover:bg-accent-gold/90 text-background"
                >
                  {updateReportMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

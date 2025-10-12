import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsExportMenuProps {
  data: any;
  dateRange: { start: Date; end: Date };
}

export function AnalyticsExportMenu({ data, dateRange }: AnalyticsExportMenuProps) {
  const exportToCSV = () => {
    try {
      const csvContent = [
        ['Metric', 'Value'],
        ['Date Range', `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`],
        ['Total Page Views', data.total_page_views || 0],
        ['Unique Visitors', data.unique_visitors || 0],
        ['Avg Session Duration (s)', data.avg_session_duration || 0],
        ['Total RSVPs', data.total_rsvps || 0],
        ['Total Photos', data.total_photos || 0],
        ['Total Guestbook Posts', data.total_guestbook_posts || 0],
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Analytics exported to CSV');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  const exportToJSON = () => {
    try {
      const jsonContent = JSON.stringify({
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
        summary: data,
        exportedAt: new Date().toISOString(),
      }, null, 2);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Analytics exported to JSON');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

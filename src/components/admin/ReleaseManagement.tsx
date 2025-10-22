import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Eye, Edit, Archive, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import VersionBadge from './VersionBadge';
import { Badge } from '@/components/ui/badge';
import { fetchReleases, publishRelease, archiveRelease } from '@/lib/release-api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReleaseManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [selectedRelease, setSelectedRelease] = useState<string | null>(null);

  // Fetch releases
  const { data: releases, isLoading, refetch } = useQuery({
    queryKey: ['admin-releases', statusFilter, environmentFilter],
    queryFn: () => fetchReleases({
      status: statusFilter !== 'all' ? statusFilter as any : undefined,
      environment: environmentFilter !== 'all' ? environmentFilter as any : undefined,
    }),
  });

  // Filter releases by search query
  const filteredReleases = releases?.filter(release => 
    release.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
    release.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePublish = async (id: string, version: string) => {
    try {
      await publishRelease(id);
      toast.success(`Release v${version} published successfully`);
      refetch();
    } catch (error: any) {
      toast.error(`Failed to publish release: ${error.message}`);
    }
  };

  const handleArchive = async (id: string, version: string) => {
    try {
      await archiveRelease(id);
      toast.success(`Release v${version} archived successfully`);
      refetch();
    } catch (error: any) {
      toast.error(`Failed to archive release: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Release Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage system releases and announcements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Release
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by version or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Environment Filter */}
            <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Releases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Releases ({filteredReleases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReleases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No releases found. Create your first release to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Email Sent</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReleases.map((release) => (
                    <TableRow key={release.id}>
                      <TableCell className="font-mono font-semibold">
                        v{release.version}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={
                              release.environment === 'production' 
                                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
                                : release.environment === 'staging'
                                ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
                                : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                            }
                          >
                            {release.environment.charAt(0).toUpperCase() + release.environment.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-sm ${
                          release.deployment_status === 'deployed' 
                            ? 'text-green-600 dark:text-green-400'
                            : release.deployment_status === 'draft'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {release.deployment_status === 'deployed' && '✅'}
                          {release.deployment_status === 'draft' && '📝'}
                          {release.deployment_status === 'archived' && '📦'}
                          <span className="capitalize">{release.deployment_status}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(release.release_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {release.email_sent ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">
                              {release.email_sent_at 
                                ? format(new Date(release.email_sent_at), 'MMM dd, yyyy')
                                : 'Sent'
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not sent</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {release.summary || <span className="text-muted-foreground italic">No summary</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {release.deployment_status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handlePublish(release.id, release.version)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {release.deployment_status !== 'archived' && (
                              <DropdownMenuItem
                                onClick={() => handleArchive(release.id, release.version)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

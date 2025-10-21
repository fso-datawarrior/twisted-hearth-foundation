import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Edit, GitCompare, Calendar, Package, Code, Bug, Sparkles } from 'lucide-react';
import { fetchReleases } from '@/lib/release-api';
import { format } from 'date-fns';
import VersionBadge from './VersionBadge';

export default function ReleaseHistory() {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedReleases, setSelectedReleases] = useState<string[]>([]);

  const { data: releases, isLoading } = useQuery({
    queryKey: ['release-history'],
    queryFn: () => fetchReleases({ limit: 50 }),
  });

  const toggleReleaseSelection = (id: string) => {
    if (selectedReleases.includes(id)) {
      setSelectedReleases(selectedReleases.filter(r => r !== id));
    } else if (selectedReleases.length < 2) {
      setSelectedReleases([...selectedReleases, id]);
    }
  };

  const getReleaseStats = (release: any) => {
    // This would normally fetch full release data
    // For now, showing placeholder counts
    return {
      features: 0,
      bug_fixes: 0,
      improvements: 0,
      api_changes: 0,
      breaking_changes: 0,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Release History</h2>
          <p className="text-muted-foreground mt-1">
            Timeline of all releases with comparison tools
          </p>
        </div>
        <div className="flex gap-2">
          {compareMode && selectedReleases.length === 2 && (
            <Button>
              <GitCompare className="mr-2 h-4 w-4" />
              Compare Releases
            </Button>
          )}
          <Button
            variant={compareMode ? 'default' : 'outline'}
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedReleases([]);
            }}
          >
            <GitCompare className="mr-2 h-4 w-4" />
            {compareMode ? 'Exit Compare' : 'Compare Mode'}
          </Button>
        </div>
      </div>

      {compareMode && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              {selectedReleases.length === 0 && 'Select 2 releases to compare'}
              {selectedReleases.length === 1 && 'Select 1 more release to compare'}
              {selectedReleases.length === 2 && 'Click "Compare Releases" to view differences'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border" />

        {releases?.map((release, index) => {
          const stats = getReleaseStats(release);
          const isSelected = selectedReleases.includes(release.id);

          return (
            <div key={release.id} className="relative pl-14">
              {/* Timeline dot */}
              <div
                className={`absolute left-0 w-11 h-11 rounded-full flex items-center justify-center ${
                  release.deployment_status === 'deployed'
                    ? 'bg-green-500/10 border-2 border-green-500'
                    : release.deployment_status === 'draft'
                    ? 'bg-yellow-500/10 border-2 border-yellow-500'
                    : 'bg-gray-500/10 border-2 border-gray-500'
                } ${isSelected ? 'ring-4 ring-primary/50' : ''}`}
              >
                <Package className={`h-5 w-5 ${
                  release.deployment_status === 'deployed'
                    ? 'text-green-600 dark:text-green-400'
                    : release.deployment_status === 'draft'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>

              {/* Release Card */}
              <Card
                className={`cursor-pointer transition-all ${
                  compareMode ? 'hover:border-primary' : ''
                } ${isSelected ? 'border-primary shadow-lg' : ''}`}
                onClick={() => compareMode && toggleReleaseSelection(release.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold font-mono">v{release.version}</h3>
                        <VersionBadge
                          version=""
                          status={release.deployment_status}
                          environment={release.environment}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(release.release_date), 'MMMM dd, yyyy')}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>Created {format(new Date(release.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    {!compareMode && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  {release.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {release.summary}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="gap-2">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      <span className="font-semibold">{stats.features}</span>
                      <span className="text-muted-foreground">Features</span>
                    </Badge>
                    <Badge variant="outline" className="gap-2">
                      <Bug className="h-3 w-3 text-red-500" />
                      <span className="font-semibold">{stats.bug_fixes}</span>
                      <span className="text-muted-foreground">Bug Fixes</span>
                    </Badge>
                    <Badge variant="outline" className="gap-2">
                      <Code className="h-3 w-3 text-blue-500" />
                      <span className="font-semibold">{stats.improvements}</span>
                      <span className="text-muted-foreground">Improvements</span>
                    </Badge>
                    {stats.api_changes > 0 && (
                      <Badge variant="outline" className="gap-2">
                        <Package className="h-3 w-3 text-orange-500" />
                        <span className="font-semibold">{stats.api_changes}</span>
                        <span className="text-muted-foreground">API Changes</span>
                      </Badge>
                    )}
                    {stats.breaking_changes > 0 && (
                      <Badge variant="destructive" className="gap-2">
                        ⚠️
                        <span className="font-semibold">{stats.breaking_changes}</span>
                        <span>Breaking Changes</span>
                      </Badge>
                    )}
                  </div>

                  {/* Email status */}
                  {release.email_sent && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <span>✅</span>
                      <span>
                        Email sent {release.email_sent_at && `on ${format(new Date(release.email_sent_at), 'MMM dd, yyyy')}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {releases?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No releases yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first release to start tracking your deployment history
            </p>
            <Button>Create Release</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

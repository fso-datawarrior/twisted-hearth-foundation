import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VersionBadgeProps {
  version: string;
  status: 'draft' | 'deployed' | 'archived';
  environment: 'development' | 'staging' | 'production';
  className?: string;
}

export default function VersionBadge({ 
  version, 
  status, 
  environment,
  className 
}: VersionBadgeProps) {
  const statusColors = {
    draft: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    deployed: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    archived: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  };

  const environmentColors = {
    development: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    staging: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    production: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  };

  const statusIcons = {
    draft: '📝',
    deployed: '✅',
    archived: '📦',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant="outline" className="font-mono font-semibold">
        v{version}
      </Badge>
      
      <Badge 
        variant="outline" 
        className={cn(statusColors[status], 'border')}
      >
        <span className="mr-1">{statusIcons[status]}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
      
      <Badge 
        variant="outline" 
        className={cn(environmentColors[environment], 'border')}
      >
        {environment.charAt(0).toUpperCase() + environment.slice(1)}
      </Badge>
    </div>
  );
}

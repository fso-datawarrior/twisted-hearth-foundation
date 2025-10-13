import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoadingWidgetProps {
  className?: string;
  showHeader?: boolean;
  rows?: number;
}

export default function LoadingWidget({ 
  className, 
  showHeader = true,
  rows = 3 
}: LoadingWidgetProps) {
  return (
    <Card className={cn(
      'bg-gradient-to-br from-card/90 to-card/60 border-border/50',
      className
    )}>
      {showHeader && (
        <CardHeader className="pb-3 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32 sm:w-40" />
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

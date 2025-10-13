import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorWidgetProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorWidget({ 
  title = 'Error Loading Data',
  message = 'Failed to load analytics data. Please try again.',
  onRetry,
  className 
}: ErrorWidgetProps) {
  return (
    <Card className={cn(
      'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20',
      className
    )}>
      <CardHeader className="pb-3 p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRetry}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

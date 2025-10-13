import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface WidgetWrapperProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerAction?: ReactNode;
  badge?: ReactNode;
}

export default function WidgetWrapper({
  title,
  icon,
  children,
  onRefresh,
  isRefreshing = false,
  collapsible = false,
  defaultCollapsed = false,
  className,
  headerAction,
  badge,
}: WidgetWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={cn(
      'bg-gradient-to-br from-card/90 to-card/60 border-border/50',
      'transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
      className
    )}>
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
            <span className="truncate">{title}</span>
            {badge && <span className="flex-shrink-0">{badge}</span>}
          </CardTitle>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {headerAction}
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
                aria-label="Refresh widget"
              >
                <RefreshCw className={cn(
                  'h-4 w-4',
                  isRefreshing && 'animate-spin'
                )} />
              </Button>
            )}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0"
                aria-label={isCollapsed ? 'Expand widget' : 'Collapse widget'}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="p-4 sm:p-6 pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

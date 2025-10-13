import { Activity, TrendingUp } from 'lucide-react';
import { WidgetWrapper } from './index';
import { LoadingWidget } from './index';
import { ErrorWidget } from './index';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

/**
 * Test widget to verify Phase 4A infrastructure
 * Tests: WidgetWrapper, LoadingWidget, ErrorWidget, responsive design, refresh
 */
export default function TestWidget() {
  const [viewMode, setViewMode] = useState<'normal' | 'loading' | 'error'>('normal');
  const [refreshCount, setRefreshCount] = useState(0);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    // Simulate refresh action
    console.log('🔄 Test Widget refreshed:', refreshCount + 1);
  };

  if (viewMode === 'loading') {
    return <LoadingWidget rows={4} />;
  }

  if (viewMode === 'error') {
    return (
      <ErrorWidget
        title="Test Error State"
        message="This is a simulated error to test the ErrorWidget component."
        onRetry={() => setViewMode('normal')}
      />
    );
  }

  return (
    <WidgetWrapper
      title="Test Widget (Phase 4A)"
      icon={<Activity className="h-5 w-5" />}
      onRefresh={handleRefresh}
      collapsible={true}
      badge={
        <Badge variant="secondary" className="text-xs">
          TESTING
        </Badge>
      }
      headerAction={
        <Badge variant="outline" className="text-xs">
          v{refreshCount}
        </Badge>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Metric 1</span>
            </div>
            <div className="text-2xl font-bold text-primary">1,234</div>
          </div>

          <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Metric 2</span>
            </div>
            <div className="text-2xl font-bold text-secondary">5,678</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('normal')}
            className="px-3 py-1 text-xs rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
          >
            Normal View
          </button>
          <button
            onClick={() => setViewMode('loading')}
            className="px-3 py-1 text-xs rounded bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors"
          >
            Loading View
          </button>
          <button
            onClick={() => setViewMode('error')}
            className="px-3 py-1 text-xs rounded bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-colors"
          >
            Error View
          </button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ WidgetWrapper with collapsible functionality</p>
          <p>✅ Responsive design (mobile/tablet/desktop)</p>
          <p>✅ Design system tokens (primary, secondary, accent)</p>
          <p>✅ Refresh button with state</p>
          <p>✅ Loading and Error states</p>
        </div>
      </div>
    </WidgetWrapper>
  );
}

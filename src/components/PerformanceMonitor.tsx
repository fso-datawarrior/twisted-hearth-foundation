import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  bundleSize: number | null;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    bundleSize: null
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or staging
    if (import.meta.env.MODE === 'production') return;

    const measurePerformance = () => {
      // Measure Core Web Vitals
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // TTFB (Time to First Byte)
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          setMetrics(prev => ({ ...prev, ttfb: navigation.responseStart - navigation.requestStart }));
        }

        // Cleanup observers
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          fcpObserver.disconnect();
        };
      }
    };

    const cleanup = measurePerformance();

    // Measure bundle size (approximate)
    const measureBundleSize = () => {
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && src.includes('assets')) {
          // This is a rough estimate - in reality you'd need to fetch and measure
          totalSize += 100; // KB estimate
        }
      });
      setMetrics(prev => ({ ...prev, bundleSize: totalSize }));
    };

    measureBundleSize();

    return cleanup;
  }, []);

  const getScoreColor = (value: number | null, thresholds: { good: number; needsImprovement: number }) => {
    if (value === null) return 'text-gray-500';
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.needsImprovement) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatValue = (value: number | null, unit: string = 'ms') => {
    if (value === null) return 'N/A';
    return `${value.toFixed(2)}${unit}`;
  };

  if (import.meta.env.MODE === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm hover:bg-black/90 transition-colors"
      >
        {isVisible ? 'Hide' : 'Show'} Perf
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-black/90 text-white p-4 rounded-lg text-xs min-w-64 backdrop-blur-sm">
          <h3 className="font-bold mb-2 text-green-400">Performance Metrics</h3>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={getScoreColor(metrics.lcp, { good: 2500, needsImprovement: 4000 })}>
                {formatValue(metrics.lcp)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={getScoreColor(metrics.fid, { good: 100, needsImprovement: 300 })}>
                {formatValue(metrics.fid)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={getScoreColor(metrics.cls, { good: 0.1, needsImprovement: 0.25 })}>
                {formatValue(metrics.cls, '')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={getScoreColor(metrics.fcp, { good: 1800, needsImprovement: 3000 })}>
                {formatValue(metrics.fcp)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>TTFB:</span>
              <span className={getScoreColor(metrics.ttfb, { good: 800, needsImprovement: 1800 })}>
                {formatValue(metrics.ttfb)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Bundle:</span>
              <span className={getScoreColor(metrics.bundleSize, { good: 200, needsImprovement: 500 })}>
                {formatValue(metrics.bundleSize, 'KB')}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              <div>Targets: LCP &lt; 2.5s, FID &lt; 100ms, CLS &lt; 0.1</div>
              <div>Bundle &lt; 200KB, TTFB &lt; 800ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

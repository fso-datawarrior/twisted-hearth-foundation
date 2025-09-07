/**
 * Stagewise Configuration for Twisted Halloween Staging Environment
 * 
 * This file configures Stagewise for enhanced development workflow
 * in the staging environment. Stagewise provides tools for:
 * - Component inspection and debugging
 * - State management visualization
 * - Performance monitoring
 * - Team collaboration features
 */

export interface StagewiseConfig {
  enabled: boolean;
  projectId?: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    componentInspector: boolean;
    stateVisualization: boolean;
    performanceMonitoring: boolean;
    teamCollaboration: boolean;
    debugPanel: boolean;
  };
  urls: {
    staging: string;
    production: string;
  };
  plugins: Array<{
    name: string;
    description: string;
    enabled: boolean;
    config?: Record<string, any>;
  }>;
}

/**
 * Default Stagewise configuration for staging environment
 */
export const stagewiseConfig: StagewiseConfig = {
  enabled: import.meta.env.VITE_STAGING_MODE === 'true' || import.meta.env.DEV,
  environment: import.meta.env.VITE_APP_ENV as 'development' | 'staging' | 'production',
  features: {
    componentInspector: true,
    stateVisualization: true,
    performanceMonitoring: true,
    teamCollaboration: true,
    debugPanel: import.meta.env.VITE_SHOW_DEBUG_PANEL === 'true',
  },
  urls: {
    staging: import.meta.env.VITE_STAGING_URL || 'http://localhost:8081',
    production: import.meta.env.VITE_PRODUCTION_URL || 'https://twistedhalloween.com',
  },
  plugins: [
    {
      name: 'hunt-system',
      description: 'Twisted Halloween Hunt System Integration',
      enabled: true,
      config: {
        showHuntProgress: true,
        enableHuntDebugging: true,
        trackHuntInteractions: true,
      },
    },
    {
      name: 'supabase-integration',
      description: 'Supabase Database Integration',
      enabled: true,
      config: {
        showQueries: true,
        trackAuthState: true,
        monitorRealtime: true,
      },
    },
    {
      name: 'performance-monitor',
      description: 'Performance and Analytics Monitoring',
      enabled: true,
      config: {
        trackPageLoads: true,
        monitorBundleSize: true,
        trackUserInteractions: true,
      },
    },
  ],
};

/**
 * Initialize Stagewise for the staging environment
 * This function should be called in development/staging mode only
 */
export function initializeStagewise(): void {
  if (!stagewiseConfig.enabled) {
    return;
  }

  // Add Stagewise-specific CSS classes and attributes
  document.documentElement.setAttribute('data-stagewise', 'true');
  document.documentElement.setAttribute('data-environment', stagewiseConfig.environment);
  
  // Add staging-specific meta tags
  const metaEnvironment = document.querySelector('meta[name="stagewise-environment"]');
  if (!metaEnvironment) {
    const meta = document.createElement('meta');
    meta.name = 'stagewise-environment';
    meta.content = stagewiseConfig.environment;
    document.head.appendChild(meta);
  }

  // Log Stagewise initialization
  console.log('🎃 Stagewise initialized for Twisted Halloween Staging Environment');
  console.log('Environment:', stagewiseConfig.environment);
  console.log('Features enabled:', stagewiseConfig.features);
  console.log('Plugins loaded:', stagewiseConfig.plugins.filter(p => p.enabled).map(p => p.name));
}

/**
 * Get Stagewise configuration for a specific environment
 */
export function getStagewiseConfig(environment: 'development' | 'staging' | 'production'): StagewiseConfig {
  return {
    ...stagewiseConfig,
    environment,
    enabled: environment !== 'production',
  };
}

/**
 * Check if Stagewise is enabled for the current environment
 */
export function isStagewiseEnabled(): boolean {
  return stagewiseConfig.enabled;
}

/**
 * Get the current Stagewise environment
 */
export function getCurrentEnvironment(): 'development' | 'staging' | 'production' {
  return stagewiseConfig.environment;
}

/**
 * Enable/disable specific Stagewise features
 */
export function toggleStagewiseFeature(feature: keyof StagewiseConfig['features'], enabled: boolean): void {
  if (stagewiseConfig.enabled) {
    stagewiseConfig.features[feature] = enabled;
    console.log(`Stagewise feature '${feature}' ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Add custom Stagewise plugin
 */
export function addStagewisePlugin(plugin: StagewiseConfig['plugins'][0]): void {
  if (stagewiseConfig.enabled) {
    stagewiseConfig.plugins.push(plugin);
    console.log(`Stagewise plugin '${plugin.name}' added`);
  }
}

/**
 * Get all enabled Stagewise plugins
 */
export function getEnabledPlugins(): StagewiseConfig['plugins'] {
  return stagewiseConfig.plugins.filter(plugin => plugin.enabled);
}

/**
 * Stagewise development helpers
 */
export const stagewiseHelpers = {
  /**
   * Log component state for debugging
   */
  logComponentState: (componentName: string, state: any) => {
    if (stagewiseConfig.enabled && stagewiseConfig.features.componentInspector) {
      console.log(`[Stagewise] ${componentName} state:`, state);
    }
  },

  /**
   * Track user interactions for analytics
   */
  trackInteraction: (action: string, data?: any) => {
    if (stagewiseConfig.enabled && stagewiseConfig.features.performanceMonitoring) {
      console.log(`[Stagewise] User interaction: ${action}`, data);
    }
  },

  /**
   * Monitor performance metrics
   */
  trackPerformance: (metric: string, value: number) => {
    if (stagewiseConfig.enabled && stagewiseConfig.features.performanceMonitoring) {
      console.log(`[Stagewise] Performance metric: ${metric} = ${value}ms`);
    }
  },
};

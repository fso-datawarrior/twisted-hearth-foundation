import { NavigationDropdown } from './NavigationDropdown';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Layers, 
  Users as UsersIcon, 
  SettingsIcon,
  Images,
  Theater,
  Home,
  MessageSquare,
  UserCheck,
  Trophy,
  Search,
  Wine,
  Mail,
  BarChart3,
  Shield,
  UserCog
} from 'lucide-react';

interface NavigationCounts {
  rsvps?: number;
  tournament?: number;
  photos?: number;
  hunt?: number;
  vignettes?: number;
  libations?: number;
}

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  counts: NavigationCounts;
  isMobile?: boolean;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  onTabChange,
  counts,
  isMobile = false
}) => {
  const navigationStructure = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Settings,
      type: 'single' as const
    },
    {
      id: 'content',
      label: 'Content',
      icon: Layers,
      type: 'dropdown' as const,
      items: [
        { id: 'gallery', label: 'Gallery', icon: Images, badge: counts.photos },
        { id: 'vignettes', label: 'Vignettes', icon: Theater, badge: counts.vignettes },
        { id: 'homepage', label: 'Homepage', icon: Home, badge: 3 },
        { id: 'guestbook', label: 'Guestbook', icon: MessageSquare }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: UsersIcon,
      type: 'dropdown' as const,
      items: [
        { id: 'rsvps', label: 'RSVPs', icon: UserCheck, badge: counts.rsvps },
        { id: 'tournament', label: 'Tournament', icon: Trophy, badge: counts.tournament },
        { id: 'hunt', label: 'Hunt', icon: Search, badge: counts.hunt }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      type: 'dropdown' as const,
      items: [
        { id: 'libations', label: 'Libations', icon: Wine, badge: counts.libations },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'admin-roles', label: 'Admins', icon: Shield },
        { id: 'user-management', label: 'Users', icon: UserCog }
      ]
    }
  ];

  // Mobile view - vertical stack
  if (isMobile) {
    return (
      <div className="w-full space-y-2 mb-6">
        <div className="bg-muted/50 rounded-md p-2 space-y-1">
          {navigationStructure.map((nav) => {
            if (nav.type === 'single') {
              const Icon = nav.icon;
              const isActive = nav.id === activeTab;
              
              return (
                <button
                  key={nav.id}
                  onClick={() => onTabChange(nav.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-colors min-h-[44px]",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted/50 text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{nav.label}</span>
                </button>
              );
            }
            
            return (
              <NavigationDropdown
                key={nav.id}
                label={nav.label}
                icon={nav.icon}
                items={nav.items}
                activeTab={activeTab}
                onTabChange={onTabChange}
                isMobile={true}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop view - horizontal with hover dropdowns
  return (
    <div className="w-full mb-6">
      <div className="bg-muted/50 rounded-md p-2 flex items-center gap-2 flex-wrap">
        {navigationStructure.map((nav) => {
          if (nav.type === 'single') {
            const Icon = nav.icon;
            const isActive = nav.id === activeTab;
            
            return (
              <button
                key={nav.id}
                onClick={() => onTabChange(nav.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted/50 text-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{nav.label}</span>
              </button>
            );
          }
          
          return (
            <NavigationDropdown
              key={nav.id}
              label={nav.label}
              icon={nav.icon}
              items={nav.items}
              activeTab={activeTab}
              onTabChange={onTabChange}
              isMobile={false}
            />
          );
        })}
      </div>
    </div>
  );
};

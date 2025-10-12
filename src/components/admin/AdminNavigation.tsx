import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronDown,
  Menu,
  Images,
  Theater,
  Home,
  MessageSquare,
  Search,
  Wine,
  Calendar,
  Trophy,
  UserCog,
  Shield,
  Mail,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  count?: number | null;
}

interface NavCategory {
  id: string;
  label: string;
  icon: any;
  items?: NavItem[];
}

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    rsvps?: number;
    tournamentRegs?: number;
    photos?: number;
    activeHuntRuns?: number;
    selectedVignettePhotos?: number;
    activeLibations?: number;
  };
}

export function AdminNavigation({ activeTab, onTabChange, counts }: AdminNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: NavCategory[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      items: [
        { id: 'gallery', label: 'Gallery', icon: Images, count: counts.photos },
        { id: 'vignettes', label: 'Vignettes', icon: Theater, count: counts.selectedVignettePhotos },
        { id: 'homepage', label: 'Homepage', icon: Home, count: 3 },
        { id: 'guestbook', label: 'Guestbook', icon: MessageSquare },
        { id: 'hunt', label: 'Hunt', icon: Search, count: counts.activeHuntRuns },
        { id: 'libations', label: 'Libations', icon: Wine, count: counts.activeLibations },
      ],
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      items: [
        { id: 'rsvps', label: 'RSVPs', icon: Calendar, count: counts.rsvps },
        { id: 'tournament', label: 'Tournament', icon: Trophy, count: counts.tournamentRegs },
        { id: 'user-management', label: 'User Management', icon: UserCog },
        { id: 'admin-roles', label: 'Admin Roles', icon: Shield },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      items: [
        { id: 'email', label: 'Email Campaigns', icon: Mail },
        { id: 'database-reset', label: 'Database Reset', icon: Database },
      ],
    },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const renderNavItem = (item: NavItem, className?: string) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <Button
        key={item.id}
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start gap-2 text-left min-h-[44px]',
          className
        )}
        onClick={() => handleNavClick(item.id)}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.count !== null && item.count !== undefined && (
          <Badge variant="secondary" className="text-xs px-1.5">
            {item.count}
          </Badge>
        )}
      </Button>
    );
  };

  const renderCategory = (category: NavCategory) => {
    const Icon = category.icon;
    const isActive = activeTab === category.id || category.items?.some(item => item.id === activeTab);

    // Single item (Overview)
    if (!category.items) {
      return (
        <Button
          key={category.id}
          variant={isActive ? 'default' : 'ghost'}
          className="gap-2 min-h-[44px]"
          onClick={() => handleNavClick(category.id)}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden md:inline">{category.label}</span>
        </Button>
      );
    }

    // Dropdown for categories with items
    return (
      <DropdownMenu key={category.id}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isActive ? 'default' : 'ghost'}
            className="gap-2 min-h-[44px]"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{category.label}</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm">
          {category.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer gap-2 min-h-[44px]"
                onClick={() => handleNavClick(item.id)}
              >
                <ItemIcon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.count !== null && item.count !== undefined && (
                  <Badge variant="secondary" className="text-xs px-1.5">
                    {item.count}
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Desktop navigation
  const desktopNav = (
    <div className="hidden md:flex items-center gap-2 mb-6 p-2 bg-muted/50 rounded-lg">
      {categories.map(renderCategory)}
    </div>
  );

  // Mobile navigation
  const mobileNav = (
    <div className="md:hidden mb-6">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full gap-2 min-h-[44px]">
            <Menu className="h-4 w-4" />
            <span className="flex-1 text-left">
              {categories
                .flatMap(c => c.items ? c.items : [c])
                .find(i => i.id === activeTab)?.label || 'Menu'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 overflow-y-auto">
          <div className="space-y-6 mt-6">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                {!category.items ? (
                  renderNavItem({ id: category.id, label: category.label, icon: category.icon })
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </div>
                    <div className="space-y-1 pl-2">
                      {category.items.map((item) => renderNavItem(item, 'pl-6'))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
}

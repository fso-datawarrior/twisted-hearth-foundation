import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
}

interface NavigationDropdownProps {
  label: string;
  icon: React.ElementType;
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobile?: boolean;
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  label,
  icon: Icon,
  items,
  activeTab,
  onTabChange,
  isMobile = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Check if any child item is active
  const isAnyChildActive = items.some(item => item.id === activeTab);

  // Mobile accordion style
  if (isMobile) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors min-h-[44px]",
            isAnyChildActive 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </button>
        
        {isOpen && (
          <div className="mt-1 ml-4 space-y-1">
            {items.map((item) => {
              const ItemIcon = item.icon;
              const isActive = item.id === activeTab;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-md transition-colors min-h-[44px]",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted/30 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge != null && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop dropdown style
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isAnyChildActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted/50 text-foreground"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 min-w-[200px] bg-popover border border-border rounded-md shadow-lg z-50 py-1"
          onMouseLeave={() => setIsOpen(false)}
        >
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = item.id === activeTab;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted/50 text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <ItemIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge != null && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 ml-2">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

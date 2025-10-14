import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, Search, User, Settings, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SettingsOption {
  id: string;
  label: string;
  description: string;
  tab: string;
  keywords: string[];
  icon: React.ElementType;
}

const settingsOptions: SettingsOption[] = [
  {
    id: 'profile',
    label: 'Profile Settings',
    description: 'Manage your avatar, display name, and profile information',
    tab: 'profile',
    keywords: ['avatar', 'photo', 'picture', 'display name', 'profile'],
    icon: User,
  },
  {
    id: 'account',
    label: 'Account Settings',
    description: 'View your email, account statistics, and activity',
    tab: 'account',
    keywords: ['email', 'account', 'statistics', 'activity', 'stats'],
    icon: Settings,
  },
  {
    id: 'security',
    label: 'Security Settings',
    description: 'Change your password and manage security preferences',
    tab: 'security',
    keywords: ['password', 'security', '2fa', 'sessions', 'authentication'],
    icon: Shield,
  },
];

interface SettingsCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsCommandPalette({ open, onOpenChange }: SettingsCommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Filter options based on search
  const filteredOptions = settingsOptions.filter((option) => {
    const searchLower = search.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      option.description.toLowerCase().includes(searchLower) ||
      option.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
    );
  });

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      } else if (e.key === 'Enter' && filteredOptions[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredOptions]);

  const handleSelect = (option: SettingsOption) => {
    navigate(`/settings?tab=${option.tab}`);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--accent-gold))]">
            <Command className="h-5 w-5" />
            Settings Search
          </DialogTitle>
          <DialogDescription>
            Search for settings or press Escape to close
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-[hsl(var(--border))]">
          <div className="flex items-center px-4 py-3">
            <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))] mr-2" />
            <input
              type="text"
              placeholder="Search settings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredOptions.length === 0 ? (
            <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
              No settings found for "{search}"
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-[hsl(var(--accent-gold))]/10 border border-[hsl(var(--accent-gold))]/30'
                      : 'hover:bg-[hsl(var(--muted))]/50'
                  }`}
                >
                  <Icon className="h-5 w-5 mt-0.5 text-[hsl(var(--accent-gold))]" />
                  <div className="flex-1">
                    <div className="font-medium text-[hsl(var(--foreground))]">{option.label}</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-[hsl(var(--border))] p-3 text-xs text-[hsl(var(--muted-foreground))] flex items-center justify-between bg-[hsl(var(--muted))]/30">
          <span>Navigate with ↑↓ arrows</span>
          <span>Press Enter to select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

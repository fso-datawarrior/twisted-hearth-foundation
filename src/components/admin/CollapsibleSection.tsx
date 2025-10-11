import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export default function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
  badge,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={cn('mb-4', className)}>
      <CardHeader className="p-4 sm:p-6">
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
            {badge && <span className="ml-2">{badge}</span>}
          </CardTitle>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-4 sm:p-6 pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

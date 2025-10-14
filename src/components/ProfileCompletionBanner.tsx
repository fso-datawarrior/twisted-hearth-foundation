import React from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProfileCompletionStatus, dismissCompletionBanner } from '@/lib/profile-utils';

interface ProfileCompletionBannerProps {
  status: ProfileCompletionStatus;
  onDismiss: () => void;
}

export default function ProfileCompletionBanner({ status, onDismiss }: ProfileCompletionBannerProps) {
  const handleDismiss = () => {
    dismissCompletionBanner();
    onDismiss();
  };

  return (
    <div className="bg-gradient-to-r from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-gold))] p-4 shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--bg))]" />
            <h3 className="font-heading font-semibold text-[hsl(var(--bg))]">
              Complete Your Profile ({status.percentage}%)
            </h3>
          </div>
          
          <Progress value={status.percentage} className="h-2 mb-2 bg-[hsl(var(--bg))]/20" />
          
          <p className="text-sm text-[hsl(var(--bg))]/90">
            {status.missingItems.length > 0 ? (
              <>Add {status.missingItems.join(' and ')} to complete your profile</>
            ) : (
              <>Your profile is complete!</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-[hsl(var(--bg))] text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--bg))]/90"
          >
            <Link to="/settings?tab=profile">Complete Profile</Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="text-[hsl(var(--bg))] hover:bg-[hsl(var(--bg))]/10"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

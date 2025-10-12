import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import * as Icons from "lucide-react";

interface AdminBreadcrumbProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

// Map tab names to categories and display info
const tabConfig: Record<string, { category: string; label: string; icon: keyof typeof Icons }> = {
  overview: { category: "Admin", label: "Overview", icon: "LayoutDashboard" },
  analytics: { category: "Admin", label: "Analytics", icon: "BarChart3" },
  rsvps: { category: "Users", label: "RSVPs", icon: "Calendar" },
  users: { category: "Users", label: "User Management", icon: "Users" },
  "user-management": { category: "Users", label: "User Management", icon: "UserCog" },
  "admin-roles": { category: "Users", label: "Admin Roles", icon: "Shield" },
  roles: { category: "Users", label: "Role Management", icon: "Shield" },
  gallery: { category: "Content", label: "Gallery", icon: "Image" },
  vignettes: { category: "Content", label: "Vignettes", icon: "BookOpen" },
  homepage: { category: "Content", label: "Homepage Vignettes", icon: "Home" },
  guestbook: { category: "Content", label: "Guestbook", icon: "MessageSquare" },
  tournament: { category: "Content", label: "Tournament", icon: "Trophy" },
  libations: { category: "Content", label: "Libations", icon: "Wine" },
  email: { category: "Settings", label: "Email Communication", icon: "Mail" },
  campaigns: { category: "Settings", label: "Campaign Composer", icon: "Send" },
  "database-reset": { category: "Settings", label: "Database Reset", icon: "Database" },
  database: { category: "Settings", label: "Database Reset", icon: "Database" },
};

export function AdminBreadcrumb({ activeTab, onNavigate }: AdminBreadcrumbProps) {
  const config = tabConfig[activeTab];
  
  if (!config || activeTab === "overview") {
    return null; // Don't show breadcrumb on overview
  }

  const Icon = Icons[config.icon] as React.ComponentType<{ className?: string }>;

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b px-4 py-3 md:hidden">
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("overview")}
          className="h-8 gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Overview
        </Button>
      </div>
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => onNavigate("overview")}
              className="cursor-pointer hover:text-foreground"
            >
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="text-muted-foreground">
              {config.category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {config.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

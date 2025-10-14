import { FileText, Bug, HelpCircle } from "lucide-react";
import { useState } from "react";
import packageJson from '../../../package.json';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AdminFooter = () => {
  const [showHelp, setShowHelp] = useState(false);
  const version = packageJson.version;
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString();
  const gitBranch = import.meta.env.VITE_GIT_BRANCH;

  return (
    <>
      <div className="mt-auto pt-6 pb-4 px-6 border-t border-border">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Left: Version Info */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Twisted Hearth Foundation</span>
            <span className="hidden sm:inline">•</span>
            <span>Admin Panel v{version}</span>
            {gitBranch && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="text-muted-foreground/70">{gitBranch}</span>
              </>
            )}
          </div>

          {/* Center: Quick Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/YOUR_REPO/blob/main/docs/ADMIN_GUIDE.md" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
              title="Admin Documentation"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Documentation</span>
            </a>
            <a 
              href="https://github.com/YOUR_REPO/issues/new?labels=bug&template=bug_report.md" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
              title="Report a Bug"
            >
              <Bug className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Report Bug</span>
            </a>
            <button
              onClick={() => setShowHelp(true)}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
              title="Quick Help"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Help</span>
            </button>
          </div>

          {/* Right: Build Date */}
          <div className="text-center lg:text-right">
            Built: {new Date(buildDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Admin Panel Quick Help</DialogTitle>
            <DialogDescription>
              Common tasks and keyboard shortcuts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Dashboard</strong>: Overview of site activity and metrics</li>
                <li>• <strong>Users</strong>: Manage user accounts, roles, and permissions</li>
                <li>• <strong>Gallery</strong>: Approve/reject photo submissions</li>
                <li>• <strong>Email Campaigns</strong>: Send announcements to users</li>
                <li>• <strong>Settings</strong>: Configure site options and features</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/⌘ + K</kbd> - Quick search</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/⌘ + /</kbd> - Toggle help</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> - Close dialogs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Need More Help?</h3>
              <p className="text-muted-foreground">
                Check the{" "}
                <a 
                  href="https://github.com/YOUR_REPO/blob/main/docs/ADMIN_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  full documentation
                </a>{" "}
                or{" "}
                <a 
                  href="https://github.com/YOUR_REPO/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  report an issue
                </a>
                .
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

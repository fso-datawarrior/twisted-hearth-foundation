"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startViewTransition } from "@/lib/useViewTransitions";
import { NavTrigger } from "./NavTrigger";
import { NavItem } from "./NavItem";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Vignettes", href: "/vignettes" },
  { label: "Schedule", href: "/schedule" },
  { label: "Costumes", href: "/costumes" },
  { label: "Feast", href: "/feast" },
  { label: "Gallery", href: "/gallery" },
  { label: "Discussion", href: "/discussion" },
  { label: "Contact", href: "/contact" },
  { label: "RSVP", href: "/rsvp" },
];

export function SecretNav() {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const popoverId = useId();
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const canPopover = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

  const handleOpen = () => {
    if (canPopover && popoverRef.current) {
      (popoverRef.current as any).showPopover();
      setOpen(true);
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (canPopover && popoverRef.current) {
      (popoverRef.current as any).hidePopover();
      setOpen(false);
      return;
    }
    setOpen(false);
  };

  const onNavigate = (href: string) => {
    handleClose();
    startViewTransition(() => {
      window.location.href = href;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <NavTrigger onOpen={handleOpen} />

      {/* Popover path */}
      {canPopover && (
        <div
          id={popoverId}
          ref={popoverRef}
          {...({ popover: "auto" } as any)}
          className="z-[110] w-64 rounded-2xl bg-neutral-900/75 backdrop-blur-md ring-1 ring-white/10 shadow-2xl outline-none"
          onToggle={(e: any) => setOpen(e.newState === "open")}
        >
          <VisuallyHidden><h2>Site navigation</h2></VisuallyHidden>
          <AnimatePresence>
            {open && (
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="p-3"
                aria-label="Site"
              >
                <ul className="space-y-1">
                  {LINKS.map((link, index) => (
                    <motion.li 
                      key={link.href}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NavItem href={link.href} label={link.label} onNavigate={() => onNavigate(link.href)} />
                    </motion.li>
                  ))}
                </ul>

                {/* Auth Section */}
                <motion.div 
                  className="mt-4 pt-3 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-neutral-100/70">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-accent-purple text-background text-xs">
                            {user.email?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {user.email?.split("@")[0] || "User"}
                        </span>
                      </div>
                      <Button
                        onClick={() => { signOut(); handleClose(); }}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-3 text-neutral-100/70 hover:text-white hover:bg-white/10"
                      >
                        <LogOut size={14} className="mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => { setShowAuthModal(true); handleClose(); }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-3 text-neutral-100/70 hover:text-white hover:bg-white/10"
                    >
                      Sign In
                    </Button>
                  )}
                </motion.div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Radix fallback */}
      {!canPopover && (
        <Dialog open={open} onOpenChange={(v) => (v ? handleOpen() : handleClose())}>
          <DialogContent className="sm:max-w-[320px] bg-neutral-900/80 backdrop-blur-md border-white/10">
            <VisuallyHidden><h2>Site navigation</h2></VisuallyHidden>
            <nav className="p-2" aria-label="Site">
              <ul className="space-y-1">
                {LINKS.map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavItem href={link.href} label={link.label} onNavigate={() => onNavigate(link.href)} />
                  </motion.li>
                ))}
              </ul>

              {/* Auth Section */}
              <div className="mt-4 pt-3 border-t border-white/10">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-neutral-100/70">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-accent-purple text-background text-xs">
                          {user.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {user.email?.split("@")[0] || "User"}
                      </span>
                    </div>
                    <Button
                      onClick={() => { signOut(); handleClose(); }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-3 text-neutral-100/70 hover:text-white hover:bg-white/10"
                    >
                      <LogOut size={14} className="mr-2" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { setShowAuthModal(true); handleClose(); }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-3 text-neutral-100/70 hover:text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </DialogContent>
        </Dialog>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
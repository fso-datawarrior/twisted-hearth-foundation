"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startViewTransition } from "@/lib/useViewTransitions";
import { NavTrigger } from "./NavTrigger";
import { NavItem } from "./NavItem";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // shadcn dialog
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const LINKS = [
  { label: "RSVP", href: "/rsvp" },
  { label: "Scenes", href: "/vignettes" },
  { label: "Gallery", href: "/gallery" },
  { label: "Discussion", href: "/discussion" },
  { label: "About", href: "/about" },
  { label: "Schedule", href: "/schedule" },
  { label: "Costumes", href: "/costumes" },
  { label: "Feast", href: "/feast" },
  { label: "Contact", href: "/contact" },
  // { label: "Sign In", href: "/auth" }, // if applicable
];

export function SecretNav() {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const canPopover = false; // Force use of Radix Dialog for better compatibility

  const handleOpen = () => {
    console.log('Magic Mirror clicked! Opening navigation...');
    if (canPopover && popoverRef.current) {
      // @ts-expect-error - Popover API
      popoverRef.current.showPopover();
      setOpen(true);
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (canPopover && popoverRef.current) {
      // @ts-expect-error - Popover API
      popoverRef.current.hidePopover();
      setOpen(false);
      return;
    }
    setOpen(false);
  };

  const onNavigate = (href: string) => {
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

      {/* Simple fallback navigation - always show this for now */}
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 border border-gray-600 text-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-amber-400">Navigation</h3>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-white text-xl"
                aria-label="Close navigation"
              >
                ×
              </button>
            </div>
            <nav aria-label="Site">
              <ul className="space-y-2">
                {LINKS.map(l => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(l.href);
                        handleClose();
                      }}
                      className="block px-3 py-2 text-white hover:text-amber-200 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
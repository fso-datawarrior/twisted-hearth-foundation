// 🚨 CRITICAL: DO NOT MODIFY THIS FILE
// This file contains the cn() utility function used by all shadcn/ui components
// Modifying this will break the entire UI component system
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

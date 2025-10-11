# Patches and Updates Tracker

## Overview
This document tracks all patches, updates, and fixes for the Twisted Hearth Foundation project.

## Status Legend
- 🔴 **Critical** - Must be fixed immediately
- 🟡 **High Priority** - Should be addressed soon
- 🟢 **Medium Priority** - Can be scheduled for next sprint
- 🔵 **Low Priority** - Nice to have, can be deferred
- ✅ **Completed** - Implemented and tested
- 🚧 **In Progress** - Currently being worked on
- 📋 **Documented** - Patch file created, ready for implementation

---

## Critical Priority Issues (🔴)

### 🔴 PATCH-UPDATE-01: Change "Gates" to "Doors"
- **File**: `src/pages/Index.tsx` (line 216)
- **Status**: 📋 Documentation Created - Ready for Implementation
- **Time**: 30 seconds
- **Description**: Update hero section text to say "through the doors at" instead of "through the gates at"
- **Patch File**: `PATCHES/PATCH-UPDATE-01-critical-gates-to-doors.md`

### 🔴 PATCH-UPDATE-02: Update Costume Contest Prizes
- **Files**: `src/pages/Costumes.tsx`, `src/pages/About.tsx`
- **Status**: 📋 Documentation Created - Ready for Implementation
- **Time**: 2 minutes
- **Description**: 
  - Keep "Most Twisted" title, change icon to 💀
  - Change "Best Original Fairytale Character" → "Master Storyteller" with 📜 icon
- **Patch File**: `PATCHES/PATCH-UPDATE-02-critical-costume-prizes.md`

---

## High Priority Issues (🟡)

### 🟡 PATCH-UPDATE-03: Add Navigation Hyperlinks to Admin Gallery Management
- **File**: `src/components/admin/GalleryManagement.tsx`
- **Status**: 📋 Documentation Created - Ready for Implementation
- **Time**: 10 minutes
- **Description**: Add anchor navigation with smooth scrolling between "Pending Photos" and "Approved Photos" sections
- **Patch File**: `PATCHES/PATCH-UPDATE-03-high-admin-gallery-navigation.md`

### 🟡 PATCH-UPDATE-04: Update Your Hosts Section on About Page
- **File**: `src/pages/About.tsx` (lines 40-50)
- **Status**: 📋 Documentation Created - Ready for Implementation
- **Time**: 2 minutes
- **Description**: Update host description to emphasize legendary status and end with Wonderland question
- **Patch File**: `PATCHES/PATCH-UPDATE-04-high-update-hosts-section.md`

---

## Medium Priority Issues (🟢)

### 🟢 PATCH-UPDATE-05: Add Image Lightbox to Admin Vignette Management
- **File**: `src/components/admin/VignetteManagementTab.tsx`
- **Status**: 📋 Documentation Created - Ready for Implementation
- **Time**: 20 minutes
- **Description**: Add "View Full Size" button at top of metadata fields that opens PhotoLightbox. Mobile-adaptive with proper stacking.
- **Patch File**: `PATCHES/PATCH-UPDATE-05-medium-vignette-lightbox.md`

### 🟢 PATCH-UPDATE-06: Add Individual Save/Reset for Each Vignette
- **File**: `src/components/admin/VignetteManagementTab.tsx`
- **Status**: 📋 Documentation Created - Ready for Implementation
- **Time**: 45 minutes
- **Description**: Major refactor to track changes per-vignette. Remove global "Save All Changes" and add individual Save/Reset per card.
- **Patch File**: `PATCHES/PATCH-UPDATE-06-medium-individual-vignette-save.md`
- **Breaking Changes**: Significant state management refactor

---

## Low Priority Issues (🔵)

### 🔵 PATCH-UPDATE-07: Add Admin Tab for Signature Libations Management
- **Files**:
  - NEW: `src/components/admin/LibationsManagement.tsx`
  - NEW: `src/lib/libations-api.ts`
  - NEW: `supabase/migrations/[timestamp]_create_signature_libations.sql`
  - MODIFY: `src/pages/AdminDashboard.tsx` - add new tab
  - MODIFY: `src/pages/Feast.tsx` - replace hardcoded array with DB query
- **Status**: 📋 Documentation Created - Awaiting Schema Confirmation
- **Time**: 90 minutes (after schema approval)
- **Description**: Create full CRUD admin interface for managing Signature Libations following VignetteManagement pattern
- **Patch File**: `PATCHES/PATCH-UPDATE-07-low-libations-management.md`
- **Blockers**: Need user confirmation on:
  1. Add `libation_type` field? (e.g., "cocktail", "mocktail", "punch")
  2. Store `image_url` (external link) or `photo_id` (gallery reference)?
  3. Add `serving_size` or `prep_notes` fields?

---

## In Progress Items (🚧)

### 🚧 Gallery Image URL Issues (Debugging)
- **File**: `src/pages/Gallery.tsx`
- **Status**: 🚧 In Progress - Diagnostic logging added
- **Description**: Investigating srcSet errors and image loading issues
- **Notes**: Added comprehensive logging and error handling

---

## Completed Items (✅)

### ✅ Fix Vignette Metadata Display and Admin Management
- **Priority**: 🟡 High
- **Status**: ✅ Completed
- **Completion Date**: October 11, 2025
- **Files**: `src/pages/Vignettes.tsx`, `src/components/admin/VignetteManagementTab.tsx`, `src/lib/image-url.ts`
- **Description**: Fixed vignette metadata updates from admin panel to display correctly on Vignettes page. Refactored to use `getPublicImageUrlSync` for efficient image loading. Added active status counter (X Active / Y Total) in admin. Changed default `is_active` to `false` for new vignettes.

### ✅ Add Lightbox Feature to Vignettes Page Carousel
- **Priority**: 🟡 High
- **Status**: ✅ Completed
- **Completion Date**: October 11, 2025
- **Files**: `src/pages/Vignettes.tsx`
- **Description**: Added PhotoLightbox functionality to Past Twisted Vignettes carousel for enlarged image viewing with navigation

### ✅ Fix Carousel Card Height Inconsistency
- **Priority**: 🟡 High
- **Status**: ✅ Completed
- **Completion Date**: October 11, 2025
- **Files**: `src/components/Carousel.tsx`
- **Description**: Fixed carousel cards to have consistent heights regardless of text content length

### ✅ Fix Costume Contest Time Discrepancy
- **Priority**: 🟡 High
- **Status**: ✅ Completed
- **Completion Date**: October 11, 2025
- **Files**: `src/pages/Costumes.tsx`
- **Description**: Updated costume contest time from 9:30 PM to 9:00 PM to match schedule

### ✅ Remove Potluck Suggestion Cards
- **Priority**: 🟡 High
- **Status**: ✅ Completed
- **Completion Date**: October 11, 2025
- **Files**: `src/pages/Feast.tsx`
- **Description**: Removed three potluck suggestion cards and hid "Contribution Requirements" title

### ✅ Update Signature Libations to Three Specific Recipes
- **Priority**: 🟡 High
- **Status**: ✅ Completed
- **Completion Date**: October 11, 2025
- **Files**: `src/pages/Feast.tsx`
- **Description**: Replaced six signature libations with three specific recipes

### ✅ Change Vegan to Vegetarian
- **Priority**: 🟡 High
- **Status**: ✅ Completed
- **Completion Date**: October 11, 2025
- **Files**: `src/pages/Feast.tsx`
- **Description**: Updated dietary selection to show "Vegetarian" instead of "Vegan"

---

## Implementation Order

**Batch 1 - Critical (Quick Wins):**
1. PATCH-UPDATE-01: Change "Gates" to "Doors" (30 seconds)
2. PATCH-UPDATE-02: Update Costume Contest Prizes (2 minutes)

**Batch 2 - High Priority:**
3. PATCH-UPDATE-03: Add Navigation to Admin Gallery (10 minutes)
4. PATCH-UPDATE-04: Update Hosts Section (2 minutes)

**Batch 3 - Medium Priority:**
5. PATCH-UPDATE-05: Add Vignette Lightbox (20 minutes)
6. PATCH-UPDATE-06: Individual Vignette Save/Reset (45 minutes)

**Batch 4 - Low Priority (Requires Approval):**
7. PATCH-UPDATE-07: Libations Management (90 minutes after schema confirmed)

---

*Last Updated: October 11, 2025*
*Maintained by: Lovable AI*

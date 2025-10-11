# Patches and Updates Tracker

## Overview
This document tracks all patches, updates, and fixes that need to be implemented in the Twisted Hearth Foundation project.

## Status Legend
- 🔴 **Critical** - Must be fixed immediately
- 🟡 **High Priority** - Should be addressed soon
- 🟢 **Medium Priority** - Can be scheduled for next sprint
- 🔵 **Low Priority** - Nice to have, can be deferred
- ✅ **Completed** - Implemented and tested
- 🚧 **In Progress** - Currently being worked on

---

## Critical Issues (🔴)

### [Issue Title]
- **Priority:** 🔴 Critical
- **Status:** Pending
- **Description:** 
- **Files Affected:** 
- **Estimated Time:** 
- **Dependencies:** 
- **Notes:** 

---

## High Priority Issues (🟡)

### Add Image Lightbox to Admin Vignette Management
- **Priority:** 🟢 Medium
- **Status:** Pending
- **Description:** Add clickable lightbox functionality to vignette images in admin management to allow full-size viewing while editing vignette details
- **Files Affected:** 
  - `src/components/admin/VignetteManagementTab.tsx` or related vignette admin component
- **Estimated Time:** 1-2 hours
- **Dependencies:** PhotoLightbox component (already exists)
- **Notes:** 
  - Make vignette thumbnail images clickable in admin interface
  - Open images in lightbox modal at native size/resolution
  - Allow easy close functionality to return to editing
  - Reuse existing PhotoLightbox component from gallery
  - Maintain current thumbnail display for quick reference
  - Improve admin UX for reviewing vignette images during editing

### Add Individual Save/Reset for Each Vignette in Admin Management
- **Priority:** 🟡 High
- **Status:** Pending
- **Description:** Replace the global "Save All Changes" and "Reset" buttons with individual save/reset controls for each vignette in the admin vignettes management section
- **Files Affected:** 
  - `src/components/admin/VignetteManagementTab.tsx` or related vignette admin component
- **Estimated Time:** 2-3 hours
- **Dependencies:** Database update logic, state management refactoring
- **Notes:** 
  - Remove global "Save All Changes" and "Reset" buttons
  - Add individual "Save" and "Reset" buttons for each vignette item
  - Allow independent saving/resetting of individual vignette data
  - Maintain proper state management for each vignette separately
  - Include loading states and success/error feedback for each vignette
  - Improve UX by allowing partial updates without affecting other vignettes

### Add Navigation Hyperlinks to Admin Gallery Management
- **Priority:** 🟢 Medium
- **Status:** Pending
- **Description:** Add navigation hyperlinks in admin Gallery Management to improve mobile viewing experience when scrolling through large photo collections
- **Files Affected:** 
  - `src/components/admin/GalleryManagement.tsx` or related admin gallery component
- **Estimated Time:** 45-60 minutes
- **Dependencies:** None
- **Notes:** 
  - Add hyperlinks under "Gallery Management" section to jump to:
    - "Pending Photos" section
    - "Approved Photos" section
  - Add "Back to Top" or "Back to Gallery Management" hyperlinks under each photo section title
  - Add "Back to Top" hyperlink at the end of photo lists for easy navigation
  - Particularly helpful for mobile users scrolling through many photos
  - Should use smooth scrolling behavior for better UX

### Change "Gates" to "Doors" on Home Page Start Time
- **Priority:** 🟢 Medium
- **Status:** Pending
- **Description:** Update the home page 6:30 PM start time text from "Gates open at twilight" to "Doors open at twilight"
- **Files Affected:** 
  - `src/pages/Index.tsx` (6:30 PM start time section)
- **Estimated Time:** 5-10 minutes
- **Dependencies:** None
- **Notes:** 
  - Simple text change from "Gates" to "Doors"
  - Maintains consistency with indoor event setting
  - Located in the start time section under 6:30 PM

### Update Costume Contest Prizes to Match About Page
- **Priority:** 🟡 High
- **Status:** Pending
- **Description:** Update the costume contest prizes on the costumes page to match the About page description: "most creative, most twisted, and best original fairytale character"
- **Files Affected:** 
  - `src/pages/Costumes.tsx` (Costume Contest Prizes section at bottom)
- **Estimated Time:** 30-45 minutes
- **Dependencies:** None
- **Notes:** 
  - Keep "Most Creative Twist" award (🏆 icon)
  - Replace "Best Original Character" with "Most Twisted" - needs creative title and new icon
  - Replace "Most Topical" with "Best Original Fairytale Character" - needs creative title and new icon
  - Update descriptions to match the twisted fairytale theme
  - Choose creative icons that fit the Halloween/twisted theme
  - Ensure consistency between About page and Costumes page

### Update Your Hosts Section on About Page
- **Priority:** 🟡 High
- **Status:** Pending
- **Description:** Update the "Your Hosts" section on the About page with new content about Jamie & Kat Ruth's hosting history and this year's Alice-influenced theme
- **Files Affected:** 
  - `src/pages/About.tsx` (Your Hosts section)
- **Estimated Time:** 15-30 minutes
- **Dependencies:** None
- **Notes:** 
  - Replace existing host description with new text about legendary Halloween celebrations
  - Emphasize their attention to detail and commitment to Halloween experience
  - Highlight this year's Alice-influenced fairytale theme as most ambitious yet
  - Include mention of new vignettes, added decor, and surprises
  - End with Wonderland/madness theme question

### Add Admin Tab for Signature Libations Management
- **Priority:** 🟡 High
- **Status:** 🚧 In Progress
- **Description:** Create an admin console tab to allow dynamic management of signature libations (add, edit, delete recipes)
- **Files Affected:** 
  - `src/pages/AdminDashboard.tsx` (add new tab)
  - `src/components/admin/LibationsManagement.tsx` (new component)
  - Database: Create `signature_libations` table
- **Estimated Time:** 4-6 hours
- **Dependencies:** Database table creation, admin permissions
- **Notes:** 
  - Should follow existing admin tab pattern
  - Include CRUD operations for libations
  - Maintain recipe format (name, description, ingredients)
  - Consider image upload for future enhancement

---

## Medium Priority Issues (🟢)

### [Issue Title]
- **Priority:** 🟢 Medium
- **Status:** Pending
- **Description:** 
- **Files Affected:** 
- **Estimated Time:** 
- **Dependencies:** 
- **Notes:** 

---

## Low Priority Issues (🔵)

### [Issue Title]
- **Priority:** 🔵 Low
- **Status:** Pending
- **Description:** 
- **Files Affected:** 
- **Estimated Time:** 
- **Dependencies:** 
- **Notes:** 

---

## Completed Items (✅)

### Add Lightbox Feature to Vignettes Page Carousel
- **Priority:** 🟡 High
- **Status:** ✅ Completed
- **Description:** Added the same Lightbox functionality from the gallery page to the Past Twisted Vignettes carousel for enlarged image viewing with navigation
- **Files Affected:** 
  - `src/pages/Vignettes.tsx` (lines 10-11, 16-17, 142-164, 260, 309, 345-351)
- **Completion Date:** October 11, 2025
- **Notes:** 
  - Imported PhotoLightbox component and Photo type from gallery
  - Added lightbox state management (lightboxOpen, lightboxIndex)
  - Created conversion function to transform vignettes to Photo format for lightbox
  - Added handleVignetteClick function to open lightbox with correct image
  - Updated both carousel and static grid Card onClick handlers
  - Rendered PhotoLightbox component with proper props
  - Now users can click any vignette image to view it in full-screen with navigation arrows

### Fix Carousel Card Height Inconsistency
- **Priority:** 🟡 High
- **Status:** ✅ Completed
- **Description:** Fixed carousel cards to have consistent heights regardless of text content length
- **Files Affected:** 
  - `src/components/Carousel.tsx` (lines 75, 76, 87, 91)
- **Completion Date:** October 11, 2025
- **Notes:** 
  - Added `h-full flex flex-col` to main card container for consistent height
  - Added `flex-shrink-0` to image container to prevent compression
  - Added `flex-grow flex flex-col` to text container for proper expansion
  - Added `flex-grow` to description paragraph to fill remaining space
  - All cards now maintain uniform height regardless of description length

### Fix Costume Contest Time Discrepancy
- **Priority:** 🟡 High
- **Status:** ✅ Completed
- **Description:** Updated costume contest time from 9:30 PM to 9:00 PM to match the schedule page timing
- **Files Affected:** 
  - `src/pages/Costumes.tsx` (line 217)
- **Completion Date:** October 11, 2025
- **Notes:** 
  - Schedule page shows "Costume Court" at 9:00 PM
  - Costumes page was incorrectly showing 9:30 PM
  - Now both pages are consistent with 9:00 PM timing

### Remove Potluck Suggestion Cards and Contribution Requirements Title
- **Priority:** 🟡 High
- **Status:** ✅ Completed
- **Description:** Removed the three potluck suggestion cards (Appetizers, Main Dishes, Desserts) and hid the "Contribution Requirements" title while keeping the content intact
- **Files Affected:** 
  - `src/pages/Feast.tsx` (lines 543-548, 546-548)
- **Completion Date:** October 11, 2025
- **Notes:** 
  - Removed grid with three category cards completely
  - Commented out "Contribution Requirements" title for potential future restoration
  - Kept all dietary information and icon system intact
  - Added comment for easy restoration if needed

### Update Signature Libations to Three Specific Recipes
- **Priority:** 🟡 High
- **Status:** ✅ Completed
- **Description:** Replaced the six signature libations with three specific recipes: Poisoned Apple, Blood Wine of the Beast, and The Enchanted Bramble
- **Files Affected:** 
  - `src/pages/Feast.tsx` (lines 229-245)
- **Completion Date:** October 11, 2025
- **Notes:** 
  - Updated from 6 cocktails to 3 specific recipes as requested
  - Hard-coded for now, admin management planned for future
  - Maintained existing UI structure and styling

### Change Vegan to Vegetarian in Feast Page Dietary Selection
- **Priority:** 🟡 High
- **Status:** ✅ Completed
- **Description:** Updated the dietary information selection on the Feast page to show "Vegetarian" instead of "Vegan" for the plant-based option
- **Files Affected:** 
  - `src/pages/Feast.tsx` (lines 461, 517, 665)
- **Completion Date:** October 11, 2025
- **Notes:** 
  - Updated checkbox label text from "Vegan" to "Vegetarian"
  - Updated tooltip text for the plant emoji icon
  - Updated confirmation dialog text
  - Variable names and backend logic remain unchanged (still uses `isVegan` state)

---

## In Progress Items (🚧)

### [Issue Title]
- **Priority:** [Priority Level]
- **Status:** 🚧 In Progress
- **Description:** 
- **Files Affected:** 
- **Assigned To:** 
- **Started Date:** 
- **Expected Completion:** 
- **Notes:** 

---

## Backlog / Future Considerations

### [Future Enhancement Title]
- **Type:** Enhancement/Feature/Refactor
- **Description:** 
- **Potential Impact:** 
- **Notes:** 

---

## Patch History

### Version [X.X.X] - [Date]
- **Patches Applied:**
  - [Patch Name] - [Brief Description]
- **Issues Resolved:**
  - [Issue Reference] - [Brief Description]

---

## Notes and References

- **Related Documents:**
  - [Link to relevant documentation]
- **External Resources:**
  - [Links to external references]
- **Decision Log:**
  - [Important decisions made during implementation]

---

*Last Updated: [Date]*
*Maintained by: [Your Name]*

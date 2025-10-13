# Hotfixes & Features Master Tracker

**Created**: October 13, 2025  
**Status**: Planning Phase  
**Total Items**: 28 (27 original + 1 new)  
**Priority Framework**: Critical → High → Medium → Low  
**Categorization**: Type + Area  
**Implementation Order**: Quick Wins → Critical Bugs → Mobile UX → Feature Projects

---

## 📊 Quick Overview

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 2 | 📋 Planning |
| 🟡 High | 5 | 📋 Planning |
| 🟢 Medium | 7 | 📋 Planning |
| 🔵 Low | 3 | 📋 Planning |
| 🎯 Feature Projects | 5 | 📋 Planning (Phased) |
| 🆕 New Discovery | 1 | 📋 Planning |

**Implementation Strategy**: Quick Wins First → Critical Bugs → Mobile UX → Features (Phased)

---

## 📋 Item Master List

### 🎨 **UI/UX Issues (11 items)**

#### **Item 1: Vignettes Page Mobile Scroll**
**Status**: ✅ COMPLETE  
**Priority**: 🟡 HIGH  
**Type**: Bug Fix + Enhancement  
**Area**: Frontend/UX/Mobile  

**Description**: Fixed vignettes carousel to scroll one image at a time with arrow buttons, ensuring all photos are reachable.

**Original Issue**: On desktop with 3 photos showing, arrows would skip photos 4 & 5  
**Solution Implemented**:
- Fixed `maxIndex = displayVignettes.length - 1` (was `length - itemsPerView`)
- Added CSS scroll-snap for smooth scrolling
- Arrows now always move exactly 1 photo at a time
- All photos reachable on all screen sizes

**Implementation**: Lovable AI (L-R-3.1.md) - Batch 3  
**Verification**: Complete code review - all changes verified  
**Files Modified**: `Vignettes.tsx`, `index.css`  
**Completion Date**: October 13, 2025

**Dependencies**: None  
**Complexity**: MEDIUM (JavaScript + CSS)

---

#### **Item 2: Page Top Spacing**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Bug/Enhancement  
**Area**: Frontend/UX

**Description**: Add spacing from the top of each page to the navigation bar.

**Current Behavior**: Content too close to nav  
**Desired Behavior**: Proper spacing between nav and content

**Dependencies**: None  
**Estimated Complexity**: Low

---

#### **Item 3: Footer Website Link**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/UX

**Description**: Put the full subdomain website for this year and a reference link to last year in the footer.

**Current Behavior**: Missing website links  
**Desired Behavior**: Full subdomain + last year's link

**Dependencies**: None  
**Estimated Complexity**: Low

---

#### **Item 4: Footer Height Reduction**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Enhancement  
**Area**: Frontend/UX

**Description**: Narrow down or reduce the height of the footer - there's a lot of extra space.

**Current Behavior**: Footer too tall with excess spacing  
**Desired Behavior**: Compact footer with better spacing

**Dependencies**: None  
**Estimated Complexity**: Low

---

#### **Item 5: Footer Icons Update**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Enhancement  
**Area**: Frontend/Design

**Description**: Change the footer three icons to something more colorful and fun and Halloweenish.

**Current Behavior**: Generic icons  
**Desired Behavior**: Halloween-themed colorful icons

**Dependencies**: Item 4 (footer work)  
**Estimated Complexity**: Low

---

#### **Item 7: Error Message Spacing**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Bug  
**Area**: Frontend/UX

**Description**: The error message for "something went wrong" on page loading needs more spacing between that and the nav bar.

**Current Behavior**: Error message too close to nav  
**Desired Behavior**: Proper spacing from nav

**Dependencies**: Item 2 (general spacing)  
**Estimated Complexity**: Low

---

#### **Item 10: Admin User Engagement Card Outlines**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Bug  
**Area**: Frontend/Admin

**Description**: In the admin panel overview, user engagement has two cards that aren't outlined.

**Current Behavior**: Missing card borders on 2 cards  
**Desired Behavior**: All cards properly outlined

**Dependencies**: None  
**Estimated Complexity**: Low

---

#### **Item 11: Admin RSVP Card Outline**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Bug  
**Area**: Frontend/Admin

**Description**: In admin RSVP section, one card is not outlined.

**Current Behavior**: Missing border on 1 card  
**Desired Behavior**: Card properly outlined

**Dependencies**: Item 10 (similar issue)  
**Estimated Complexity**: Low

---

#### **Item 20: Email Campaign Mobile Popup**
**Status**: ✅ COMPLETE  
**Priority**: 🟢 MEDIUM  
**Type**: Bug Fix  
**Area**: Frontend/Mobile/Admin

**Description**: Fixed email campaign verification popup to be fully visible on mobile devices (down to 320px width).

**Original Issue**: Popup partially off-screen on small mobile devices  
**Solution Implemented**:
- Added `max-w-[calc(100vw-32px)]` for viewport-aware width
- Added `mx-4` for mobile padding (16px from edges)
- Maintained `sm:max-w-md` for desktop
- Fixed both confirmation dialogs

**Implementation**: Lovable AI (L-R-3.1.md) - Batch 3  
**Verification**: Complete code review - all changes verified  
**Files Modified**: `EmailCommunication.tsx`  
**Completion Date**: October 13, 2025

**Dependencies**: None  
**Complexity**: LOW (CSS-only fix)

---

#### **Item 21: Page Width Consistency**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Bug  
**Area**: Frontend/Responsive

**Description**: On wider screens, pages are slightly wider than desired - want to keep page within bounds of the header.

**Current Behavior**: Content extends beyond header width  
**Desired Behavior**: Content constrained to header width

**Dependencies**: None  
**Estimated Complexity**: Medium

---

#### **Item 23: Vignettes Page Flash**
**Status**: ✅ COMPLETE  
**Priority**: 🟡 HIGH  
**Type**: Bug Fix  
**Area**: Frontend/Performance/UX

**Description**: Fixed flash of old/fallback content on vignettes page load with proper loading states.

**Original Issue**: Fallback data briefly visible before real data loads  
**Solution Implemented**:
- Added loading skeleton with 3 animated placeholder cards
- Added early return in useEffect to prevent fallback during loading
- Added conditional rendering (only show carousel when data ready)
- Added error state handling
- Added empty state handling

**Implementation**: Lovable AI (L-R-3.1.md) - Batch 3  
**Verification**: Complete code review - all changes verified  
**Files Modified**: `Vignettes.tsx`  
**Completion Date**: October 13, 2025

**UX Improvements**:
- No more jarring flash on page load
- Professional loading experience
- Clear error and empty states

**Dependencies**: None  
**Complexity**: MEDIUM (state management)

---

### 🖼️ **Gallery Features (4 items)**

#### **Item 6: Gallery Loading Issues**
**Status**: ✅ COMPLETE  
**Priority**: 🔴 CRITICAL  
**Type**: Bug Fix  
**Area**: Frontend/Performance

**Description**: Fixed gallery freezing in Edge browser with comprehensive performance optimizations.

**Original Issue**: Gallery froze on Kat's phone (Edge mobile)  
**Solution Implemented**: 
- IntersectionObserver for lazy loading
- Edge-specific CSS optimizations
- Throttled resize listeners
- Memory cleanup on unmount
- Performance monitoring

**Implementation**: Lovable AI (L-R-2.2.md) - Combined with Item 24  
**Verification**: Complete code review - all changes verified  
**Files Modified**: 5 files (4 modified, 1 new: useLazyImage.ts)  
**Completion Date**: October 13, 2025

**Dependencies**: Item 24 (implemented together)  
**Complexity**: HIGH (6-phase implementation)

---

#### **Item 8: Gallery User Photo Upload**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Backend/Database

**Description**: For gallery images, need to add the ability to add icons and pictures by the users.

**Current Behavior**: Admin-only photo uploads  
**Desired Behavior**: Users can upload photos

**Dependencies**: Database schema, storage, permissions  
**Estimated Complexity**: High

---

#### **Item 9: Gallery View Mode**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/UX

**Description**: Need to add a link to a page for the user to just view all images in a gallery view or be able to switch over to gallery view.

**Current Behavior**: Single view mode  
**Desired Behavior**: Toggle between view modes

**Dependencies**: None  
**Estimated Complexity**: Medium

---

#### **Item 24: Gallery Loading Optimization**
**Status**: ✅ COMPLETE  
**Priority**: 🔴 CRITICAL  
**Type**: Performance Enhancement  
**Area**: Frontend/Performance

**Description**: Comprehensive gallery performance optimization with pagination, lazy loading, and Edge browser fixes.

**Original Issue**: All 100+ images loaded simultaneously causing 10s load times and >200MB memory  
**Solution Implemented**:
- Database pagination (20 photos per page)
- IntersectionObserver lazy loading
- "Load More" buttons with progress indicators
- Edge-specific optimizations
- Performance monitoring and logging

**Implementation**: Lovable AI (L-R-2.2.md) - Combined with Item 6  
**Verification**: Complete code review - all 6 phases verified  
**Files Modified**: 5 files (photo-api.ts, PhotoCard.tsx, Gallery.tsx, index.css, useLazyImage.ts)  
**Completion Date**: October 13, 2025

**Performance Improvements**:
- Load Time: 10s → <2s (target)
- Memory: 250MB → <80MB (target)
- Initial Photos: 100+ → 20 (progressive)

**Dependencies**: Item 6 (implemented together)  
**Complexity**: HIGH (6-phase implementation)

---

### 🎯 **Admin Panel Features (7 items)**

#### **Item 12: Admin Footer Information**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Admin

**Description**: In admin panel, add a footer with directions on how to use the panel, updates, bug list, or last patch information.

**Current Behavior**: No admin footer with info  
**Desired Behavior**: Informative footer with version, updates, help

**Dependencies**: Item 27 (version numbering)  
**Estimated Complexity**: Medium

---

#### **Item 13: Admin Menu Reorganization**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Enhancement/UX  
**Area**: Frontend/Admin

**Description**: Reorganize groupings in admin panel menus - for example, database reset should probably be in settings not users.

**Current Behavior**: Menu items in wrong categories  
**Desired Behavior**: Logical menu organization

**Dependencies**: None  
**Estimated Complexity**: Low

---

#### **Item 14: Database Reset Implementation**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Backend/Database/Admin

**Description**: In admin panel under database reset, there's nothing there - need to build that out.

**Current Behavior**: Empty/non-functional  
**Desired Behavior**: Functional database reset tool

**Dependencies**: Security considerations, rollback strategy  
**Estimated Complexity**: High

---

#### **Item 19: Gallery Vignette Selection Lock**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature/UX  
**Area**: Frontend/Admin

**Description**: In admin gallery page, when a vignette is selected from gallery photos, gray out the description and block input, with note that it will be removed and needs to be modified in vignette section.

**Current Behavior**: Description editable when assigned to vignette  
**Desired Behavior**: Locked with informative note

**Dependencies**: None  
**Estimated Complexity**: Medium

---

#### **Item 16: Email Campaign Variable Fields**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Backend/Admin

**Description**: In email campaigns, anywhere there's a specific type of comment that needs to be added, include a field to fill out for that variable or make it a variable with field in campaign form.

**Current Behavior**: Manual variable editing  
**Desired Behavior**: Dynamic variable fields in form

**Dependencies**: Email template structure  
**Estimated Complexity**: Medium

---

#### **Item 17: Email Campaign Reuse**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Backend/Admin

**Description**: Add feature where prior campaigns can be opened up with fields filled out to send again (repeat/repost campaign).

**Current Behavior**: Must recreate campaigns manually  
**Desired Behavior**: Reuse/clone past campaigns

**Dependencies**: Item 16 (campaign variables)  
**Estimated Complexity**: Medium

---

#### **Item 27: Version Numbering**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Admin/Documentation

**Description**: Add detailed updates, patches, and information for admin view only about the website with version number attached.

**Current Behavior**: No version tracking visible  
**Desired Behavior**: Version info in admin panel

**Dependencies**: Item 12 (admin footer)  
**Estimated Complexity**: Low

---

### 📧 **Email System (2 items)**

#### **Item 15: Email Template Verification**
**Status**: ✅ COMPLETE  
**Priority**: 🔴 CRITICAL  
**Type**: Bug Fix  
**Area**: Backend/Email

**Description**: Fixed critical incorrect event date/time/address in all email templates.

**Original Issue**: Emails showing October 18, 7:00 PM, Denver  
**Fixed To**: Friday, November 1st, 2025, 6:30 PM, 1816 White Feather Drive, Longmont, CO 80504

**Implementation**: Lovable AI (L-R-2.1.md)  
**Verification**: Complete code review - all 13 changes verified  
**Files Modified**: 10 files (4 critical edge functions, 1 admin UI, 5 templates, 2 docs)  
**Completion Date**: October 13, 2025

**Dependencies**: None  
**Complexity**: LOW (text-only changes)

---

#### **Item 18: Email Template Migration**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Enhancement/Feature  
**Area**: Backend/Email

**Description**: The details and structure of email templates in the website are better than what's being sent from Supabase - see if we can migrate those to website for better control.

**Current Behavior**: Supabase edge function templates  
**Desired Behavior**: Website-hosted templates with better control

**Dependencies**: Email infrastructure  
**Estimated Complexity**: High

---

### 📱 **Mobile Features (2 items)**

#### **Item 22: Mobile Swipe Navigation**
**Status**: ✅ COMPLETE  
**Priority**: 🟡 HIGH  
**Type**: Enhancement  
**Area**: Frontend/Mobile/UX

**Description**: Fixed mobile swipe navigation to follow correct page order and stop at boundaries (no wraparound, no app closing).

**Original Issue**: Swipe used wrong page order and wrapped around endlessly  
**Solution Implemented**:
- Fixed `PAGE_ORDER`: /, /vignettes, /schedule, /gallery, /discussion, /costumes, /rsvp
- Removed `/about`, `/feast`, `/contact` from swipe navigation
- Fixed boundary behavior: stops at `/` (left) and `/rsvp` (right)
- No more wraparound
- App no longer closes when swiping past homepage

**Implementation**: Lovable AI (L-R-3.1.md) - Batch 3  
**Verification**: Complete code review - all changes verified  
**Files Modified**: `SwipeNavigator.tsx`  
**Completion Date**: October 13, 2025

**Dependencies**: None (infrastructure already existed)  
**Complexity**: MEDIUM (touch event handling)

---

#### **Item 26: Share Link/QR Code**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Mobile

**Description**: Add share link or QR code to copy website URL or generate QR code for scanning. Can we make our own QR code or use third party?

**Current Behavior**: No share functionality  
**Desired Behavior**: Share link + QR code generator

**Dependencies**: None  
**Estimated Complexity**: Low

---

### 🔔 **User Features (1 item)**

#### **Item 25: User Notification Settings**
**Status**: 📋 Planning  
**Priority**: TBD  
**Type**: Feature  
**Area**: Frontend/Backend/Database

**Description**: For user's view, add settings where they can choose the type of notifications to get on updates to discussion, gallery, or annual newsletter.

**Current Behavior**: No user notification preferences  
**Desired Behavior**: Granular notification settings

**Dependencies**: Database schema, notification system  
**Estimated Complexity**: High

---

#### **Item 28: Guestbook Contributors Card Outline** (NEW - Discovered during implementation)
**Status**: 📋 Planning  
**Priority**: 🟢 MEDIUM  
**Type**: Bug  
**Area**: Frontend/Admin

**Description**: In admin Guestbook Activity widget, the "Contributors" metric card is missing its border/outline.

**Current Behavior**: Missing border on Contributors card  
**Desired Behavior**: Card properly outlined with gradient and icon

**Dependencies**: Item 10, 11 (same issue)  
**Estimated Complexity**: Low

---

## 📊 Grouping Analysis

### **Potential Batch Groups**:

**Group A: Footer Improvements** (Low complexity, quick wins)
- Item 3: Footer website link
- Item 4: Footer height reduction
- Item 5: Footer icons update

**Group B: Admin Panel UX** (Related admin improvements)
- Item 10: User engagement card outlines
- Item 11: RSVP card outline
- Item 12: Admin footer information
- Item 13: Admin menu reorganization
- Item 27: Version numbering

**Group C: Spacing & Layout** (CSS/styling fixes)
- Item 2: Page top spacing
- Item 7: Error message spacing
- Item 21: Page width consistency

**Group D: Gallery Performance** (Related gallery issues)
- Item 6: Gallery loading issues
- Item 24: Gallery loading optimization

**Group E: Email Campaign Features** (Email system)
- Item 15: Email template verification
- Item 16: Campaign variable fields
- Item 17: Campaign reuse feature
- Item 18: Template migration

**Group F: Mobile UX** (Mobile-specific)
- Item 1: Vignettes mobile scroll
- Item 20: Email campaign mobile popup
- Item 22: Mobile swipe navigation

**Group G: Gallery Features** (New gallery functionality)
- Item 8: User photo upload
- Item 9: Gallery view mode
- Item 19: Vignette selection lock

**Group H: Standalone Items** (Complex/unique)
- Item 14: Database reset implementation
- Item 23: Vignettes page flash
- Item 25: User notification settings
- Item 26: Share link/QR code

---

## 🎯 Next Steps

1. ✅ Master list created
2. ⏳ Review and validate each item
3. ⏳ Assign priorities (Critical/High/Medium/Low)
4. ⏳ Design solutions for each item
5. ⏳ Create detailed implementation plans
6. ⏳ Generate Lovable-ready prompts
7. ⏳ Execute in priority order

---

## 📝 Notes

- **Testing Strategy**: All items will include test plans
- **Rollback Strategy**: Critical items will include rollback procedures
- **Documentation**: All changes will be documented in tracker
- **Mobile First**: Ensure all changes are mobile-responsive
- **Accessibility**: Maintain WCAG compliance
- **Design Consistency**: Follow existing design system
- **Analytics**: Add tracking for new features where appropriate

---

**Status**: 📋 Ready for detailed planning phase


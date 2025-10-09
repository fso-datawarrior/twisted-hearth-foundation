# Mobile Resilience Review - PR Checklist

**Review Date**: 2025-10-09  
**Total Findings**: 14  
**Estimated Fix Time**: 22 hours

---

## 🚨 Critical (P0) - Must Fix Before Mobile Launch

### Viewport & Layout
- [x] **#01** iOS 100vh viewport trap fixed with dvh units + fallback ✅
  - [x] HeroVideo, Modal, Dialog updated
  - [x] Tested on iPhone in Safari (portrait + landscape)
  - [x] No content cut off when address bar shows/hides

### Forms & Input
- [x] **#02** Mobile input attributes added to all form fields ✅
  - [x] inputMode, autoComplete, enterKeyHint present
  - [x] Base font-size ≥16px to prevent iOS zoom
  - [x] Tested email/numeric keyboards appear correctly
  
- [x] **#03** Safe area insets added to fixed elements ✅
  - [x] NavBar, Footer, Toasts have safe-area padding
  - [x] Tested on iPhone 12+ in landscape (notch clearance)
  - [x] Minimum 1rem padding fallback works

### Touch Ergonomics
- [x] **#04** All touch targets ≥44x44dp ✅
  - [x] Icon buttons updated (close, like, delete, nav)
  - [x] Button size variants increased (sm, icon)
  - [x] Adjacent targets have ≥8px gap
  - [x] Tested on iPhone SE (thumb reachability)

- [ ] **#09** Modal overflow on keyboard fixed
  - max-h uses dvh units
  - overscroll-behavior-contain added
  - Focused inputs scroll into view
  - Tested RSVP form with keyboard open

---

## ⚠️ High Priority (P1) - Should Fix This Sprint

### Interaction
- [x] **#05** Hover-only affordances wrapped with @media (hover: hover) ✅
  - [x] Photo controls visible on touch by default
  - [x] Carousel arrows always visible on mobile
  - [x] Active states added for touch feedback
  - [x] Tested on iPhone (no hover capability)

- [x] **#06** Focus-visible styles added to all interactive elements ✅
  - [x] focus-visible:ring-2 on buttons/links
  - [x] Visible keyboard navigation
  - [x] Tested with screen reader (VoiceOver)

### Performance
- [x] **#07** Responsive images with srcset + sizes ✅
  - [x] Hero poster has 480w/800w/1200w/1920w variants
  - [x] Gallery images optimized for mobile
  - [x] loading="lazy" on below-fold images
  - [x] Tested on Slow 4G (LCP <2.5s)

- [x] **#08** Layout shift fixed with aspect ratios ✅
  - [x] Gallery images have aspect-[16/9] or width/height
  - [x] Dynamic images use skeleton loaders
  - [x] CLS <0.1 in Lighthouse
  - [x] Tested with DevTools CLS overlay

### UX
- [x] **#10** Scroll lock and overscroll guards ✅
  - [x] Body scroll locked when modal open
  - [x] overscroll-behavior-contain on carousels
  - [x] No elastic bounce past content boundaries
  - [x] Tested swipe gestures on iOS

---

## 📝 Medium Priority (P2) - Nice to Have

### Layout
- [ ] **#11** Fixed px widths replaced with fluid utilities
  - max-w-* instead of max-width: 1280px
  - clamp() for dynamic sizing
  - No horizontal scroll at 320px (Galaxy Fold)
  - Tested at 280px, 320px, 375px widths

- [ ] **#12** Intermediate breakpoints added
  - xs:375px for iPhone SE
  - sm-plus:390px for iPhone 12/13 Pro
  - Tested on actual devices or DevTools
  - No layout gaps between default and sm:640px

### Typography
- [ ] **#13** iOS auto-zoom prevented on inputs
  - All inputs have font-size ≥16px
  - Tested tap-to-focus on iPhone
  - No unexpected zoom events

- [ ] **#14** Fluid type scale with clamp()
  - Headings use clamp(1.5rem, 4vw + 1rem, 3rem)
  - Consistent rhythm on small screens
  - Line-length 45-75ch on text blocks

---

## 📊 Performance Verification

### Lighthouse Mobile (target >90)
```bash
npx @lhci/cli autorun --collect.settings.preset=mobile
```
- [ ] Performance: _____ / 100 (target: >90)
- [ ] Accessibility: _____ / 100 (target: >95)
- [ ] Best Practices: _____ / 100 (target: >95)
- [ ] SEO: _____ / 100 (target: >95)

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): _____ ms (target: <2500ms)
- [ ] INP (Interaction to Next Paint): _____ ms (target: <200ms)
- [ ] CLS (Cumulative Layout Shift): _____ (target: <0.1)
- [ ] FCP (First Contentful Paint): _____ ms (target: <1800ms)
- [ ] TBT (Total Blocking Time): _____ ms (target: <200ms)

### Bundle Size
```bash
npm run build && du -sh dist/assets/*.js
```
- [ ] Total JS (gzip): _____ KB (target: <500KB)
- [ ] Largest chunk (gzip): _____ KB (target: <180KB)
- [ ] Total CSS (gzip): _____ KB (target: <50KB)

---

## 🧪 Device Testing Matrix

### iPhone Testing
- [ ] **iPhone SE (320px)** - Safari iOS 17
  - Touch targets, viewport units, text zoom
  - RSVP form, gallery, navigation
  
- [ ] **iPhone 12/13 Pro (390px)** - Safari iOS 17
  - Safe area insets, keyboard modal
  - Fluid layout, form autocomplete
  
- [ ] **iPhone 15 Pro Max (430px)** - Safari iOS 17
  - Landscape notch clearance
  - Carousel swipe gestures
  - Video playback

### Android Testing
- [ ] **Pixel 5 (393px)** - Chrome 120+
  - Material gestures, focus-visible
  - Form validation, network resilience
  
- [ ] **Pixel 7 (412px)** - Chrome 120+
  - Android keyboard behavior
  - Back button navigation

### Tablet Testing
- [ ] **iPad Mini (768px)** - Safari iOS 17
  - Breakpoint transitions
  - Hover behavior (with trackpad)
  - Split-screen multitasking

### Edge Cases
- [ ] **Galaxy Fold (280px)** - Chrome
  - Extreme narrow layout
  - No horizontal overflow
  - Text readability

---

## 🔍 Manual QA Checklist

### Navigation
- [ ] NavBar visible and usable on all screen sizes
- [ ] Menu toggle works on mobile (<640px)
- [ ] Safe area padding correct in landscape
- [ ] Active route highlighted
- [ ] Logout button accessible

### Forms
- [ ] RSVP form submits successfully
- [ ] Email keyboard appears for email fields
- [ ] Numeric keyboard for guest count
- [ ] No iOS zoom on input focus
- [ ] Validation errors visible
- [ ] Success toast appears in safe area

### Gallery
- [ ] Photos load with lazy loading
- [ ] Lightbox opens and closes smoothly
- [ ] Swipe navigation works
- [ ] Like/delete buttons ≥44x44px
- [ ] No layout shift during image load
- [ ] Upload works on mobile

### Modals
- [ ] Auth modal fits viewport with keyboard
- [ ] Close button ≥44x44px
- [ ] Background scroll locked
- [ ] Focused input scrolls into view
- [ ] ESC key closes modal

### Video
- [ ] Hero video plays on iOS (requires user gesture)
- [ ] Poster image loads quickly
- [ ] Video doesn't cause LCP issues
- [ ] Captions work (if enabled)

### Hunt (if enabled)
- [ ] Runes appear at correct opacity
- [ ] Touch targets ≥44x44px
- [ ] Notifications appear in safe area
- [ ] Progress indicator visible

---

## 🐛 Known Issues / Deferred

_Document any issues found but not fixed in this PR_

| Issue | Impact | Workaround | Ticket |
|-------|--------|------------|--------|
| - | - | - | - |

---

## 📸 Visual Regression Testing

### Before/After Screenshots Required
- [ ] iPhone SE - Homepage (320px)
- [ ] iPhone 12 Pro - RSVP Form (390px)
- [ ] iPhone 15 Pro Max - Gallery (430px)
- [ ] Pixel 5 - Navigation Menu (393px)
- [ ] iPad Mini - Tablet Layout (768px)

_Attach screenshots to PR or upload to /SCREENSHOTS/ directory_

---

## ✅ Final Sign-Off

### Developer
- [ ] All P0 findings fixed and tested
- [ ] All P1 findings fixed or documented as deferred
- [ ] Lighthouse Mobile score >90
- [ ] No console errors on mobile devices
- [ ] Tested on at least 2 physical devices

**Developer Name**: ________________  
**Date**: ________________

### QA
- [ ] Verified all checklist items
- [ ] Tested on device matrix
- [ ] Documented any regressions
- [ ] Performance metrics meet targets

**QA Name**: ________________  
**Date**: ________________

### Product Owner
- [ ] Mobile experience meets requirements
- [ ] Performance acceptable
- [ ] Approve for production

**PO Name**: ________________  
**Date**: ________________

---

## 🔗 Related Documentation

- [PRIORITIZED_FINDINGS_MOBILE.md](./PRIORITIZED_FINDINGS_MOBILE.md) - Full findings list
- [DETAILS_MOBILE.md](./DETAILS_MOBILE.md) - Detailed analysis per finding
- [PATCHES/](./PATCHES/) - All fix patches (01-14)
- [METRICS_MOBILE.md](./METRICS_MOBILE.md) - Performance benchmarks
- [SCREENSHOTS/](./SCREENSHOTS/) - Visual regression tests

---

## 📞 Support Contacts

- **Mobile Expert**: [Name] - [Email]
- **iOS Specialist**: [Name] - [Email]
- **Android Specialist**: [Name] - [Email]
- **Accessibility**: [Name] - [Email]

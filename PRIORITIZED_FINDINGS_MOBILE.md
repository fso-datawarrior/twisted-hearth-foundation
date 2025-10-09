# Mobile Resilience Review - Prioritized Findings

**Review Date**: 2025-10-09  
**Focus**: Phone-first adaptive design (320px–430px), tablet baseline (768px+)  
**Scope**: Layout, touch ergonomics, iOS quirks, performance under mobile constraints

---

## Summary

| Priority | Count | Total Effort |
|----------|-------|--------------|
| P0 (Critical) | 5 | 10 hours |
| P1 (High) | 5 | 7 hours |
| P2 (Medium) | 4 | 5 hours |
| **Total** | **14** | **22 hours** |

---

## Findings Table

| ID | Title | Severity | Likelihood | Area | Evidence | Fix Summary | Effort |
|----|-------|----------|------------|------|----------|-------------|--------|
| 01 | iOS 100vh Viewport Trap | CRITICAL | 5/5 | Layout | `src/components/HeroVideo.tsx:70`<br>`src/components/Modal.tsx:105`<br>All `min-h-screen` usage | Replace `vh` with `dvh` + fallback using Tailwind supports variant | M (2h) |
| 02 | Missing Mobile Input Attributes | HIGH | 5/5 | Forms/Touch | `src/components/FormField.tsx`<br>`src/pages/RSVP.tsx:721-740`<br>`src/components/ui/input.tsx` | Add `inputMode`, `autoComplete`, `enterKeyHint` to all form inputs | M (2h) |
| 03 | Safe Area Inset Missing on Fixed Elements | HIGH | 4/5 | Layout/iOS | `src/components/NavBar.tsx:70-77`<br>`src/components/Footer.tsx`<br>`src/components/ui/toast.tsx` | Add `env(safe-area-inset-*)` padding to fixed headers/footers/toasts | M (2h) |
| 04 | Sub-44dp Touch Targets | HIGH | 5/5 | Touch/A11y | `src/components/Modal.tsx:116`<br>`src/components/gallery/PhotoCard.tsx`<br>Icon-only buttons | Enforce `min-w-[44px] min-h-[44px]` on all interactive elements | M (2h) |
| 09 | Modal Overflow on Keyboard | HIGH | 5/5 | Forms/iOS | `src/components/Modal.tsx:105`<br>`src/components/ui/dialog.tsx:39` | Use `max-h-[100dvh]` + `overscroll-behavior-contain` + keyboard padding | M (2h) |
| 05 | Hover-Only Affordances | MEDIUM | 5/5 | UX/Touch | `src/components/Card.tsx:31-33`<br>`src/components/ImageCarousel.tsx:97`<br>224 hover states across codebase | Add `@media (hover: hover)` guards + visible touch alternatives | L (3h) |
| 06 | Missing Focus-Visible Styles | MEDIUM | 4/5 | A11y | All interactive components | Add `focus-visible:ring-2 focus-visible:ring-accent-gold` to buttons/links | S (1h) |
| 07 | Missing Responsive Images | MEDIUM | 5/5 | Performance | `src/components/HeroVideo.tsx:78-93`<br>Gallery images | Add `srcset`, `sizes`, width/height attributes | M (2h) |
| 08 | Layout Shift from Missing Dimensions | MEDIUM | 4/5 | Performance/CLS | `src/components/MultiPreviewCarousel.tsx:135`<br>Dynamic images | Add `aspect-ratio` CSS or explicit dimensions | S (1h) |
| 10 | Missing Scroll Lock & Overscroll Guards | MEDIUM | 4/5 | UX/Touch | All modal/dialog components<br>Carousels | Add `overscroll-behavior` + body scroll lock on modal open | M (2h) |
| 11 | Fixed px Widths Break Small Screens | MEDIUM | 4/5 | Layout | `src/App.css:2-3` (max-width: 1280px)<br>Hunt rune components | Replace with fluid `max-w-*` + `clamp()` utilities | M (2h) |
| 13 | iOS Auto-Zoom on Small Text | MEDIUM | 5/5 | Typography/iOS | `src/components/ui/input.tsx:11`<br>Form inputs with `text-sm` | Set `font-size: max(16px, 1rem)` on inputs to prevent zoom | S (1h) |
| 12 | Insufficient Breakpoint Coverage | LOW | 3/5 | Layout | `tailwind.config.ts:16-21` | Add `xs:375px` and `sm-plus:390px` breakpoints | S (1h) |
| 14 | Missing Clamp-Based Type Scale | LOW | 2/5 | Typography | `src/index.css`<br>Hero titles | Use `clamp()` for fluid heading sizes | S (1h) |

---

## Risk Matrix

```
        HIGH LIKELIHOOD ──────────────────> LOW LIKELIHOOD
        5/5      4/5      3/5      2/5      1/5
      ┌────────┬────────┬────────┬────────┬────────┐
CRIT  │   01   │        │        │        │        │
      ├────────┼────────┼────────┼────────┼────────┤
HIGH  │ 02,04  │   03   │        │        │        │
      │   09   │        │        │        │        │
      ├────────┼────────┼────────┼────────┼────────┤
MED   │ 05,07  │ 06,08  │   12   │   14   │        │
      │   13   │   10   │        │        │        │
      │        │   11   │        │        │        │
      ├────────┼────────┼────────┼────────┼────────┤
LOW   │        │        │        │        │        │
      └────────┴────────┴────────┴────────┴────────┘
```

---

## Execution Order

### Phase 1: Critical Viewport & Input (P0 - 6 hours)
- **01**: iOS 100vh Viewport Trap
- **02**: Missing Mobile Input Attributes
- **03**: Safe Area Inset Missing

### Phase 2: Touch Targets & Ergonomics (P0 - 4 hours)
- **04**: Sub-44dp Touch Targets
- **09**: Modal Overflow on Keyboard

### Phase 3: Image Optimization (P1 - 3 hours)
- **07**: Missing Responsive Images
- **08**: Layout Shift from Missing Dimensions

### Phase 4: Modal & Scroll Behavior (P1 - 4 hours)
- **05**: Hover-Only Affordances
- **06**: Missing Focus-Visible Styles
- **10**: Missing Scroll Lock & Overscroll Guards

### Phase 5: Fluid Layout & Breakpoints (P2 - 3 hours)
- **11**: Fixed px Widths Break Small Screens
- **12**: Insufficient Breakpoint Coverage

### Phase 6: Font & Typography (P2 - 2 hours)
- **13**: iOS Auto-Zoom on Small Text
- **14**: Missing Clamp-Based Type Scale

---

## Testing Matrix

| Device | Width | Browser | Tests |
|--------|-------|---------|-------|
| iPhone SE | 320px | iOS Safari 17+ | Viewport units, touch targets, text zoom |
| iPhone 12/13 Pro | 390px | iOS Safari 17+ | Safe area, keyboard modal, fluid layout |
| iPhone 15 Pro Max | 430px | iOS Safari 17+ | Landscape notch, carousels |
| Pixel 5 | 393px | Chrome 120+ | Material gestures, focus-visible |
| Pixel 7 | 412px | Chrome 120+ | Android keyboard, scroll behavior |
| iPad Mini | 768px | iOS Safari 17+ | Tablet breakpoints, hover behavior |
| Galaxy Fold | 280px | Chrome 120+ | Extreme narrow, overflow |

**Network Conditions**: 4G Regular (4Mbps), Slow 4G (1.6Mbps)  
**CPU Throttling**: 4x slowdown

---

## Success Metrics

| Metric | Target | Current (Est.) |
|--------|--------|----------------|
| Lighthouse Mobile Score | >90 | ~75 |
| Largest Contentful Paint | <2.5s | ~3.5s |
| Interaction to Next Paint | <200ms | Unknown |
| Cumulative Layout Shift | <0.1 | ~0.25 |
| Touch Target Compliance | 100% ≥44dp | ~60% |
| Horizontal Scroll at 320px | None | Present |
| Safe Area Padding | All fixed elements | Missing |
| Input Auto-Zoom Events | 0 | ~5 inputs |

---

## Dependencies

- All patches assume Tailwind CSS v3.4+
- Dynamic viewport units require browser support check (iOS 15.4+, Chrome 108+)
- Safe area insets require `viewport-fit=cover` in meta tag (already present)

# Mobile Resilience Review - Detailed Findings

**Review Date**: 2025-10-09  
**Reviewer**: Senior Frontend/Mobile Specialist  
**Technology Stack**: React 19 + Vite + Tailwind CSS 3.4 + Supabase

---

## Finding 01: iOS 100vh Viewport Trap

### Context
iOS Safari dynamically changes the viewport height when the address bar and bottom toolbar show/hide during scroll. Using fixed `vh` units causes content to be cut off or overflow because `100vh` includes these UI elements even when hidden. This is particularly problematic for:
- Full-height hero sections
- Modal dialogs
- Image viewers
- Any component using `min-h-screen` or fixed vh values

### Evidence

**File**: `src/components/HeroVideo.tsx:70`
```tsx
<section
  className="relative min-h-[80vh] w-full flex items-center justify-center"
>
```

**File**: `src/components/Modal.tsx:105`
```tsx
<div className="... max-h-[90vh] overflow-y-auto">
```

**File**: `src/components/ui/dialog.tsx:39`
```tsx
className="... sm:rounded-lg"  // Missing max-height constraint
```

**Problem**: These components use `vh` units which include iOS toolbar height, causing ~60-100px of content to be hidden below the fold when the toolbar is visible.

### Exact Fix

Replace all `vh` units with `dvh` (dynamic viewport height) and provide a fallback for older browsers:

```tsx
// Before
className="min-h-[80vh]"
className="max-h-[90vh]"

// After
className="min-h-[80vh] supports-[height:100dvh]:min-h-[80dvh]"
className="max-h-[90vh] supports-[height:100dvh]:max-h-[90dvh]"
```

Add CSS fallback in `src/index.css`:
```css
/* Fallback for browsers without dvh support */
@supports not (height: 100dvh) {
  .supports-\[height\:100dvh\]\:min-h-\[80dvh\] {
    min-height: 80vh;
  }
  .supports-\[height\:100dvh\]\:max-h-\[90dvh\] {
    max-height: 90vh;
  }
}
```

Add `overscroll-behavior-contain` to prevent elastic bounce:
```tsx
className="... overflow-y-auto overscroll-behavior-contain"
```

### Minimal Regression Tests

**Test 1: iOS Safari Viewport Height**
```typescript
// tests/viewport.test.ts
import { render, screen } from '@testing-library/react';
import HeroVideo from '@/components/HeroVideo';

describe('iOS Viewport Height Fix', () => {
  it('should use dvh units with vh fallback', () => {
    render(<HeroVideo />);
    const heroSection = screen.getByRole('banner');
    const styles = window.getComputedStyle(heroSection);
    
    // Check for Tailwind classes
    expect(heroSection.className).toContain('min-h-[80vh]');
    expect(heroSection.className).toContain('supports-[height:100dvh]:min-h-[80dvh]');
  });

  it('should have overscroll-behavior on scrollable containers', () => {
    const { container } = render(<Modal isOpen={true} />);
    const modalContent = container.querySelector('.overflow-y-auto');
    
    expect(modalContent?.className).toContain('overscroll-behavior-contain');
  });
});
```

**Manual Test on iOS**:
1. Open site on iPhone (Safari)
2. Scroll down to hide address bar
3. Verify hero section fills viewport exactly
4. Open RSVP modal
5. Verify modal doesn't overflow when address bar is hidden
6. Scroll modal content, verify no bounce past edges

### Rollback Plan

If `dvh` units cause issues:
1. Revert to `vh` units
2. Add JavaScript-based viewport height fix:
```typescript
// Fallback: Update CSS custom property on resize
const updateViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', updateViewportHeight);
updateViewportHeight();

// In CSS: height: calc(var(--vh, 1vh) * 80)
```

---

## Finding 02: Missing Mobile Input Attributes

### Context
Mobile browsers provide optimized keyboard layouts and behaviors when proper input attributes are set. Without these, users get:
- Generic keyboard instead of email/numeric layouts
- No autocomplete suggestions
- iOS auto-zoom on inputs <16px font-size
- Generic "return" key instead of contextual "next"/"go"

### Evidence

**File**: `src/components/ui/input.tsx:11`
```tsx
<input
  type={type}
  className="... text-sm ..."  // text-sm is 14px, triggers iOS zoom
  // Missing: inputMode, autoComplete, enterKeyHint
/>
```

**File**: `src/pages/RSVP.tsx:721-745`
```tsx
<FormField label="Email Address" type="email" />  // Missing inputMode
<FormField label="Number of Guests" type="number" />  // Missing inputMode="numeric"
```

**File**: `src/components/FormField.tsx`
```tsx
// Component doesn't accept or pass through mobile input attributes
```

### Exact Fix

**Step 1**: Update base Input component to prevent iOS zoom
```tsx
// src/components/ui/input.tsx
<input
  className={cn(
    "text-base",  // Change from text-sm (14px) to text-base (16px)
    "flex h-10 w-full rounded-md ...",
    className
  )}
/>
```

**Step 2**: Extend FormField to accept mobile attributes
```tsx
// src/components/FormField.tsx
import { InputHTMLAttributes } from "react";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  id: string;
  label: string;
  type?: string;
  value?: string;
  onChange: (value: string) => void;
  // ... existing props
}

export default function FormField({
  id,
  label,
  type,
  value,
  onChange,
  inputMode,
  autoComplete,
  enterKeyHint,
  ...inputProps
}: FormFieldProps) {
  return (
    <Input
      id={id}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      enterKeyHint={enterKeyHint}
      {...inputProps}
    />
  );
}
```

**Step 3**: Add attributes to RSVP form
```tsx
// src/pages/RSVP.tsx
<FormField
  label="Full Name"
  type="text"
  autoComplete="name"
  enterKeyHint="next"
/>

<FormField
  label="Email Address"
  type="email"
  inputMode="email"
  autoComplete="email"
  enterKeyHint="next"
/>

<FormField
  label="Number of Guests"
  type="number"
  inputMode="numeric"
  pattern="[0-9]*"  // iOS optimization
  enterKeyHint="done"
/>
```

### Input Attribute Reference

| Field Type | inputMode | autoComplete | enterKeyHint | pattern |
|------------|-----------|--------------|--------------|---------|
| Email | email | email | next/go | - |
| Name | text | name | next | - |
| Phone | tel | tel | next | - |
| Number | numeric | - | done | [0-9]* |
| URL | url | url | go | - |
| Search | search | - | search | - |
| Password | text | current-password | done | - |

### Minimal Regression Tests

```typescript
// tests/mobile-inputs.test.tsx
import { render, screen } from '@testing-library/react';
import { RSVP } from '@/pages/RSVP';

describe('Mobile Input Attributes', () => {
  it('should have email keyboard for email inputs', () => {
    render(<RSVP />);
    const emailInput = screen.getByLabelText(/email/i);
    
    expect(emailInput).toHaveAttribute('inputMode', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(emailInput).toHaveAttribute('enterKeyHint', 'next');
  });

  it('should have numeric keyboard for number inputs', () => {
    render(<RSVP />);
    const guestInput = screen.getByLabelText(/guests/i);
    
    expect(guestInput).toHaveAttribute('inputMode', 'numeric');
    expect(guestInput).toHaveAttribute('pattern', '[0-9]*');
  });

  it('should prevent iOS zoom with min 16px font', () => {
    const { container } = render(<Input type="text" />);
    const input = container.querySelector('input');
    const styles = window.getComputedStyle(input!);
    
    const fontSize = parseFloat(styles.fontSize);
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });
});
```

**Manual iOS Test**:
1. Open RSVP form on iPhone Safari
2. Tap email field → verify email keyboard appears
3. Tap guest count → verify numeric keypad appears
4. Verify keyboard "Return" key shows "Next" label
5. Verify no zoom occurs when focusing any input

### Rollback Plan

If keyboard optimization causes issues:
1. Remove `inputMode` attributes (keep type attributes)
2. Keep `font-size: 16px` to prevent zoom
3. Remove `enterKeyHint` if it conflicts with form flow
4. Keep `autoComplete` as it's universally beneficial

---

## Finding 03: Safe Area Inset Missing on Fixed Elements

### Context
iPhone X and later models have a notch, rounded corners, and a home indicator. Fixed positioned elements (navbar, footer, toasts) can overlap these UI elements, especially in landscape orientation. The `safe-area-inset-*` environment variables provide the padding needed to avoid these areas.

### Evidence

**File**: `src/components/NavBar.tsx:70-77`
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80">
  <div className="container mx-auto px-4 py-4">
    // No safe-area-inset-top or safe-area-inset-left/right
```

**File**: `src/components/Footer.tsx`
```tsx
<footer className="... mt-auto">
  // No safe-area-inset-bottom for home indicator
```

**File**: `src/components/ui/sonner.tsx`
```tsx
// Toasts don't account for notch/home indicator
```

**File**: `index.html`
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<!-- viewport-fit=cover is correct, but we need CSS to handle safe areas -->
```

### Exact Fix

**NavBar** - Add top and horizontal safe area padding:
```tsx
// src/components/NavBar.tsx
<nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 pt-[max(env(safe-area-inset-top),1rem)]">
  <div className="container mx-auto px-[max(env(safe-area-inset-left),1rem)] pr-[max(env(safe-area-inset-right),1rem)] py-4">
```

**Footer** - Add bottom safe area padding:
```tsx
// src/components/Footer.tsx
<footer className="... pb-[max(env(safe-area-inset-bottom),1rem)]">
```

**Toasts** - Add safe area padding to toast viewport:
```tsx
// src/components/ui/sonner.tsx
toastOptions={{
  classNames: {
    toast: cn(
      "group toast ...",
      "pr-[max(env(safe-area-inset-right),1rem)]",
      "pl-[max(env(safe-area-inset-left),1rem)]",
      "mb-[env(safe-area-inset-bottom,0)]"
    ),
  },
}}
```

**Global** - Add safe area support to body:
```css
/* src/index.css */
@supports (padding: max(0px)) {
  body {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

### Safe Area Inset Values

| Device | Orientation | Top | Bottom | Left | Right |
|--------|-------------|-----|--------|------|-------|
| iPhone 15 Pro | Portrait | 59px | 34px | 0px | 0px |
| iPhone 15 Pro | Landscape | 0px | 21px | 59px | 59px |
| iPhone SE | Any | 0px | 0px | 0px | 0px |
| iPad Pro 11" | Portrait | 24px | 20px | 0px | 0px |

### Minimal Regression Tests

```typescript
// tests/safe-area.test.tsx
describe('Safe Area Insets', () => {
  beforeEach(() => {
    // Mock iOS safe area values
    document.documentElement.style.setProperty('--safe-area-inset-top', '59px');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', '34px');
    document.documentElement.style.setProperty('--safe-area-inset-left', '0px');
    document.documentElement.style.setProperty('--safe-area-inset-right', '0px');
  });

  it('should add safe area padding to navbar', () => {
    render(<NavBar />);
    const nav = screen.getByRole('navigation');
    
    expect(nav.className).toContain('pt-[max(env(safe-area-inset-top),1rem)]');
  });

  it('should add safe area padding to footer', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    
    expect(footer.className).toContain('pb-[max(env(safe-area-inset-bottom),1rem)]');
  });

  it('should use minimum 1rem when safe area is 0', () => {
    document.documentElement.style.setProperty('--safe-area-inset-top', '0px');
    
    render(<NavBar />);
    const nav = screen.getByRole('navigation');
    const styles = window.getComputedStyle(nav);
    
    // Should fallback to 1rem (16px)
    expect(parseInt(styles.paddingTop)).toBeGreaterThanOrEqual(16);
  });
});
```

**Manual iOS Test**:
1. Open site on iPhone 15 Pro (Safari)
2. **Portrait**: Verify navbar clears status bar/notch
3. **Landscape**: Verify navbar clears left notch, footer clears home indicator
4. Trigger toast notification → verify it doesn't overlap notch
5. Test on iPhone SE (no notch) → verify minimum 1rem padding still applied

### Rollback Plan

If safe area insets cause layout issues:
1. Remove safe area padding from specific components
2. Keep `max()` function to ensure minimum padding
3. Use fixed padding values instead of env variables:
   ```tsx
   className="pt-16"  // Fixed 4rem instead of dynamic
   ```
4. Add media query to only apply on iOS:
   ```css
   @supports (-webkit-touch-callout: none) {
     /* iOS-only safe area styles */
   }
   ```

---

## Finding 04: Sub-44dp Touch Targets

### Context
WCAG 2.1 Level AA requires touch targets to be at least 44x44 CSS pixels (equivalent to ~44dp). Smaller targets are difficult to tap accurately, especially for users with:
- Motor impairments
- Large fingers
- One-handed phone usage
- Shaky hands (on the go, in vehicles)

The current codebase has numerous sub-44px interactive elements, particularly icon-only buttons.

### Evidence

**File**: `src/components/Modal.tsx:116`
```tsx
<button
  onClick={onClose}
  aria-label="Close modal"
  className="absolute top-4 right-4"
>
  <X className="h-5 w-5" />  // 20x20px icon, no minimum size
</button>
```

**File**: `src/components/ui/button.tsx:26-28`
```tsx
size: {
  sm: "h-9 rounded-md px-3",      // 36px height - BELOW 44px
  icon: "h-10 w-10",              // 40px square - BELOW 44px
}
```

**File**: `src/components/gallery/PhotoCard.tsx:45-59`
```tsx
<button onClick={onLike}>  // No minimum size specified
  <Heart className="h-5 w-5" />
</button>
```

**File**: `src/components/NavBar.tsx:95-108`
```tsx
<Link className="text-sm font-medium">  // No vertical padding
  {item.label}
</Link>
```

### Exact Fix

**Step 1**: Update button size variants
```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "... touch-manipulation",  // Add for better tap response
  {
    variants: {
      size: {
        default: "h-10 px-4 py-2",  // Already 40px, add min
        sm: "h-10 min-h-[44px] rounded-md px-3",  // Increase from 36px
        lg: "h-12 min-h-[44px] rounded-md px-8",  // Already OK, add min
        icon: "h-11 w-11 min-w-[44px] min-h-[44px]",  // Increase from 40px
      },
    },
  }
);
```

**Step 2**: Fix modal close button
```tsx
// src/components/Modal.tsx
<button
  onClick={onClose}
  className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
>
  <X className="h-5 w-5" />
</button>
```

**Step 3**: Fix gallery photo controls
```tsx
// src/components/gallery/PhotoCard.tsx
<button
  onClick={onLike}
  className="min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
>
  <Heart className="h-5 w-5" />
</button>

<button
  onClick={onDelete}
  className="min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
>
  <Trash2 className="h-5 w-5" />
</button>
```

**Step 4**: Fix navigation links
```tsx
// src/components/NavBar.tsx
<Link
  to={item.path}
  className="... min-h-[44px] flex items-center touch-manipulation"
>
  {item.label}
</Link>
```

**Step 5**: Add spacing between targets
```tsx
// Where buttons are adjacent, add gap
<div className="flex gap-2">  // Minimum 8px gap
  <Button size="icon" />
  <Button size="icon" />
</div>
```

### Touch Target Audit Checklist

- [ ] All icon-only buttons: ≥44x44px
- [ ] Close buttons (X): ≥44x44px
- [ ] Navigation links: ≥44px tall
- [ ] Gallery controls: ≥44x44px
- [ ] Form checkboxes/radios: ≥44x44px with label
- [ ] Carousel prev/next: ≥44x44px
- [ ] Adjacent targets: ≥8px gap
- [ ] Focus indicators: visible at all sizes

### Minimal Regression Tests

```typescript
// tests/touch-targets.test.tsx
import { render, screen } from '@testing-library/react';

describe('Touch Target Compliance', () => {
  it('should have minimum 44x44px buttons', () => {
    render(<Button size="icon"><X /></Button>);
    const button = screen.getByRole('button');
    const { width, height } = button.getBoundingClientRect();
    
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });

  it('should have touch-manipulation on interactive elements', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    
    expect(button.className).toContain('touch-manipulation');
  });

  it('should have minimum spacing between adjacent targets', () => {
    render(
      <div className="flex gap-2">
        <Button size="icon" />
        <Button size="icon" />
      </div>
    );
    
    const buttons = screen.getAllByRole('button');
    const gap = buttons[1].getBoundingClientRect().left - 
                buttons[0].getBoundingClientRect().right;
    
    expect(gap).toBeGreaterThanOrEqual(8);
  });
});
```

**Manual Test on iPhone**:
1. Open site on iPhone SE (smallest screen)
2. Test tapping all icon buttons (close, like, delete)
3. Verify no accidental taps on adjacent targets
4. Test navigation links with thumb in bottom third of screen
5. Use DevTools → Inspect to measure actual pixel dimensions
6. Compare against 44x44px grid overlay

### Rollback Plan

If larger touch targets cause layout issues:
1. Reduce to WCAG Level AA minimum: 24x24px (not recommended)
2. Add negative margin to compensate for increased size:
   ```tsx
   className="min-w-[44px] min-h-[44px] -m-2"
   ```
3. Use invisible pseudo-element for hit area:
   ```css
   button::before {
     content: '';
     position: absolute;
     inset: -8px;  /* Expand hit area without visual change */
   }
   ```

---

## Finding 09: Modal Overflow on Keyboard

### Context
When the iOS soft keyboard appears, it reduces the viewport height, causing `max-h-[90vh]` modals to overflow. The modal content becomes partially hidden below the keyboard with no way to scroll to it. This is especially problematic for:
- Forms in modals (RSVP, contact)
- Authentication modals
- Multi-step wizards

iOS also has a quirk where `position: fixed` elements don't account for the keyboard, unlike Android.

### Evidence

**File**: `src/components/Modal.tsx:105`
```tsx
<div className="... max-h-[90vh] overflow-y-auto">
  // When keyboard opens, 90vh doesn't account for reduced viewport
</div>
```

**File**: `src/components/ui/dialog.tsx:39`
```tsx
<DialogPrimitive.Content
  className="... sm:rounded-lg"  // No max-height or scroll handling
/>
```

**File**: `src/components/AuthModal.tsx`
```tsx
// Login/signup forms inside modal - affected by keyboard
```

### Exact Fix

**Step 1**: Use dynamic viewport height with keyboard handling
```tsx
// src/components/Modal.tsx
<div
  ref={modalRef}
  className={cn(
    "relative bg-background border rounded-lg shadow-xl max-w-2xl w-full",
    "max-h-[90vh] supports-[height:100dvh]:max-h-[90dvh]",  // Dynamic viewport
    "overflow-y-auto overscroll-behavior-contain",  // Prevent bounce
    "pb-[env(keyboard-inset-height,0)]"  // Space for keyboard (future CSS)
  )}
>
```

**Step 2**: Update dialog component
```tsx
// src/components/ui/dialog.tsx
<DialogPrimitive.Content
  className={cn(
    "... max-h-[90vh] supports-[height:100dvh]:max-h-[90dvh]",
    "overflow-y-auto overscroll-behavior-contain",
    className
  )}
/>
```

**Step 3**: Add JavaScript fallback for iOS keyboard
```typescript
// src/hooks/use-keyboard-height.ts
import { useEffect, useState } from 'react';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      // iOS keyboard reduces window.innerHeight
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const keyboardHeight = windowHeight - viewportHeight;
      
      setKeyboardHeight(Math.max(0, keyboardHeight));
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
}

// Usage in Modal
const keyboardHeight = useKeyboardHeight();
const maxHeight = `calc(90dvh - ${keyboardHeight}px)`;
```

**Step 4**: Ensure focused input is visible
```typescript
// src/components/FormField.tsx
useEffect(() => {
  if (inputRef.current && document.activeElement === inputRef.current) {
    // Scroll focused input into view when keyboard opens
    inputRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}, [/* keyboard state */]);
```

**Step 5**: Add scroll lock to body when modal is open
```typescript
// src/components/Modal.tsx
useEffect(() => {
  if (isOpen) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;  // Prevent layout shift
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  return () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };
}, [isOpen]);
```

### iOS Keyboard Behavior Reference

| State | window.innerHeight | visualViewport.height | Keyboard Height |
|-------|-------------------|----------------------|----------------|
| No keyboard | 844px | 844px | 0px |
| Keyboard open | 844px | 508px | 336px |

### Minimal Regression Tests

```typescript
// tests/modal-keyboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/Modal';

describe('Modal Keyboard Handling', () => {
  it('should adjust max-height when keyboard opens', () => {
    const { rerender } = render(<Modal isOpen={true}>Content</Modal>);
    const modal = screen.getByRole('dialog');
    
    // Simulate keyboard opening
    Object.defineProperty(window, 'visualViewport', {
      value: { height: 500 },
      writable: true,
    });
    
    fireEvent(window, new Event('resize'));
    rerender(<Modal isOpen={true}>Content</Modal>);
    
    // Modal should have reduced max-height
    const styles = window.getComputedStyle(modal);
    expect(parseInt(styles.maxHeight)).toBeLessThan(844);
  });

  it('should scroll focused input into view', async () => {
    render(
      <Modal isOpen={true}>
        <Input autoFocus />
      </Modal>
    );
    
    const input = screen.getByRole('textbox');
    const scrollSpy = vi.spyOn(input, 'scrollIntoView');
    
    fireEvent.focus(input);
    
    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  it('should prevent body scroll when modal is open', () => {
    const { rerender } = render(<Modal isOpen={false}>Content</Modal>);
    expect(document.body.style.overflow).toBe('');
    
    rerender(<Modal isOpen={true}>Content</Modal>);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal isOpen={false}>Content</Modal>);
    expect(document.body.style.overflow).toBe('');
  });
});
```

**Manual iOS Test**:
1. Open RSVP page on iPhone (Safari)
2. Tap "RSVP Now" to open modal
3. Tap email input → keyboard appears
4. Verify modal content scrolls to show focused input
5. Scroll within modal → verify no elastic bounce
6. Verify background doesn't scroll while modal is open
7. Close modal → verify background scroll restored

### Rollback Plan

If keyboard handling causes issues:
1. Remove JavaScript keyboard height detection
2. Keep `max-h-[90dvh]` for better static behavior
3. Remove `scrollIntoView` if it causes jerky animations
4. Use simpler approach: always show submit button as sticky footer
   ```tsx
   <div className="sticky bottom-0 bg-background pt-4 border-t">
     <Button type="submit">Submit</Button>
   </div>
   ```

---

## Finding 05-14: Additional Findings

_[Space reserved for remaining 9 findings with same detail level]_

Each finding should include:
- Context (why it matters)
- Evidence (exact file:line with code blocks)
- Exact Fix (before/after code)
- Minimal Regression Tests (Vitest + RTL)
- Rollback Plan

**Remaining findings**:
- 05: Hover-Only Affordances
- 06: Missing Focus-Visible Styles
- 07: Missing Responsive Images
- 08: Layout Shift from Missing Dimensions
- 10: Missing Scroll Lock & Overscroll Guards
- 11: Fixed px Widths Break Small Screens
- 12: Insufficient Breakpoint Coverage
- 13: iOS Auto-Zoom on Small Text
- 14: Missing Clamp-Based Type Scale

_[These would follow the same comprehensive format as findings 01-04]_

---

## Global Testing Commands

### Build Size Analysis
```bash
# Production build
npm run build

# Analyze bundle
npx vite-bundle-visualizer

# Expected results:
# - Total JS < 500KB gzip
# - Largest chunk < 180KB gzip
# - CSS < 50KB gzip
```

### Lighthouse Mobile
```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run mobile audit
lhci autorun --collect.settings.preset=mobile

# Expected scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >95
# - SEO: >95
```

### Manual Device Testing
```bash
# iOS Simulator (requires Xcode)
open -a Simulator
# Open Safari → [your-dev-url]

# Android Emulator (requires Android Studio)
emulator -avd Pixel_5_API_31
# Open Chrome → [your-dev-url]

# Remote debugging
# iOS: Settings → Safari → Advanced → Web Inspector
# Android: chrome://inspect
```

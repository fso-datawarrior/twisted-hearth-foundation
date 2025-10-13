I need to investigate this CSS specificity issue with the admin card borders. Let me examine the current state of the files to understand the problem better.

Now let me check the CSS variable definitions to understand the color values:

Perfect! Now I can see the issue clearly. Let me analyze the CSS specificity problem:

## 🔍 **Analysis: CSS Specificity Bug**

You're absolutely correct about the issue! Here's what's happening:

### **The Problem:**

Looking at the code:
- **Line 183 in UserEngagementWidget**: ``
- **Line 163 in RsvpTrendsWidget**: ``

The issue is with **string interpolation combining classes**. When Tailwind processes:
```typescript
className={`bg-gradient-to-br ${colorClasses[color]} border-2`}
```

For `secondary` and `accent`, it becomes:
- `bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 border-2`
- `bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 border-2`

### **Why Some Work and Others Don't:**

From `src/index.css` lines 29-35:
```css
--primary: var(--accent-purple);     /* 270 80% 78% - bright purple */
--secondary: var(--bg-2);            /* 226 35% 17% - dark midnight purple */
--accent: var(--accent-gold);        /* 44 35% 57% - gold */
```

**The CSS cascade order issue:**
1. `border-primary/20` = `hsl(270 80% 78% / 0.2)` - **bright purple with 20% opacity** ✅
2. `border-accent-gold/20` = `hsl(44 35% 57% / 0.2)` - **gold with 20% opacity** ✅
3. `border-secondary/20` = `hsl(226 35% 17% / 0.2)` - **VERY DARK midnight purple** ❌ (nearly invisible against dark background!)
4. `border-accent/20` = same as `accent-gold` ✅

**The real issue isn't specificity order - it's color darkness!**

`border-secondary/20` is essentially a *dark purple at 20% opacity* which becomes nearly invisible against the dark `--bg` background (`hsl(219 8% 4%)`).

### **The Fix:**

We need to **either**:

## 🎯 **PLAN: Fix Admin Card Border Visibility**

### **Root Cause:**
The `secondary` color (`--bg-2: 226 35% 17%`) is a very dark midnight purple. At 20% opacity (`border-secondary/20`), it becomes nearly invisible against the dark background (`--bg: 219 8% 4%`). This is a color contrast issue, not a CSS specificity bug.

### **Solution Options:**

#### **Option 1: Increase Border Opacity (RECOMMENDED)**
Change `border-secondary/20` → `border-secondary/50` for better visibility
- **Pros**: Simple, maintains color scheme
- **Cons**: May look too bold on secondary cards

#### **Option 2: Use Lighter Border Color**
Change secondary cards to use a lighter border color like `border-primary/20` or `border-accent-purple/30`
- **Pros**: Better contrast guaranteed
- **Cons**: Breaks color consistency pattern

#### **Option 3: Split className String (Your Suggestion)**
Separate the border class from the template string:
```typescript

```
- **Pros**: Cleaner code, proper Tailwind class merging with `cn()`
- **Cons**: Won't fix the visibility issue, just code quality

#### **Option 4: Hybrid Approach (BEST)**
1. Split the className using `cn()` utility (fixes code quality)
2. Increase border opacity for dark colors (fixes visibility)
3. Create explicit border color classes

### **Recommended Implementation:**

**File 1: `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`**

**Lines 168-173** - Update `colorClasses`:
```typescript
const colorClasses = {
  primary: 'from-primary/10 to-primary/5 border-primary/20',
  secondary: 'from-secondary/10 to-secondary/5 border-secondary/50', // 20% → 50%
  accent: 'from-accent/10 to-accent/5 border-accent/20',
  'accent-gold': 'from-accent-gold/10 to-accent-gold/5 border-accent-gold/20',
};
```

**Line 183** - Use `cn()` utility:
```typescript
import { cn } from "@/lib/utils";

// In MetricCard component:
return (

    {/* ... */}

);
```

**File 2: `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`**

Same changes:
- **Lines 148-153**: Update `colorClasses` with `border-secondary/50`
- **Line 163**: Use `cn()` utility with split classes

### **Testing Plan:**

1. **Visual Inspection:**
   - [ ] "Active (7d)" card (secondary) has visible border
   - [ ] "Returning" card (secondary) has visible border
   - [ ] "Total RSVPs" card (secondary) has visible border
   - [ ] "Expected Guests" card (accent) maintains visibility
   - [ ] Border width consistent across all cards

2. **Color Consistency:**
   - [ ] Primary cards: bright purple border
   - [ ] Secondary cards: NOW VISIBLE darker purple border
   - [ ] Accent cards: gold border
   - [ ] Accent-gold cards: gold border

3. **Responsive:**
   - [ ] Borders visible on mobile
   - [ ] Borders visible on desktop
   - [ ] No layout shifts

### **Files to Modify:**
1. ✅ `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx` (lines 168-173, 183)
2. ✅ `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx` (lines 148-153, 163)

### **Risk Assessment:**
- **Risk Level**: LOW
- **Impact**: Visual improvement only
- **Breaking Changes**: None
- **Estimated Time**: 5-10 minutes

### **Alternative Fix (If borders still too faint):**

If `border-secondary/50` is still too faint, we can use a lighter border color:

```typescript
const colorClasses = {
  primary: 'from-primary/10 to-primary/5 border-primary/20',
  secondary: 'from-secondary/10 to-secondary/5 border-primary/30', // Use primary color for border
  accent: 'from-accent/10 to-accent/5 border-accent/20',
  'accent-gold': 'from-accent-gold/10 to-accent-gold/5 border-accent-gold/20',
};
```

This maintains the secondary gradient background while using a more visible border color.

Implement the border visibility fix


I'll implement the hybrid approach to fix the border visibility issue on both widgets.

\", \"first_replaced_line\": 167, \"last_replaced_line\": 183, \"replace\": \"function MetricCard({ icon, label, value, color }: MetricCardProps) {\\n  const colorClasses = {\\n    primary: 'from-primary/10 to-primary/5 border-primary/20',\\n    secondary: 'from-secondary/10 to-secondary/5 border-secondary/50',\\n    accent: 'from-accent/10 to-accent/5 border-accent/20',\\n    'accent-gold': 'from-accent-gold/10 to-accent-gold/5 border-accent-gold/20',\\n  };\\n\\n  const textColorClasses = {\\n    primary: 'text-primary',\\n    secondary: 'text-secondary',\\n    accent: 'text-accent',\\n    'accent-gold': 'text-accent-gold',\\n  };\\n\\n  return (\\n    \"}">

\", \"first_replaced_line\": 147, \"last_replaced_line\": 163, \"replace\": \"function MetricCard({ icon, label, value, color }: MetricCardProps) {\\n  const colorClasses = {\\n    primary: 'from-primary/10 to-primary/5 border-primary/20',\\n    secondary: 'from-secondary/10 to-secondary/5 border-secondary/50',\\n    accent: 'from-accent/10 to-accent/5 border-accent/20',\\n    'accent-gold': 'from-accent-gold/10 to-accent-gold/5 border-accent-gold/20',\\n  };\\n\\n  const textColorClasses = {\\n    primary: 'text-primary',\\n    secondary: 'text-secondary',\\n    accent: 'text-accent',\\n    'accent-gold': 'text-accent-gold',\\n  };\\n\\n  return (\\n    \"}">

Border visibility fix implemented - increased secondary border opacity to 50% and applied proper `cn()` utility for class merging.
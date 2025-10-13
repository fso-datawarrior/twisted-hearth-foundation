# 📧 Email Fixes - Before & After Comparison

**Visual reference for correct changes**

---

## 🗓️ DATE & TIME CORRECTIONS

### ❌ BEFORE (Wrong):
- **Date**: Saturday, October 18, 2025
- **Time**: 7:00 PM
- **ISO**: `2025-10-18T19:00:00-06:00`

### ✅ AFTER (Correct):
- **Date**: Friday, November 1st, 2025
- **Time**: 6:30 PM  
- **ISO**: `2025-11-01T18:30:00-06:00`

---

## 📍 ADDRESS CORRECTIONS

### ❌ BEFORE (Wrong):
```
Denver, Colorado
```

### ✅ AFTER (Correct):
```
1816 White Feather Drive, Longmont, Colorado 80504
```

---

## 📧 EMAIL EXAMPLES

### Example 1: RSVP Confirmation Email

#### ❌ BEFORE:
```
Hi John,

We have received your RSVP for 2 guests.
Date: Saturday, October 18, 2025 — 7:00 PM
Where: [Private Address]

This address is private. Please don't share it publicly.

— Jamie & Kat Ruth
```

#### ✅ AFTER:
```
Hi John,

We have received your RSVP for 2 guests.
Date: Friday, November 1st, 2025 — 6:30 PM
Where: [Private Address]

This address is private. Please don't share it publicly.

— Jamie & Kat Ruth
```

---

### Example 2: Email Campaign Template

#### ❌ BEFORE:
```html
<p><strong>When:</strong> Saturday, October 18, 2025 — 7:00 PM</p>
<p><strong>Where:</strong> Denver, Colorado</p>
```

#### ✅ AFTER:
```html
<p><strong>When:</strong> Friday, November 1st, 2025 — 6:30 PM</p>
<p><strong>Where:</strong> 1816 White Feather Drive, Longmont, Colorado 80504</p>
```

---

### Example 3: Static Email Template Footer

#### ❌ BEFORE:
```html
<p style="font-size: 14px; color: #6b7280; margin: 0;">
  Hosted by Jamie & Kat Ruth<br>
  November 1st, 2025 • 6:30 PM<br>
  Denver, Colorado
</p>
```

#### ✅ AFTER:
```html
<p style="font-size: 14px; color: #6b7280; margin: 0;">
  Hosted by Jamie & Kat Ruth<br>
  November 1st, 2025 • 6:30 PM<br>
  1816 White Feather Drive, Longmont, Colorado 80504
</p>
```

---

## 🎯 FORMAT STANDARDS

### Date Format:
- ✅ **Correct**: "Friday, November 1st, 2025"
- ✅ **Acceptable**: "November 1st, 2025" (without day of week)
- ❌ **Wrong**: "Nov 1, 2025", "11/1/2025", "2025-11-01"

### Time Format:
- ✅ **Correct**: "6:30 PM"
- ❌ **Wrong**: "6:30pm", "18:30", "6:30 p.m."

### Address Format:
- ✅ **Correct**: "1816 White Feather Drive, Longmont, Colorado 80504"
- ✅ **Acceptable**: "1816 White Feather Drive, Longmont, CO 80504" (state abbreviated)
- ❌ **Wrong**: Missing street number, missing zip code, wrong city

---

## 🔍 QUICK REFERENCE TABLE

| Element | ❌ Wrong | ✅ Correct |
|---------|---------|-----------|
| **Event Date** | Saturday, October 18, 2025 | Friday, November 1st, 2025 |
| **Event Time** | 7:00 PM | 6:30 PM |
| **ISO Timestamp** | 2025-10-18T19:00:00-06:00 | 2025-11-01T18:30:00-06:00 |
| **City** | Denver | Longmont |
| **Street Address** | (missing) | 1816 White Feather Drive |
| **State** | Colorado | Colorado |
| **Zip Code** | (missing) | 80504 |
| **Full Address** | Denver, Colorado | 1816 White Feather Drive, Longmont, Colorado 80504 |

---

## 📅 CALENDAR FILE (.ICS)

The calendar attachment should also reflect correct date/time:

### ❌ BEFORE:
```
DTSTART:20251018T190000
DTEND:20251018T230000
```

### ✅ AFTER:
```
DTSTART:20251101T183000
DTEND:20251101T223000
```

**Note**: This is automatically generated from `EVENT_START_ISO`, so fixing that constant will fix the calendar file.

---

## ✅ VERIFICATION CHECKLIST

Use this to verify your changes:

### String Searches (Should Find ZERO):
- [ ] "October 18" ← Should be GONE
- [ ] "2025-10-18" ← Should be GONE
- [ ] "Denver, Colorado" ← Should be GONE (in email code)
- [ ] "7:00 PM" ← Should be GONE (in event context)

### String Searches (Should Find MANY):
- [ ] "November 1" ← Should be EVERYWHERE
- [ ] "2025-11-01" ← Should be in code
- [ ] "6:30 PM" ← Should be EVERYWHERE
- [ ] "Longmont" ← Should be EVERYWHERE
- [ ] "1816 White Feather Drive" ← Should be in all templates

---

## 🎨 VISUAL MOCKUP

### Email Preview:

```
┌────────────────────────────────────────────────┐
│  🎃 Your RSVP is received                      │
│  [Orange gradient header]                      │
├────────────────────────────────────────────────┤
│                                                │
│  Hi [Name],                                    │
│                                                │
│  We have received your RSVP for 2 guests.     │
│                                                │
│  Date: Friday, November 1st, 2025 — 6:30 PM   │ ← MUST BE CORRECT
│  Where: 1816 White Feather Drive,             │ ← MUST BE CORRECT
│         Longmont, Colorado 80504               │
│                                                │
│  This address is private. Please don't share  │
│  it publicly.                                  │
│                                                │
│  — Jamie & Kat Ruth                            │
│                                                │
└────────────────────────────────────────────────┘
```

---

**USE THIS DOCUMENT AS YOUR REFERENCE WHILE MAKING CHANGES!**


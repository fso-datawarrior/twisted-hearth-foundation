# PHASE 3: RSVP Page Enhancements

**Branch**: v-3.0.3.4-Phase3-RSVPPageEnhancements  
**Priority**: P1 (High - User-Facing Features)  
**Estimated Time**: 3-4 hours

## Overview
Enhance RSVP page with corrected labels, decline option, notification preferences, and friend invitation feature.

---

## 3.1 Change "Vegan" to "Vegetarian"

### Files to Modify
- `src/pages/RSVP.tsx`

### Issue
Checkbox says "This dish is Vegan" but should say "This dish is Vegetarian"

### Changes Required

#### 1. Update State Variable (Line 173)
```tsx
// BEFORE:
const [isVegan, setIsVegan] = useState(false);

// AFTER:
const [isVegetarian, setIsVegetarian] = useState(false);
```

#### 2. Update Checkbox Label (Line 1074-1076)
```tsx
// BEFORE:
<label htmlFor="vegan" className="text-sm text-gray-300 cursor-pointer">
  🌱 This dish is Vegan
</label>

// AFTER:
<label htmlFor="vegetarian" className="text-sm text-gray-300 cursor-pointer">
  🥕 This dish is Vegetarian
</label>
```

#### 3. Update Checkbox Component (Line 1068-1072)
```tsx
// BEFORE:
<Checkbox
  id="vegan"
  checked={isVegan}
  onCheckedChange={(checked) => setIsVegan(checked as boolean)}
  className="dietary-checkbox"
/>

// AFTER:
<Checkbox
  id="vegetarian"
  checked={isVegetarian}
  onCheckedChange={(checked) => setIsVegetarian(checked as boolean)}
  className="dietary-checkbox"
/>
```

#### 4. Update Database Field Usage (Lines 549, 576, 595, 598, 610)
```tsx
// Update all instances where isVegan is used:
// Line 549, 576: handleAddDish function
is_vegan: isVegetarian,  // Changed from isVegan

// Line 595, 598: confirmation email parameters
isVegan: isVegetarian,  // Changed

// Line 610: confirmation dialog condition
if (isVegetarian || isGlutenFree) {
```

#### 5. Update Display in Contributions List (Line 1127)
```tsx
// BEFORE:
{item.is_vegan && <span title="Vegan">🌱</span>}

// AFTER:
{item.is_vegetarian && <span title="Vegetarian">🥕</span>}
```

#### 6. Update Reset Function (Line 623-625)
```tsx
// BEFORE:
setIsVegan(false);

// AFTER:
setIsVegetarian(false);
```

#### 7. Update Edit Function (Line 643)
```tsx
// BEFORE:
setIsVegan(item.is_vegan);

// AFTER:
setIsVegetarian(item.is_vegetarian);
```

#### 8. Update Confirmation Dialog (Line 1200-1204)
```tsx
// BEFORE:
<p className="font-semibold text-white">Vegan</p>
<p className="text-sm text-gray-400">
  Contains no animal products whatsoever...
</p>

// AFTER:
<p className="font-semibold text-white">Vegetarian</p>
<p className="text-sm text-gray-400">
  Contains no meat, but may include dairy, eggs, or honey. 
  May not be suitable for vegans.
</p>
```

### Database Consideration
**Important**: The database field is `is_vegan` but we're now treating it as vegetarian. Options:

**Option A - Keep field name (Quick Fix)**:
- Use existing `is_vegan` field for vegetarian status
- No database migration needed
- Comment in code explaining field purpose change

**Option B - Add new field (Proper Fix)**:
```sql
-- New migration file
ALTER TABLE potluck_items 
ADD COLUMN is_vegetarian BOOLEAN DEFAULT false;

-- Copy existing is_vegan to is_vegetarian
UPDATE potluck_items 
SET is_vegetarian = is_vegan;

-- Optional: Keep is_vegan for true vegans, add separate vegetarian field
```

### Testing
- [ ] Checkbox says "This dish is Vegetarian"
- [ ] Checkbox shows carrot emoji (🥕)
- [ ] Checking box saves correctly to database
- [ ] Contribution list shows vegetarian badge
- [ ] Confirmation dialog shows vegetarian definition
- [ ] Edit functionality works with new field
- [ ] Email confirmation includes vegetarian status

---

## 3.2 Add "Can't Attend" Option

### Files to Modify
- `src/pages/RSVP.tsx`

### Implementation

#### 1. Add Decline Handler Function (After line 492)
```tsx
const handleDeclineRsvp = async () => {
  if (!user) return;
  
  try {
    setIsSubmitting(true);
    
    if (existingRsvp) {
      // Update existing RSVP to declined
      const { error } = await supabase
        .from('rsvps')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Reload RSVP data
      const { data: updatedData } = await supabase
        .from('rsvps')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (updatedData) {
        const guestData = updatedData.additional_guests as unknown as AdditionalGuest[] | null;
        setExistingRsvp({
          id: updatedData.id,
          name: updatedData.name,
          email: updatedData.email,
          num_guests: updatedData.num_guests,
          dietary_restrictions: updatedData.dietary_restrictions,
          additional_guests: guestData,
          created_at: updatedData.created_at,
          updated_at: updatedData.updated_at,
          status: updatedData.status,
        });
      }
      
      toast({
        title: "RSVP Updated",
        description: "We're sorry you can't make it. You can change your mind anytime!",
        variant: "default"
      });
    } else {
      // Create new declined RSVP
      const { data, error } = await supabase
        .from('rsvps')
        .insert([{
          user_id: user.id,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: user.email!,
          num_guests: 0,
          status: 'declined'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setExistingRsvp({
          id: data.id,
          name: data.name,
          email: data.email,
          num_guests: data.num_guests,
          dietary_restrictions: data.dietary_restrictions,
          additional_guests: null,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status,
        });
      }
      
      toast({
        title: "RSVP Received",
        description: "Thanks for letting us know. Hope to see you next time!",
        variant: "default"
      });
    }
  } catch (error) {
    console.error("Decline RSVP Error:", error);
    toast({
      title: "Error",
      description: "Failed to update RSVP. Please try again.",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 2. Add "Can't Attend" Button in Sealed Card (After line 789)
```tsx
<div className="mt-8 text-center space-y-4">
  <Button
    type="button"
    onClick={handleEditRsvp}
    className="bg-accent-purple hover:bg-accent-purple/80 text-white font-subhead text-lg px-12 py-4 glow-gold motion-safe hover:scale-105 transition-transform"
  >
    <Edit className="h-5 w-5 mr-2" />
    Modify Your Fate
  </Button>
  
  {/* NEW: Can't Attend Button */}
  {existingRsvp.status !== 'declined' && (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={handleDeclineRsvp}
        disabled={isSubmitting}
        className="border-accent-red/30 text-accent-red hover:bg-accent-red/10 font-subhead text-sm px-8 py-3"
      >
        {isSubmitting ? "Updating..." : "Sorry, I Can't Attend"}
      </Button>
    </div>
  )}
  
  <p className="font-body text-xs text-muted-foreground mt-4 max-w-md mx-auto">
    Need to update your guest count or dietary restrictions? Click above to make changes.
  </p>
</div>
```

#### 3. Show Declined Status in Sealed Card (Line 714-720)
```tsx
// AFTER the card header, add status badge:
{existingRsvp.status === 'declined' && (
  <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg">
    <p className="text-center text-accent-red font-subhead text-lg">
      You've indicated you cannot attend this event.
    </p>
    <p className="text-center text-muted-foreground text-sm mt-2">
      Changed your mind? Click "Modify Your Fate" below to update your RSVP.
    </p>
  </div>
)}
```

### Testing
- [ ] "Can't Attend" button visible when status is not declined
- [ ] Clicking button sets status to 'declined'
- [ ] Declined status shows in sealed card
- [ ] Can still edit RSVP after declining
- [ ] Can change from declined to attending
- [ ] Proper confirmation messages shown
- [ ] Database updates correctly

---

## 3.3 Notification Preferences Checkbox

### Files to Modify
- `src/pages/RSVP.tsx`

### Implementation

#### 1. Add State for Notification Preference (Line 69)
```tsx
const [receiveNotifications, setReceiveNotifications] = useState(true);
```

#### 2. Load Preference from Database (In useEffect after line 164)
```tsx
// Load notification preference if user has one
const { data: prefData } = await supabase
  .from('notification_preferences')
  .select('in_app_notifications, email_on_event_update')
  .eq('user_id', user.id)
  .maybeSingle();

if (prefData) {
  setReceiveNotifications(prefData.email_on_event_update ?? true);
}
```

#### 3. Add Checkbox to Optional Details Section (After line 991)
```tsx
<div className="pt-4 border-t border-accent-purple/30">
  <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
    <Checkbox
      id="notifications"
      checked={receiveNotifications}
      onCheckedChange={(checked) => setReceiveNotifications(checked as boolean)}
      className="mt-1"
    />
    <div className="flex-1">
      <label htmlFor="notifications" className="text-sm font-medium text-white cursor-pointer block">
        Keep me informed about event updates
      </label>
      <p className="text-xs text-muted-foreground mt-1">
        Receive notifications about event changes, new features, and important announcements.
        You can manage your notification preferences in{" "}
        <Link to="/settings" className="text-accent-gold hover:underline">
          Settings
        </Link>.
      </p>
    </div>
  </div>
</div>
```

#### 4. Save Preference on Submit (In handleSubmit after line 415)
```tsx
// Sync notification preference
try {
  await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user!.id,
      email_on_event_update: receiveNotifications,
      in_app_notifications: receiveNotifications,
    }, {
      onConflict: 'user_id'
    });
} catch (err) {
  console.warn('Failed to save notification preference:', err);
  // Don't fail RSVP if this fails
}
```

### Testing
- [ ] Checkbox visible in optional details
- [ ] Checkbox checked by default
- [ ] Link to Settings works
- [ ] Preference saves to notification_preferences table
- [ ] Preference loads on revisit
- [ ] RSVP still works if notification save fails

---

## 3.4 Share/Invite Friend Feature

### Files to Modify
- `src/pages/RSVP.tsx`
- `supabase/functions/send-friend-invitation/index.ts` (new)

### Implementation

#### 1. Add Invite Modal State (Line 70)
```tsx
const [showInviteModal, setShowInviteModal] = useState(false);
const [inviteForm, setInviteForm] = useState({
  friendName: '',
  friendEmail: '',
  personalMessage: ''
});
```

#### 2. Add Invite Button to Sealed Card (After decline button, line 800)
```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => setShowInviteModal(true)}
  className="border-accent-gold/30 text-accent-gold hover:bg-accent-gold/10 font-subhead text-sm px-8 py-3"
>
  <Mail className="h-4 w-4 mr-2" />
  Invite a Friend
</Button>
```

#### 3. Add Invite Modal Component (Before closing </RequireAuth>, line 1257)
```tsx
{/* Friend Invitation Modal */}
<Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
  <DialogContent className="bg-card border border-accent-purple/30 sm:max-w-lg">
    <DialogHeader>
      <DialogTitle className="text-white text-2xl font-heading">
        Invite a Friend to the Bash
      </DialogTitle>
      <DialogDescription className="text-gray-300">
        Share this twisted tale with someone special. They'll receive a personalized invitation from you.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="friendName">Friend's Name *</Label>
        <Input
          id="friendName"
          value={inviteForm.friendName}
          onChange={(e) => setInviteForm(prev => ({ ...prev, friendName: e.target.value }))}
          placeholder="Enter their name"
          className="bg-background border-input"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="friendEmail">Friend's Email *</Label>
        <Input
          id="friendEmail"
          type="email"
          value={inviteForm.friendEmail}
          onChange={(e) => setInviteForm(prev => ({ ...prev, friendEmail: e.target.value }))}
          placeholder="friend@example.com"
          className="bg-background border-input"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="personalMessage">Personal Message (Optional)</Label>
        <textarea
          id="personalMessage"
          value={inviteForm.personalMessage}
          onChange={(e) => setInviteForm(prev => ({ ...prev, personalMessage: e.target.value }))}
          placeholder="Add a personal note to your invitation..."
          rows={3}
          maxLength={280}
          className="w-full px-4 py-2 rounded-lg bg-background border border-input text-white focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none transition-all resize-none"
        />
        <p className="text-xs text-gray-500">{inviteForm.personalMessage.length}/280 characters</p>
      </div>
    </div>
    
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => {
          setShowInviteModal(false);
          setInviteForm({ friendName: '', friendEmail: '', personalMessage: '' });
        }}
        className="flex-1 border-accent-purple/30"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSendInvite}
        disabled={!inviteForm.friendName.trim() || !inviteForm.friendEmail.trim() || isSubmitting}
        className="flex-1 bg-accent-red hover:bg-accent-red/90 glow-gold"
      >
        {isSubmitting ? "Sending..." : "Send Invitation"}
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

#### 4. Add Send Invite Handler (After line 492)
```tsx
const handleSendInvite = async () => {
  if (!inviteForm.friendName.trim() || !inviteForm.friendEmail.trim()) {
    toast({
      title: "Missing Information",
      description: "Please provide your friend's name and email.",
      variant: "destructive"
    });
    return;
  }
  
  try {
    setIsSubmitting(true);
    
    const { error } = await supabase.functions.invoke('send-friend-invitation', {
      body: {
        inviterName: existingRsvp?.name || user?.email,
        friendName: inviteForm.friendName.trim(),
        friendEmail: inviteForm.friendEmail.trim(),
        personalMessage: inviteForm.personalMessage.trim() || undefined,
        eventUrl: window.location.origin
      }
    });
    
    if (error) throw error;
    
    toast({
      title: "Invitation Sent! 🎃",
      description: `Your friend ${inviteForm.friendName} will receive an invitation email shortly.`,
      variant: "default"
    });
    
    setShowInviteModal(false);
    setInviteForm({ friendName: '', friendEmail: '', personalMessage: '' });
  } catch (error) {
    console.error('Invite error:', error);
    toast({
      title: "Failed to Send",
      description: "Could not send invitation. Please try again.",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 5. Create Edge Function (New file)
**File**: `supabase/functions/send-friend-invitation/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_SECRET_KEY = Deno.env.get("MAILJET_SECRET_KEY");

serve(async (req) => {
  try {
    const { inviterName, friendName, friendEmail, personalMessage, eventUrl } = await req.json();
    
    // Send email via Mailjet
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`)}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: "noreply@partytillyou.rip",
              Name: "The Ruths' Twisted Fairytale Bash"
            },
            To: [
              {
                Email: friendEmail,
                Name: friendName
              }
            ],
            Subject: `${inviterName} invited you to The Ruths' Twisted Fairytale Halloween Bash!`,
            TextPart: `Hi ${friendName},\n\n${inviterName} has invited you to The Ruths' Twisted Fairytale Halloween Bash!\n\n${personalMessage ? `Personal message: "${personalMessage}"\n\n` : ""}RSVP now: ${eventUrl}/rsvp\n\nSee you there!`,
            HTMLPart: `
              <h2>You're Invited!</h2>
              <p>${inviterName} thought you'd enjoy The Ruths' Twisted Fairytale Halloween Bash.</p>
              ${personalMessage ? `<blockquote style="border-left: 4px solid #f59e0b; padding-left: 1rem; margin: 1rem 0;">"${personalMessage}"</blockquote>` : ""}
              <a href="${eventUrl}/rsvp" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 1rem 0;">RSVP Now</a>
            `
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Mailjet error: ${response.statusText}`);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

### Testing
- [ ] "Invite a Friend" button visible after RSVP
- [ ] Modal opens with form fields
- [ ] Name and email are required
- [ ] Personal message is optional
- [ ] Character count works (280 max)
- [ ] Send button disabled when invalid
- [ ] Email sends successfully
- [ ] Friend receives formatted email
- [ ] Modal closes after send
- [ ] Form resets for next invite

---

## Completion Checklist

- [ ] Vegetarian label updated (all instances)
- [ ] Can't attend option working
- [ ] Notification checkbox implemented
- [ ] Friend invitation feature complete
- [ ] Edge function deployed
- [ ] All database fields updated
- [ ] Comprehensive testing complete
- [ ] Ready to commit

## Git Commit Message

```
feat(rsvp): add vegetarian option, decline RSVP, notifications, and friend invites

- Change "Vegan" checkbox to "Vegetarian" with updated validation
- Add "Can't Attend" button to decline RSVP while keeping form visible
- Add notification preferences checkbox linked to settings
- Implement friend invitation feature with personalized messages
- Create send-friend-invitation edge function
- Update UI to show declined status clearly

Enhances RSVP functionality with user-requested features.
```


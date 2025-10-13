# User Settings Enhancement - Phase 2 Implementation

## 🎯 Overview

This is Phase 2 of the user settings implementation. The core settings page exists but needs database completion and enhanced features. This prompt covers both critical database fixes and user experience improvements.

## 🗄️ Database Requirements (CRITICAL - Must Complete First)

### Current State Analysis
- ✅ `avatar_url` column exists in profiles table (from migration `20251013232824`)
- ✅ Basic RPC functions partially implemented
- ❌ **MISSING**: Complete `update_user_email` RPC function
- ❌ **MISSING**: Enhanced `handle_new_user` function for avatar support
- ❌ **POTENTIAL ISSUE**: Storage policies may need adjustment

### Required Database Migration

**IMPORTANT**: Apply this migration to complete the user settings database setup:

```sql
-- Complete the missing RPC functions from the existing migration
-- This continues from migration 20251013232824_72d4e745-3d40-4588-90ae-e1677bf57c76.sql

-- Complete the update_user_profile function (if truncated)
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_display_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Update profile
  UPDATE public.profiles 
  SET 
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    -- Create profile if it doesn't exist (fallback)
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    SELECT v_user_id, au.email, p_display_name, p_avatar_url
    FROM auth.users au WHERE au.id = v_user_id
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();
  END IF;

  RETURN QUERY SELECT true, 'Profile updated successfully'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- Function to update user email
CREATE OR REPLACE FUNCTION public.update_user_email(
  p_new_email TEXT
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Email validation
  IF p_new_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN QUERY SELECT false, 'Invalid email format'::TEXT;
    RETURN;
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_new_email AND id != v_user_id) THEN
    RETURN QUERY SELECT false, 'Email already in use'::TEXT;
    RETURN;
  END IF;

  -- Update profile email
  UPDATE public.profiles 
  SET email = p_new_email, updated_at = now()
  WHERE id = v_user_id;

  RETURN QUERY SELECT true, 'Email updated successfully. Please verify your new email.'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_email TO authenticated;

-- Update the handle_new_user function to include avatar_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
```

## 🎨 User Experience Enhancements

### Current Settings Page Status
**Reference existing files:**
- `src/pages/UserSettings.tsx` - Main settings page (✅ implemented)
- `src/components/settings/ProfileSettings.tsx` - Avatar & profile (✅ implemented) 
- `src/components/settings/AccountSettings.tsx` - Account info (✅ implemented)
- `src/components/settings/SecuritySettings.tsx` - Security features (✅ implemented)
- `src/lib/profile-api.ts` - Profile API functions (✅ implemented)

### Phase 2 Enhancement Requirements

#### 1. **Avatar Integration in Navigation** 
**Goal**: Show user avatars throughout the application

**Implementation**:
- Update `src/components/NavBar.tsx` to display user avatar in dropdown
- Modify user dropdown to show avatar + name instead of just initials
- Add avatar loading states and fallbacks
- Ensure mobile responsiveness

**Reference**: 
- Current NavBar: `src/components/NavBar.tsx` (lines 1-400)
- Profile API: `src/lib/profile-api.ts` (getCurrentUserProfile function)

#### 2. **Real-time Avatar Updates**
**Goal**: Avatar changes reflect immediately across the app

**Implementation**:
- Add avatar context or state management for real-time updates
- Update NavBar avatar when user changes it in settings
- Implement optimistic updates for better UX
- Add proper cache invalidation

#### 3. **Enhanced Account Statistics**
**Goal**: Replace placeholder stats with real data

**Current State**: `AccountSettings.tsx` shows placeholder "-" values

**Implementation**:
- Create API functions to get user activity stats:
  - Photos uploaded count
  - Guestbook posts count  
  - Events attended count
  - Days active calculation
- Update AccountSettings component to fetch and display real data
- Add loading states for statistics

**Database Queries Needed**:
```sql
-- Get user stats
SELECT 
  (SELECT COUNT(*) FROM photos WHERE user_id = auth.uid()) as photos_count,
  (SELECT COUNT(*) FROM guestbook WHERE user_id = auth.uid()) as posts_count,
  (SELECT COUNT(*) FROM rsvps WHERE user_id = auth.uid()) as rsvps_count,
  (SELECT DATE_PART('day', NOW() - created_at) FROM profiles WHERE id = auth.uid()) as days_active;
```

#### 4. **Profile Completion Wizard**
**Goal**: Guide new users through profile setup

**Implementation**:
- Detect incomplete profiles (missing avatar or display_name)
- Show subtle prompts to complete profile
- Add progress indicator for profile completion
- Integrate with onboarding flow

#### 5. **Avatar Cropping & Enhancement**
**Goal**: Better avatar upload experience

**Implementation**:
- Add image cropping functionality before upload
- Implement drag & drop zone improvements
- Add image rotation and basic editing
- Show better preview during upload process
- Add avatar removal confirmation dialog

#### 6. **Settings Search & Navigation**
**Goal**: Improve settings discoverability

**Implementation**:
- Add search functionality within settings
- Implement keyboard shortcuts (Cmd/Ctrl + K)
- Add breadcrumb navigation
- Implement deep linking to specific settings sections

## 🔗 Integration Requirements

### Admin Dashboard Integration
**Goal**: Connect user settings with admin management

**Reference Files**:
- `src/components/admin/UserManagement.tsx` - Current admin user management
- `src/pages/AdminDashboard.tsx` - Admin dashboard structure

**Implementation**:
- Add "View Profile" button in admin user management
- Allow admins to view user avatars and profiles
- Add admin override capabilities for user profiles
- Integrate user settings data into admin analytics

### Mobile Optimization
**Goal**: Perfect mobile experience for settings

**Current State**: Basic responsive design exists

**Implementation**:
- Optimize touch interactions for avatar upload
- Improve mobile form layouts
- Add swipe gestures for tab navigation
- Enhance mobile keyboard handling
- Add haptic feedback for mobile interactions

## 🛡️ Security Enhancements

### Two-Factor Authentication Preparation
**Goal**: Prepare foundation for 2FA implementation

**Current State**: Placeholder in SecuritySettings.tsx

**Implementation**:
- Add 2FA setup UI components
- Implement QR code generation for authenticator apps
- Add backup codes generation and storage
- Create 2FA verification flow
- Add 2FA recovery options

### Session Management
**Goal**: Advanced session control for users

**Implementation**:
- Display active sessions with device info
- Add session termination capabilities
- Show login history and locations
- Add suspicious activity detection
- Implement device trust management

## 📱 Progressive Web App Features

### Offline Profile Editing
**Goal**: Allow profile editing when offline

**Implementation**:
- Cache profile data for offline access
- Implement offline avatar preview
- Add sync queue for when connection returns
- Show offline status indicators

### Push Notifications for Profile
**Goal**: Notify users about profile-related events

**Implementation**:
- Profile completion reminders
- Security change notifications
- Avatar approval notifications (if moderation enabled)

## 🎯 Implementation Priority

### Phase 2A: Core Enhancements (High Priority)
1. ✅ **Database migration completion** (CRITICAL - do first)
2. 🎯 **Avatar integration in NavBar** 
3. 🎯 **Real account statistics**
4. 🎯 **Real-time avatar updates**

### Phase 2B: UX Improvements (Medium Priority)
5. 🎯 **Avatar cropping and enhancement**
6. 🎯 **Profile completion wizard**
7. 🎯 **Settings search functionality**

### Phase 2C: Advanced Features (Lower Priority)
8. 🎯 **2FA foundation setup**
9. 🎯 **Session management**
10. 🎯 **Admin integration**

## 📋 Success Criteria

### Functional Requirements
- ✅ Database migration completes without errors
- ✅ Avatar uploads work and display in NavBar immediately
- ✅ Real user statistics display in Account tab
- ✅ Profile changes reflect across the application instantly
- ✅ Mobile experience is smooth and touch-friendly

### Performance Requirements  
- ✅ Avatar loading < 2 seconds
- ✅ Settings page loads < 1 second
- ✅ Real-time updates < 500ms
- ✅ Mobile interactions feel native

### Security Requirements
- ✅ All profile updates go through secure RPC functions
- ✅ File uploads are properly validated and scoped
- ✅ User data access follows RLS policies
- ✅ No client-side security bypasses possible

## 🔧 Technical Notes

### File References (You Have Access To)
- **Settings Components**: `src/components/settings/` (all files)
- **Profile API**: `src/lib/profile-api.ts`
- **Auth System**: `src/lib/auth.tsx`
- **NavBar Component**: `src/components/NavBar.tsx`
- **Database Types**: `src/integrations/supabase/types.ts`
- **Admin Components**: `src/components/admin/UserManagement.tsx`

### Styling Guidelines
- **Theme**: Follow existing gold (`accent-gold`) and purple (`accent-purple`) theme
- **Components**: Use existing shadcn/ui component library
- **Responsive**: Mobile-first approach with Tailwind CSS
- **Animations**: Smooth transitions, loading states, optimistic updates

### Error Handling
- **User-friendly messages**: Clear, actionable error descriptions
- **Retry mechanisms**: Allow users to retry failed operations
- **Fallback states**: Graceful degradation when features fail
- **Logging**: Proper error logging for debugging

Start with the database migration completion, then proceed with avatar NavBar integration and real statistics. Focus on creating a seamless, professional user experience that matches the high quality of the existing application.

# Twisted Tale Email Templates

Custom email templates for Supabase authentication with the Twisted Tale theme.

## Installation Instructions

1. Go to your Supabase Dashboard: [Authentication → Email Templates](https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/auth/templates)

2. For each template type, copy the corresponding HTML file and paste it into the template editor:

### Template Mapping

| Template Type | File | Supabase Variables Used |
|--------------|------|------------------------|
| **Magic Link** | `01-magic-link.html` | `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .RedirectTo }}` |
| **Confirm signup** | `02-confirm-signup.html` | `{{ .ConfirmationURL }}` |
| **Invite user** | `03-invite-user.html` | `{{ .ConfirmationURL }}` |
| **Change Email Address** | `04-change-email.html` | `{{ .Email }}`, `{{ .Token }}`, `{{ .ConfirmationURL }}` |
| **Reset Password** | `05-reset-password.html` | `{{ .ConfirmationURL }}` |
| **Reauthenticate** | `06-reauthenticate.html` | `{{ .ConfirmationURL }}` |

## Design Features

All templates include:
- 🎨 Dark purple gradient background (#2d1b4e to #1a0f2e)
- ✨ Gold accent color (#d4af37) for buttons and highlights
- 🎭 Gothic/fairytale aesthetic matching your site
- 📱 Mobile responsive design
- 🔒 Security notices where appropriate
- 📍 Event details (November 1st, 2025 • Denver, Colorado)

## Customization

To customize these templates:
1. Update event details in the footer sections
2. Adjust colors by changing the hex values
3. Modify button text or styling as needed
4. Add or remove content sections

## Testing

After adding templates to Supabase:
1. Test the magic link flow with OTP codes
2. Verify button links work correctly
3. Check mobile rendering
4. Ensure all Supabase variables populate correctly

## Notes

- All templates use inline CSS for maximum email client compatibility
- Supabase automatically populates the `{{ .Variable }}` placeholders
- Links are configured to work with your redirect URLs
- Templates include both action buttons and fallback text links

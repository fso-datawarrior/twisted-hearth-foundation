# CODE REVIEW CHECKLIST

## Security
- [ ] **01** Move hardcoded Supabase credentials to environment variables
- [ ] **02** Create server-side Supabase client with service role key
- [ ] **03** Restrict RLS policies to authenticated users only
- [ ] **04** Add input validation to Edge Functions using Zod
- [ ] **11** Create .env.example file with all required variables
- [ ] Verify no secrets are committed to repository
- [ ] Test RLS policies with different user roles
- [ ] Validate all API endpoints have proper authentication

## Performance
- [ ] **05** Replace console.log statements with proper logging utility
- [ ] **08** Split large bundle into smaller chunks
- [ ] **10** Add explicit width/height to all images and videos
- [ ] Enable gzip compression on server
- [ ] Implement lazy loading for heavy components
- [ ] Optimize image formats (WebP, AVIF)
- [ ] Set up proper cache headers

## Accessibility
- [ ] **09** Enhance skip links with proper focus styling
- [ ] Add proper ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works throughout
- [ ] Test with screen readers
- [ ] Verify color contrast meets WCAG standards
- [ ] Add focus indicators for all focusable elements
- [ ] Test with reduced motion preferences

## Developer Experience
- [ ] **06** Enable TypeScript strict mode
- [ ] **07** Add error boundaries per route
- [ ] **12** Standardize error handling patterns
- [ ] Set up proper ESLint rules
- [ ] Add pre-commit hooks
- [ ] Create comprehensive README
- [ ] Add development setup instructions
- [ ] Set up proper debugging tools

## Testing
- [ ] Add unit tests for critical functions
- [ ] Add integration tests for auth flows
- [ ] Add E2E tests for main user journeys
- [ ] Test error boundary recovery
- [ ] Test RLS policy enforcement
- [ ] Test Edge Function validation
- [ ] Test accessibility compliance

## Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add performance monitoring
- [ ] Set up logging aggregation
- [ ] Monitor bundle size changes
- [ ] Track Core Web Vitals
- [ ] Set up uptime monitoring
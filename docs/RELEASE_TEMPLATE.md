# Release Template for The Ruths' Bash

## Version Information
VERSION: [e.g., 3.0.5]
RELEASE_DATE: [YYYY-MM-DD]
ENVIRONMENT: [production/staging/development]

## Executive Summary
[Brief overview of this release (max 200 words)]

## Features
<!-- Format: TITLE | DESCRIPTION | BENEFIT | SORT_ORDER -->
- [Feature Title] | [Detailed description] | [User benefit] | 0
- [Feature Title] | [Detailed description] | [User benefit] | 1

## API Changes
<!-- Format: ENDPOINT | TYPE (new/modified/deprecated/removed) | DESCRIPTION | SORT_ORDER -->
- [/api/endpoint] | [new] | [Description of change] | 0

## UI Updates
<!-- Format: DESCRIPTION | COMPONENT | SORT_ORDER -->
- [Description of UI change] | [Component name] | 0

## Bug Fixes
<!-- Format: DESCRIPTION | COMPONENT | SORT_ORDER -->
- [Bug description and fix] | [Component name] | 0

## Improvements
<!-- Format: DESCRIPTION | COMPONENT | SORT_ORDER -->
- [Improvement description] | [Component name] | 0

## Database Changes
<!-- Format: DESCRIPTION | SORT_ORDER -->
- [Database change description] | 0

## Breaking Changes
<!-- Format: CONTENT -->
- [Breaking change that requires action]

## Known Issues
<!-- Format: CONTENT -->
- [Known issue description]

## Technical Notes
<!-- Format: CONTENT -->
- [Technical note for developers]

---

## Instructions for LLM
When provided with project documentation (like SUMMARY.md), analyze the changes and fill out this template:
1. Parse version and date from context
2. Extract features, fixes, and changes
3. Categorize appropriately
4. Maintain sort_order for display priority
5. Write clear, user-friendly descriptions
6. Include technical details in Technical Notes section

## Example Usage

### Features Section
```
- Enhanced Photo Gallery | Improved photo loading with lazy loading and better caching | Faster page loads and smoother browsing | 0
- New RSVP System | Completely redesigned RSVP flow with email confirmations | Easier for guests to confirm attendance | 1
```

### API Changes Section
```
- /api/releases | new | New endpoint for fetching release information | 0
- /api/users/profile | modified | Added support for avatar uploads | 1
```

### Bug Fixes Section
```
- Fixed navbar collision at 1880px viewport width | NavBar.tsx | 0
- Resolved memory leak in photo carousel | PhotoCarousel.tsx | 1
```

### Breaking Changes Section
```
- Release Management API now requires authentication for all endpoints. Update your API calls to include auth headers.
```

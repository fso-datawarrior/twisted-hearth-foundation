# 🚨 Lovable AI Project Rules

This project is integrated with Lovable AI and has specific components that **MUST NOT** be modified to maintain compatibility.

## Protected Files & Directories

### ❌ NEVER MODIFY

#### Core Configuration
- `vite.config.ts` - Contains Lovable AI's componentTagger plugin
- `components.json` - shadcn/ui configuration with Lovable AI aliases
- `package.json` - Contains Lovable AI dependencies
- `tsconfig.json` - TypeScript configuration with Lovable AI path aliases
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration

#### Core Application Files
- `src/main.tsx` - React application entry point
- `src/App.tsx` - Main application component with routing

#### UI Component Library
- `src/components/ui/` - **ENTIRE DIRECTORY** (shadcn/ui components)
- `src/lib/utils.ts` - Contains the `cn()` utility function

#### Lovable AI Dependencies
- `lovable-tagger` package
- All `@radix-ui/*` packages
- `class-variance-authority`
- `tailwind-merge`

### ✅ SAFE TO MODIFY

#### Application Components
- `src/pages/` - All page components
- `src/components/` - Custom components (except `ui/` subdirectory)
- `src/lib/` - Custom utilities (except `utils.ts`)
- `src/hooks/` - Custom React hooks
- `src/integrations/` - Database and service integrations

#### Assets & Styling
- `public/` - All static assets
- Custom CSS in `src/index.css` (beyond Lovable AI variables)
- Custom Tailwind extensions in `tailwind.config.ts`

## Development Guidelines

1. **Always use `@/` path aliases** for imports
2. **Never modify files in `src/components/ui/`** - These are auto-generated
3. **Never modify core configuration files** - This breaks Lovable AI
4. **Keep the `cn()` utility function intact** - Used by all UI components
5. **Don't modify the Lovable AI plugin** in `vite.config.ts`

## Warning

Modifying protected files will:
- Break Lovable AI integration
- Cause the project to stop working in Lovable AI environment
- Require manual restoration of the original files

## Quick Reference

```
❌ PROTECTED:
├── vite.config.ts
├── components.json
├── package.json
├── tsconfig.json
├── src/main.tsx
├── src/App.tsx
├── src/lib/utils.ts
└── src/components/ui/ (entire directory)

✅ SAFE TO MODIFY:
├── src/pages/
├── src/components/ (except ui/)
├── src/lib/ (except utils.ts)
├── src/hooks/
├── src/integrations/
└── public/
```


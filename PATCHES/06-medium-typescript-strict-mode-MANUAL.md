# TypeScript Strict Mode Patch (Manual Application Required)

**Status**: Cannot be auto-applied (config files are read-only)  
**Priority**: Medium  
**Impact**: Improves type safety and catches potential bugs

## Files to Modify

### 1. tsconfig.app.json

Change lines 17-22 from:
```json
    /* Linting */
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "noFallthroughCasesInSwitch": false,
```

To:
```json
    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
```

### 2. tsconfig.json

Change lines 4-15 from:
```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
```

To:
```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "skipLibCheck": true,
    "allowJs": true
  }
```

## What This Enables

- **strict: true** - Enables all strict type checking options including:
  - `noImplicitAny` - Catch implicit 'any' types
  - `strictNullChecks` - Catch null/undefined errors
  - `strictFunctionTypes` - Stricter function type checking
  - `strictPropertyInitialization` - Ensure class properties are initialized
  
- **noFallthroughCasesInSwitch: true** - Catch missing break statements in switch cases

## Why We Keep Some Options Disabled

- `noUnusedLocals: false` - Allow unused variables (common during development)
- `noUnusedParameters: false` - Allow unused function parameters (common in React callbacks)

## Expected Build Output

After applying this patch, you may see TypeScript warnings. These are helpful for catching potential bugs but won't prevent the build from succeeding.

## How to Apply

1. Open the files in your code editor
2. Make the changes shown above
3. Save the files
4. The TypeScript compiler will automatically pick up the new settings

## When to Apply

Apply this patch when:
- You're ready to improve code quality
- You have time to address potential type warnings
- You want to catch bugs earlier in development

**Note**: This is optional for development but recommended for production quality code.

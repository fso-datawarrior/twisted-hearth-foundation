# Settings Configuration

This directory contains configuration files for various system features.

## Hunt System Settings

**File**: `hunt-settings.ts`

Controls the scavenger hunt system. This is the main way to enable or disable the hunt feature.

### Quick Usage

1. Open `src/settings/hunt-settings.ts`
2. Change `HUNT_ENABLED: false` to `HUNT_ENABLED: true` to enable
3. Change `HUNT_ENABLED: true` to `HUNT_ENABLED: false` to disable
4. Restart the application

### Configuration Options

```typescript
export const HUNT_SETTINGS = {
  // Main hunt system control
  HUNT_ENABLED: false, // Change this to true/false to enable/disable hunt
  
  // Optional: Override environment variable
  FORCE_OVERRIDE: false, // Set to true to use the HUNT_ENABLED value above
  
  // Optional: Development mode overrides
  DEV_OVERRIDE: false, // Set to true to allow localStorage overrides in dev mode
}
```

### Priority Order

1. **Environment Variable**: `VITE_HUNT_ENABLED=true` (if set)
2. **Force Override**: If `FORCE_OVERRIDE: true`, uses `HUNT_ENABLED` value
3. **Development Override**: If `DEV_OVERRIDE: true`, allows localStorage overrides
4. **Default**: Uses `HUNT_ENABLED` value

### Examples

**Disable Hunt (Default)**:
```typescript
HUNT_ENABLED: false
```

**Enable Hunt**:
```typescript
HUNT_ENABLED: true
```

**Force Override Environment**:
```typescript
HUNT_ENABLED: true,
FORCE_OVERRIDE: true
```

## Notes

- Changes require an application restart to take effect
- The hunt system is completely disabled when `HUNT_ENABLED: false`
- All hunt components will return `null` when disabled
- No hunt-related processing occurs when disabled

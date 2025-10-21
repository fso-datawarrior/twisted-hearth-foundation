// Force-correct React JSX runtime exports for any imports that incorrectly target CJS wrappers
// This module re-exports the ESM JSX runtime so named exports exist as expected.
export { jsx, jsxs, Fragment } from 'react/jsx-runtime';
export { jsxDEV } from 'react/jsx-dev-runtime';

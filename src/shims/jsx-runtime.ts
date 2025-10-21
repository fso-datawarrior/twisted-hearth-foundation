// Shim to ensure Vite prebundles the correct ESM React JSX runtimes
// and avoid accidental resolution to the CommonJS wrappers.
export { jsx, jsxs, Fragment } from 'react/jsx-runtime';
export { jsxDEV } from 'react/jsx-dev-runtime';

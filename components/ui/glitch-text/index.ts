// Temporary local proxy to NPM package
// This allows the demo to work while package installation is resolved
// TODO: Replace with direct NPM import: import { GlitchText, useGlitchText } from 'glitch-text-effect/react';

// For now, we'll create a simple fallback component
export { default as GlitchText } from './fallback';
export { useGlitchTextFallback as useGlitchText } from './fallback';
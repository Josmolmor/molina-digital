import type { CharacterSet, TimingFunction, IntensityLevel } from './types';

/**
 * Predefined character sets for glitch effect
 */
export const CHARACTER_SETS = {
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;\':",./<>?`~',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  all: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;\':",./<>?`~'
} as const;

/**
 * Timing functions for animation easing
 */
export const TIMING_FUNCTIONS = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
} as const;

/**
 * Default configuration values based on intensity
 */
export const INTENSITY_PRESETS = {
  low: {
    duration: 800,
    revealRate: 0.7,
    glitchRate: 0.3,
    effects: { shake: false, flicker: false }
  },
  medium: {
    duration: 1200,
    revealRate: 0.5,
    glitchRate: 0.6,
    effects: { shake: true, flicker: false }
  },
  high: {
    duration: 1800,
    revealRate: 0.3,
    glitchRate: 0.9,
    effects: { shake: true, flicker: true, colorShift: true }
  }
} as const;

/**
 * Get character set string from CharacterSet type or custom string
 */
export function getCharacterSet(characters: CharacterSet | string): string {
  if (typeof characters === 'string' && characters.length > 0) {
    return CHARACTER_SETS[characters as CharacterSet] || characters;
  }
  return CHARACTER_SETS.letters;
}

/**
 * Get timing function from TimingFunction type or custom function
 */
export function getTimingFunction(timing: TimingFunction): (t: number) => number {
  if (typeof timing === 'function') {
    return timing;
  }
  return TIMING_FUNCTIONS[timing] || TIMING_FUNCTIONS.linear;
}

/**
 * Get random character from character set
 */
export function getRandomCharacter(characterSet: string): string {
  return characterSet[Math.floor(Math.random() * characterSet.length)];
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Get intensity preset configuration
 */
export function getIntensityPreset(intensity: IntensityLevel) {
  return INTENSITY_PRESETS[intensity];
}

/**
 * Normalize text lengths by padding shorter text with spaces
 */
export function normalizeTextLengths(from: string, to: string): [string, string] {
  const maxLength = Math.max(from.length, to.length);
  const normalizedFrom = from.padEnd(maxLength, ' ');
  const normalizedTo = to.padEnd(maxLength, ' ');
  return [normalizedFrom, normalizedTo];
}

/**
 * Generate random text of specified length using character set
 */
export function generateRandomText(length: number, characterSet: string): string {
  return Array.from({ length }, () => getRandomCharacter(characterSet)).join('');
}

/**
 * Calculate if character should be revealed based on progress and reveal rate
 */
export function shouldRevealCharacter(
  index: number, 
  textLength: number, 
  progress: number, 
  revealRate: number
): boolean {
  const normalizedIndex = index / textLength;
  const revealThreshold = progress * (1 + revealRate);
  return normalizedIndex <= revealThreshold;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
import type { GlitchConfig, GlitchInstance, AnimationState } from './types';
import {
  getCharacterSet,
  getTimingFunction,
  getIntensityPreset,
  normalizeTextLengths,
  generateRandomText,
  shouldRevealCharacter,
  prefersReducedMotion,
  clamp
} from './utils';

/**
 * Default configuration for glitch effect
 */
const DEFAULT_CONFIG: Required<Omit<GlitchConfig, 'from' | 'to' | 'onStart' | 'onProgress' | 'onComplete'>> = {
  duration: 1200,
  trigger: 'hover',
  intensity: 'medium',
  characters: 'letters',
  timing: 'easeOut',
  revealRate: 0.5,
  glitchRate: 0.6,
  effects: {
    shake: true,
    flicker: false,
    colorShift: false,
    scalePulse: false
  },
  respectReducedMotion: true,
  className: ''
};

/**
 * Core glitch engine - framework agnostic
 */
export class GlitchEngine {
  private element: HTMLElement;
  private config: Required<GlitchConfig>;
  private state: AnimationState;
  private originalText: string;
  private targetText: string;
  private characterSet: string;
  private timingFunction: (t: number) => number;

  constructor(element: HTMLElement, config: GlitchConfig) {
    this.element = element;
    this.originalText = config.from;
    this.targetText = config.to;
    
    // Merge with intensity preset and defaults
    const intensityPreset = config.intensity ? getIntensityPreset(config.intensity) : {};
    this.config = {
      ...DEFAULT_CONFIG,
      ...intensityPreset,
      ...config,
      effects: { 
        ...DEFAULT_CONFIG.effects, 
        ...(intensityPreset as any).effects, 
        ...(config.effects || {}) 
      }
    } as Required<GlitchConfig>;

    // Normalize text lengths
    const [normalizedFrom, normalizedTo] = normalizeTextLengths(this.originalText, this.targetText);
    this.originalText = normalizedFrom;
    this.targetText = normalizedTo;

    // Setup character set and timing function
    this.characterSet = getCharacterSet(this.config.characters);
    this.timingFunction = getTimingFunction(this.config.timing);

    // Initialize state
    this.state = {
      isRunning: false,
      startTime: 0,
      currentText: this.originalText,
      revealedIndices: new Set()
    };

    // Set initial text
    this.updateElementText(this.originalText);
  }

  /**
   * Start the glitch animation
   */
  public start(): void {
    if (this.state.isRunning) return;
    
    // Respect reduced motion preference
    if (this.config.respectReducedMotion && prefersReducedMotion()) {
      this.updateElementText(this.targetText);
      this.config.onComplete?.();
      return;
    }

    this.state.isRunning = true;
    this.state.startTime = performance.now();
    this.state.revealedIndices.clear();

    // Apply initial effects
    this.applyVisualEffects(true);

    // Start animation callback
    this.config.onStart?.();

    this.animate();
  }

  /**
   * Stop the animation
   */
  public stop(): void {
    if (!this.state.isRunning) return;
    
    this.state.isRunning = false;
    if (this.state.animationId) {
      cancelAnimationFrame(this.state.animationId);
      this.state.animationId = undefined;
    }

    this.applyVisualEffects(false);
  }

  /**
   * Reset to original state
   */
  public reset(): void {
    this.stop();
    this.state.currentText = this.originalText;
    this.state.revealedIndices.clear();
    this.updateElementText(this.originalText);
  }

  /**
   * Check if animation is running
   */
  public isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Destroy the instance and clean up
   */
  public destroy(): void {
    this.stop();
    this.applyVisualEffects(false);
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    if (!this.state.isRunning) return;

    const elapsed = performance.now() - this.state.startTime;
    const progress = clamp(elapsed / this.config.duration, 0, 1);
    const easedProgress = this.timingFunction(progress);

    // Generate current frame text
    this.generateFrameText(easedProgress);

    // Progress callback
    this.config.onProgress?.(progress);

    // Check if animation is complete
    if (progress >= 1) {
      this.state.isRunning = false;
      this.state.currentText = this.targetText;
      this.updateElementText(this.targetText);
      this.applyVisualEffects(false);
      this.config.onComplete?.();
      return;
    }

    // Schedule next frame
    this.state.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * Generate text for current animation frame
   */
  private generateFrameText(progress: number): void {
    const textLength = this.targetText.length;
    let frameText = '';

    for (let i = 0; i < textLength; i++) {
      const shouldReveal = shouldRevealCharacter(i, textLength, progress, this.config.revealRate);
      
      if (shouldReveal && !this.state.revealedIndices.has(i)) {
        this.state.revealedIndices.add(i);
      }

      if (this.state.revealedIndices.has(i)) {
        frameText += this.targetText[i];
      } else if (Math.random() < this.config.glitchRate) {
        frameText += this.getRandomCharacterForPosition(i);
      } else {
        frameText += this.originalText[i] || ' ';
      }
    }

    this.state.currentText = frameText;
    this.updateElementText(frameText);
  }

  /**
   * Get random character for specific position (maintains some consistency)
   */
  private getRandomCharacterForPosition(index: number): string {
    // Use index as seed for more consistent randomization per position
    const seed = (index + Date.now()) % this.characterSet.length;
    return this.characterSet[Math.floor(Math.random() * this.characterSet.length)];
  }

  /**
   * Update element text content
   */
  private updateElementText(text: string): void {
    if (this.element.textContent !== text) {
      this.element.textContent = text;
    }
  }

  /**
   * Apply or remove visual effects
   */
  private applyVisualEffects(apply: boolean): void {
    const { effects } = this.config;
    
    if (effects.shake) {
      this.element.style.animation = apply ? 'glitch-shake 0.1s infinite' : '';
    }
    
    if (effects.flicker) {
      this.element.style.animation = apply 
        ? `${this.element.style.animation} glitch-flicker 0.15s infinite`.trim()
        : this.element.style.animation.replace('glitch-flicker 0.15s infinite', '').trim();
    }
    
    if (effects.colorShift) {
      this.element.style.animation = apply
        ? `${this.element.style.animation} glitch-color-shift 0.2s infinite`.trim()
        : this.element.style.animation.replace('glitch-color-shift 0.2s infinite', '').trim();
    }
    
    if (effects.scalePulse) {
      this.element.style.animation = apply
        ? `${this.element.style.animation} glitch-scale-pulse 0.3s infinite`.trim()
        : this.element.style.animation.replace('glitch-scale-pulse 0.3s infinite', '').trim();
    }

    // Apply custom class
    if (this.config.className) {
      if (apply) {
        this.element.classList.add(...this.config.className.split(' '));
      } else {
        this.element.classList.remove(...this.config.className.split(' '));
      }
    }
  }
}

/**
 * Factory function to create glitch instance
 */
export function createGlitch(element: HTMLElement, config: GlitchConfig): GlitchInstance {
  const engine = new GlitchEngine(element, config);
  
  return {
    start: () => engine.start(),
    stop: () => engine.stop(),
    reset: () => engine.reset(),
    isRunning: () => engine.isRunning(),
    destroy: () => engine.destroy()
  };
}

/**
 * Convenience function for quick glitch effect
 */
export function glitch(element: HTMLElement, config: GlitchConfig): Promise<void> {
  return new Promise((resolve) => {
    const instance = createGlitch(element, {
      ...config,
      onComplete: () => {
        config.onComplete?.();
        resolve();
      }
    });
    instance.start();
  });
}
'use client';

import React, { useRef, useEffect, useCallback, forwardRef, useState } from 'react';
import { createGlitch } from './core';
import type { GlitchTextProps, GlitchInstance } from './types';
import { cn } from '@/lib/utils';

/**
 * React component wrapper for the glitch text effect
 */
export const GlitchText = forwardRef<HTMLElement, GlitchTextProps>(
  ({ 
    as: Component = 'span' as any,
    from, 
    to, 
    trigger = 'hover',
    className,
    children,
    onStart,
    onProgress,
    onComplete,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);
    const glitchInstanceRef = useRef<GlitchInstance | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Handle SSR
    useEffect(() => {
      setIsClient(true);
    }, []);

    // Initialize glitch instance
    useEffect(() => {
      if (!isClient || !elementRef.current) return;

      const element = elementRef.current;
      
      glitchInstanceRef.current = createGlitch(element, {
        from,
        to,
        trigger,
        onStart,
        onProgress,
        onComplete,
        ...props
      });

      return () => {
        glitchInstanceRef.current?.destroy();
        glitchInstanceRef.current = null;
      };
    }, [isClient, from, to, trigger, onStart, onProgress, onComplete, props]);

    // Handle trigger events
    const handleMouseEnter = useCallback(() => {
      if (trigger === 'hover' && glitchInstanceRef.current) {
        glitchInstanceRef.current.start();
      }
    }, [trigger]);

    const handleMouseLeave = useCallback(() => {
      if (trigger === 'hover' && glitchInstanceRef.current) {
        glitchInstanceRef.current.reset();
      }
    }, [trigger]);

    const handleClick = useCallback(() => {
      if (trigger === 'click' && glitchInstanceRef.current) {
        if (glitchInstanceRef.current.isRunning()) {
          glitchInstanceRef.current.reset();
        } else {
          glitchInstanceRef.current.start();
        }
      }
    }, [trigger]);

    // Intersection Observer for 'intersection' trigger
    useEffect(() => {
      if (trigger !== 'intersection' || !isClient || !elementRef.current) return;

      const element = elementRef.current;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && glitchInstanceRef.current) {
              glitchInstanceRef.current.start();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [trigger, isClient]);

    // Expose methods via ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(elementRef.current);
      } else if (ref) {
        ref.current = elementRef.current;
      }
    }, [ref]);

    // Event handlers based on trigger type
    const eventHandlers = {
      ...(trigger === 'hover' && {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
      }),
      ...(trigger === 'click' && {
        onClick: handleClick
      })
    };

    return (
      <Component
        ref={elementRef}
        className={cn('inline-block', className)}
        {...eventHandlers}
        {...props}
      >
        {/* Show original text during SSR and before hydration */}
        {!isClient ? (children || from) : null}
      </Component>
    );
  }
);

GlitchText.displayName = 'GlitchText';

/**
 * Hook for manual control of glitch effect
 */
export function useGlitchText(config: Omit<GlitchTextProps, 'trigger'> & { from: string; to: string }) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const glitchInstanceRef = useRef<GlitchInstance | null>(null);

  useEffect(() => {
    if (!element) return;

    glitchInstanceRef.current = createGlitch(element, {
      ...config,
      trigger: 'manual'
    });

    return () => {
      glitchInstanceRef.current?.destroy();
      glitchInstanceRef.current = null;
    };
  }, [element, config]);

  const start = useCallback(() => {
    glitchInstanceRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    glitchInstanceRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    glitchInstanceRef.current?.reset();
  }, []);

  const isRunning = useCallback(() => {
    return glitchInstanceRef.current?.isRunning() ?? false;
  }, []);

  return {
    ref: setElement,
    start,
    stop,
    reset,
    isRunning
  };
}

export default GlitchText;
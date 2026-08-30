'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { getCursorTarget, type CursorVariant } from '@/lib/cursor-utils';

const DEFAULT_SIZE = 16;

export function Cursor() {
  const [variant, setVariant] = useState<CursorVariant>('default');

  const variantRef = useRef<CursorVariant>('default');
  const targetRef = useRef<HTMLElement | null>(null);

  /*
   * Target position
   */
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  /*
   * Target dimensions
   */
  const targetWidth = useMotionValue(DEFAULT_SIZE);
  const targetHeight = useMotionValue(DEFAULT_SIZE);

  /*
   * Spring everything so the cursor smoothly
   * follows and morphs into its target.
   */
  const x = useSpring(targetX, {
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  });

  const y = useSpring(targetY, {
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  });

  const width = useSpring(targetWidth, {
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  });

  const height = useSpring(targetHeight, {
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  });

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const updateTargetBounds = () => {
      const element = targetRef.current;

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();

      targetX.set(rect.left + rect.width / 2);
      targetY.set(rect.top + rect.height / 2);

      targetWidth.set(rect.width * 1.1);
      targetHeight.set(rect.height * 1.5);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { variant: nextVariant, element } = getCursorTarget(event.target);

      /*
       * If we're not over a cursor target, the native
       * cursor should be used and our cursor disappears.
       */
      if (nextVariant === 'default') {
        if (variantRef.current !== 'default') {
          variantRef.current = 'default';
          targetRef.current = null;

          setVariant('default');

          document.documentElement.classList.remove('cursor-none');

          targetWidth.set(DEFAULT_SIZE);
          targetHeight.set(DEFAULT_SIZE);
        }

        /*
         * Keep the custom cursor positioned at the pointer
         * so that it is ready for the next interaction.
         */
        targetX.set(event.clientX);
        targetY.set(event.clientY);

        return;
      }

      /*
       * Hidden target.
       */
      if (nextVariant === 'hidden') {
        if (variantRef.current !== 'hidden' || targetRef.current !== element) {
          variantRef.current = 'hidden';
          targetRef.current = element;

          setVariant('hidden');

          document.documentElement.classList.add('cursor-none');

          targetX.set(event.clientX);
          targetY.set(event.clientY);

          targetWidth.set(DEFAULT_SIZE);
          targetHeight.set(DEFAULT_SIZE);
        }

        return;
      }

      /*
       * Adaptive target.
       */
      if (variantRef.current !== 'adapt' || targetRef.current !== element) {
        variantRef.current = 'adapt';
        targetRef.current = element;

        setVariant('adapt');

        document.documentElement.classList.add('cursor-none');

        updateTargetBounds();
      }
    };

    const handleResize = () => {
      if (variantRef.current === 'adapt') {
        updateTargetBounds();
      }
    };

    const handleScroll = () => {
      if (variantRef.current === 'adapt') {
        updateTargetBounds();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });

    window.addEventListener('resize', handleResize, { passive: true });

    window.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);

      window.removeEventListener('resize', handleResize);

      window.removeEventListener('scroll', handleScroll, true);

      document.documentElement.classList.remove('cursor-none');
    };
  }, [targetX, targetY, targetWidth, targetHeight]);

  return (
    <motion.div
      aria-hidden="true"
      className="
    pointer-events-none
    fixed
    left-0
    top-0
    z-9999
  "
      style={{
        x,
        y,
        width,
        height,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        opacity: variant === 'adapt' ? 1 : 0,
        borderRadius: variant === 'adapt' ? 12 : 16,
        backgroundColor:
          variant === 'adapt'
            ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
            : 'color-mix(in srgb, var(--primary) 100%, transparent)',
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 40,
        mass: 0.5,
      }}
    />
  );
}

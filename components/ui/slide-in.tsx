'use client';

import { motion, MotionConfig } from 'motion/react';

const hidden = { opacity: 0, y: 16, filter: 'blur(4px)' };
const visible = { opacity: 1, y: 0, filter: 'blur(0px)' };

// Slides up from below (with the same blur as the clock) the first time it scrolls into view.
// Reduced motion keeps only the fade: MotionConfig skips the transform.
export function SlideIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={hidden}
        whileInView={visible}
        viewport={{ once: true, margin: '0px 0px -40px 0px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

'use client';

import Link from 'next/link';
import { motion, MotionConfig } from 'motion/react';

import { ArrowLeft } from '@/components/ui/icons/arrow-left';

export function BackLink() {
  return (
    /* reducedMotion="user" drops the slide and keeps the fade. */
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        /* -ml-2 cancels the link's padding so "Home" lines up with the grid */
        className="-ml-2 flex shrink-0 items-center text-sm"
      >
        <Link
          href="/"
          className="group text-muted-foreground flex items-center gap-2 p-2 font-medium transition-colors hover:text-foreground hover:underline underline-offset-2"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
          />
          Home
        </Link>
      </motion.div>
    </MotionConfig>
  );
}

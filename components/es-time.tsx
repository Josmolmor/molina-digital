'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const CLASS_NAME =
  'text-muted-foreground flex items-center justify-center gap-2 font-mono text-xs tabular-nums';
const REDUCED_MOTION_VISIBLE =
  'motion-reduce:!opacity-100 motion-reduce:!blur-none motion-reduce:!scale-100';
const timeHidden = { opacity: 0, filter: 'blur(4px)', scale: 0.95 };
const timeVisible = { opacity: 1, filter: 'blur(0px)', scale: 1 };
const textHidden = { opacity: 0, filter: 'blur(4px)' };
const textVisible = { opacity: 1, filter: 'blur(0px)' };
const timeTransition = { duration: 0.3 } as const;

export default function EsTime({ className }: { className?: string }) {
  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const madridTime = time.toLocaleString('en-US', {
    timeZone: 'Europe/Madrid',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const [hour, minute] = madridTime.split(':').map(Number);
  const minutesSinceMidnight = hour * 60 + minute;
  const statusColor = !isMounted
    ? 'bg-transparent'
    : minutesSinceMidnight >= 8 * 60 && minutesSinceMidnight <= 18 * 60
      ? 'bg-green-500 animate-pulse'
      : minutesSinceMidnight > 18 * 60 && minutesSinceMidnight <= 22 * 60
        ? 'bg-amber-500'
        : 'bg-red-500';

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <span id="current-time" className={cn(CLASS_NAME, className)}>
      <motion.a
        href="https://www.google.com/maps/place/Seville,+Spain"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Seville, Spain in Google Maps"
        onClick={(event) => event.stopPropagation()}
        whileTap={{ rotate: -10, scale: 1.1 }}
        whileHover={{ rotate: -10, scale: 1.1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 12,
          mass: 0.7,
          bounce: 0.4,
        }}
      >
        <motion.span
          initial={timeHidden}
          animate={timeVisible}
          transition={timeTransition}
          id="esp-flag"
          aria-hidden="true"
          className={cn('flex flex-col p-2 -m-2', REDUCED_MOTION_VISIBLE)}
        >
          <span className="rounded-t-xs w-3.5 h-[3.5px] bg-[#ec1221]" />
          <span className="w-3.5 h-1.25 bg-[#ffd102]" />
          <span className="rounded-b-xs w-3.5 h-[3.5px] bg-[#ec1221]" />
        </motion.span>
      </motion.a>
      {isMounted ? (
        <motion.span
          initial={textHidden}
          animate={textVisible}
          transition={timeTransition}
          className={REDUCED_MOTION_VISIBLE}
        >
          {time.toLocaleString('en-US', {
            timeZone: 'Europe/Madrid',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
            weekday: 'short',
          })}
        </motion.span>
      ) : (
        <span
          aria-hidden="true"
          className="h-4 w-21.5 animate-pulse rounded-sm bg-muted motion-reduce:animate-none"
        />
      )}
      <motion.span
        aria-label="Availability status"
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          REDUCED_MOTION_VISIBLE,
          statusColor,
        )}
        role="img"
        initial={timeHidden}
        animate={timeVisible}
        transition={timeTransition}
      />
    </span>
  );
}

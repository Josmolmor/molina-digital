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

// Same blur-in reveal as the clock, for anything that should appear alongside it
export function BlurIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      initial={textHidden}
      animate={textVisible}
      transition={timeTransition}
      className={cn(REDUCED_MOTION_VISIBLE, className)}
    >
      {children}
    </motion.span>
  );
}

export function EsFlag() {
  return (
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
  );
}

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
  const status = !isMounted
    ? { color: 'bg-transparent', label: 'Availability status' }
    : minutesSinceMidnight >= 8 * 60 && minutesSinceMidnight <= 18 * 60
      ? {
          color: 'bg-green-500 animate-pulse',
          label: 'Working hours in Seville',
        }
      : minutesSinceMidnight > 18 * 60 && minutesSinceMidnight <= 22 * 60
        ? { color: 'bg-amber-500', label: 'Evening in Seville' }
        : { color: 'bg-red-500', label: 'Night time in Seville' };

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
        // Invisible spacer: holds the clock's width so neighbors don't shift when it mounts
        <span aria-hidden="true" className="invisible h-4 w-21.5" />
      )}
      <motion.span
        aria-label={status.label}
        title={status.label}
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          REDUCED_MOTION_VISIBLE,
          status.color,
        )}
        role="img"
        initial={timeHidden}
        animate={timeVisible}
        transition={timeTransition}
      />
    </span>
  );
}

'use client';

import { useRef, useState, useEffect } from 'react';
import { AnimatedCheckmark } from './check-icon';
import { BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';

const LABELS = [
  'No Edge Cases',
  'No Errors',
  'No State Bugs',
  'No Security Issues',
  'No Performance Issues',
  'No Accessibility Issues',
];

export default function ValidationBadge() {
  const [visibleBadges, setVisibleBadges] = useState<Set<string>>(new Set());
  const badgeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;
    let isAdding = true;

    const animateBadges = () => {
      if (isAdding) {
        // Adding badges one by one
        if (currentIndex < LABELS.length) {
          const badgeKey = `original-${LABELS[currentIndex]}`;
          setVisibleBadges((prev) => new Set([...prev, badgeKey]));
          currentIndex++;
          timeoutId = setTimeout(animateBadges, 1000);
        } else {
          // All badges added, switch to removing
          isAdding = false;
          currentIndex = LABELS.length - 1;
          timeoutId = setTimeout(animateBadges, 1000);
        }
      } else {
        // Removing badges one by one from the end
        if (currentIndex >= 0) {
          const badgeKey = `original-${LABELS[currentIndex]}`;
          setVisibleBadges((prev) => {
            const newSet = new Set(prev);
            newSet.delete(badgeKey);
            return newSet;
          });
          currentIndex--;
          timeoutId = setTimeout(animateBadges, 1000);
        } else {
          // All badges removed, start over
          isAdding = true;
          currentIndex = 0;
          timeoutId = setTimeout(animateBadges, 1000);
        }
      }
    };

    // Start the animation
    timeoutId = setTimeout(animateBadges, 1000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const getBadgeClasses = (badgeKey: string) => {
    const baseClasses =
      'flex items-center flex-shrink-0 rounded-full pl-1.5 pr-2.5 py-1 gap-1.5 transition-all duration-300';

    if (visibleBadges.has(badgeKey)) {
      return `${baseClasses} bg-green-400 dark:bg-green-500/20`;
    }

    return `${baseClasses} bg-neutral-300 dark:bg-neutral-800`;
  };

  const getIconClasses = (badgeKey: string) => {
    const baseClasses =
      'flex justify-center items-center flex-shrink-0 size-3 rounded-full transition-all duration-300';

    if (visibleBadges.has(badgeKey)) {
      return `${baseClasses} bg-green-200 dark:bg-green-400 text-green-800 dark:text-neutral-900`;
    }

    return `${baseClasses} dark:bg-neutral-400 bg-neutral-100 dark:text-neutral-700 text-neutral-500`;
  };

  const getTextClasses = (badgeKey: string) => {
    const baseClasses =
      'text-xs font-medium whitespace-nowrap transition-all duration-300';

    if (visibleBadges.has(badgeKey)) {
      return `${baseClasses} text-green-800 dark:text-green-400`;
    }

    return `${baseClasses} dark:text-neutral-300 text-neutral-600`;
  };
  return (
    <div className="overflow-hidden max-w-4xl mx-auto flex flex-col items-center bg-linear-to-b from-teal-500/10 dark:from-teal-600/20 to-background p-8 rounded-lg">
      <motion.div
        initial={{ opacity: 0, filter: 'blur(2px)', scale: 0.9 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        <BadgeCheck className="size-16 dark:text-green-500/80 text-green-500 mb-4" />
      </motion.div>

      <h1 className="text-2xl font-bold mb-2">Your Pull Request Looks Good</h1>
      <span className="text-sm text-muted-foreground max-w-xs text-center">
        No issues have been found and it will be manually reviewed and merged by
        the team.
      </span>
      <div className="marquee w-full">
        <div className="flex items-center gap-3 whitespace-nowrap w-max mt-10 mb-8 px-8">
          {LABELS.map((label) => {
            const badgeKey = `original-${label}`;
            return (
              <div
                key={badgeKey}
                ref={(el) => {
                  if (el) {
                    badgeRefs.current.set(badgeKey, el);
                  }
                }}
                data-badge-key={badgeKey}
                className={getBadgeClasses(badgeKey)}
              >
                <div>
                  <AnimatedCheckmark
                    checked={visibleBadges.has(badgeKey)}
                    className={getIconClasses(badgeKey)}
                  />
                </div>
                <span className={getTextClasses(badgeKey)}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

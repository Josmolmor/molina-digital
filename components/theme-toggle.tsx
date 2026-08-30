'use client';

import { DevicesIcon } from '@/components/ui/icons/devices';
import { MoonIcon } from '@/components/ui/icons/moon';
import { SunIcon } from '@/components/ui/icons/sun';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';

const THEME_COOKIE = 'molina-digital-theme';
const iconHidden = { opacity: 0, filter: 'blur(4px)', scale: 0.85 };
const iconVisible = { opacity: 1, filter: 'blur(0px)', scale: 1 };
const iconTransition = { type: 'spring', duration: 0.3, bounce: 0 } as const;

const getStoredTheme = (): ThemePreference => {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${THEME_COOKIE}=`))
    ?.slice(THEME_COOKIE.length + 1);

  return value === 'light' || value === 'dark' ? value : 'system';
};

const applyTheme = (preference: ThemePreference) => {
  const isDark =
    preference === 'dark' ||
    (preference === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

  if (preference === 'system') {
    document.cookie = `${THEME_COOKIE}=; Max-Age=0; SameSite=Lax; Path=/;`;
  } else {
    document.cookie = `${THEME_COOKIE}=${preference}; SameSite=Lax; Path=/;`;
  }
};

const nextTheme: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const themeLabels: Record<ThemePreference, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

export const ThemeToggle = () => {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isMounted, setIsMounted] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setPreference(getStoredTheme());
    setIsMounted(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (getStoredTheme() === 'system') applyTheme('system');
    };

    media.addEventListener('change', handleSystemThemeChange);
    return () => media.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const cycleTheme = () => {
    const nextPreference = nextTheme[preference];
    applyTheme(nextPreference);
    setPreference(nextPreference);
  };

  const Icon =
    preference === 'system'
      ? DevicesIcon
      : preference === 'light'
        ? SunIcon
        : MoonIcon;

  return (
    <button
      type="button"
      aria-label={`Theme: ${themeLabels[preference]}. Change theme.`}
      onClick={cycleTheme}
      className="-ml-1 inline-flex cursor-pointer items-center rounded-full p-1 transition-[shadow,transform] duration-250 ease hover:rotate-4 hover:ring-2 hover:ring-primary motion-reduce:transition-none"
    >
      {isMounted ? (
        <AnimatePresence mode="popLayout" initial={!reducedMotion}>
          <motion.span
            key={preference}
            className="inline-flex"
            initial={reducedMotion ? { opacity: 0 } : iconHidden}
            animate={reducedMotion ? { opacity: 1 } : iconVisible}
            exit={reducedMotion ? { opacity: 0 } : iconHidden}
            transition={reducedMotion ? { duration: 0 } : iconTransition}
          >
            <Icon className="size-5 shrink-0" />
          </motion.span>
        </AnimatePresence>
      ) : (
        <span className="size-5 shrink-0" aria-hidden="true" />
      )}
    </button>
  );
};

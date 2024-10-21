'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GmailIcon from '@/components/icons/GmailIcon';
import GithubIcon from '@/components/icons/GithubIcon';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import CodepenIcon from '@/components/icons/CodepenIcon';
import SwatchIcon from '@/components/icons/SwatchIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Header = () => {
  const [theme, setTheme] = useState('light');
  const [nextTheme, setNextTheme] = useState('dark');

  // Simulate delay animations
  useEffect(() => {
    if (theme === 'light') {
      setNextTheme('dark');
    } else if (theme === 'dark') {
      setNextTheme('sepia');
    } else if (theme === 'sepia') {
      setNextTheme('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(nextTheme);
  };

  return (
    <header className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-background shadow-lg rounded-xl p-2 gap-2 flex items-center flex-wrap border">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Link
              href="mailto:molinamw+digital@gmail.com"
              target="_blank"
              className="opacity-0 animate-appear delay-[0s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '0s' }}
            >
              <GmailIcon className="h-6 w-6" />
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Get in touch</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/Josmolmor"
              target="_blank"
              className="opacity-0 animate-appear delay-[0.25s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '0.25s' }}
            >
              <GithubIcon className="h-6 w-6" />
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Github</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Link
              href="https://www.linkedin.com/in/josmolmor/"
              target="_blank"
              className="opacity-0 animate-appear delay-[0.5s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '0.5s' }}
            >
              <LinkedinIcon className="h-6 w-6" />
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Linkedin</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Link
              href="https://codepen.io/jmmolina"
              target="_blank"
              className="opacity-0 animate-appear delay-[0.75s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '0.75s' }}
            >
              <CodepenIcon className="h-6 w-6" />
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Codepen</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <button
              className="theme-picker opacity-0 animate-appear delay-[1.25s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '1s' }}
              onClick={toggleTheme}
            >
              <SwatchIcon className="h-6 w-6" />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch theme</p>
        </TooltipContent>
      </Tooltip>
    </header>
  );
};

export default Header;

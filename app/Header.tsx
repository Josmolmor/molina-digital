'use client';

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
import { FlaskRound, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  console.log(pathname);
  const isTheLab = pathname === '/lab';

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    isDark
      ? document.documentElement.style.setProperty('color-scheme', 'dark')
      : document.documentElement.style.removeProperty('color-scheme');
    // setting SameSite property to satisfy relevant console warning. Use SameSite=None if site relies on cross-site requests
    document.cookie = `molina-digital-theme=${isDark ? 'dark' : 'light'}; SameSite=Lax; Path=/;`;
  };

  return (
    <header className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-background shadow-lg rounded-xl p-2 gap-2 flex items-center border">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Link
              href="mailto:molinamw+digital@gmail.com"
              target="_blank"
              className="opacity-0 animate-appear delay-[0s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '0s' } as any}
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
              style={{ '--delay': '0.25s' } as any}
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
              style={{ '--delay': '0.5s' } as any}
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
              style={{ '--delay': '0.75s' } as any}
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
            <Link
              href={isTheLab ? '/' : '/lab'}
              className="opacity-0 animate-appear delay-[0.75s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '1s' } as any}
            >
              {isTheLab ? (
                <Home className="h-6 w-6" />
              ) : (
                <FlaskRound className="h-6 w-6" />
              )}
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isTheLab ? 'Home' : 'The Lab'}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <button
              className="opacity-0 animate-appear delay-[1.25s] hover:bg-border/80 p-2 rounded-lg"
              style={{ '--delay': '1.25s' } as any}
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

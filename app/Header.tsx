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
import { useState, useEffect } from 'react';

const Header = () => {
  const [clipMaskValue, setClipMaskValue] = useState({
    start: '100%',
    end: '100%',
  });
  const [hasAppeared, setHasAppeared] = useState(false);
  const pathname = usePathname();
  const isTheLab = pathname === '/lab';

  useEffect(() => {
    // Remove animation delays after initial appearance
    const timer = setTimeout(() => setHasAppeared(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    isDark
      ? document.documentElement.style.setProperty('color-scheme', 'dark')
      : document.documentElement.style.removeProperty('color-scheme');
    // setting SameSite property to satisfy relevant console warning. Use SameSite=None if site relies on cross-site requests
    document.cookie = `molina-digital-theme=${isDark ? 'dark' : 'light'}; SameSite=Lax; Path=/;`;
  };

  const handleMouseMove = (section: string | null) => {
    switch (section) {
      case 'lab':
        setClipMaskValue({ start: '83%', end: '2%' });
        break;
      case 'email':
        setClipMaskValue({ start: '67%', end: '18%' });
        break;
      case 'github':
        setClipMaskValue({ start: '50%', end: '34%' });
        break;
      case 'linkedin':
        setClipMaskValue({ start: '34%', end: '50%' });
        break;
      case 'codepen':
        setClipMaskValue({ start: '18%', end: '66.5%' });
        break;
      case 'theme':
        setClipMaskValue({ start: '2%', end: '83%' });
        break;
      default:
        setClipMaskValue({ start: '100%', end: '100%' });
    }
  };

  return (
    <nav className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-background shadow-lg rounded-xl p-1 gap-2 flex items-center border border-border overflow-hidden">
      <div
        className="flex items-center gap-2 bg-primary mix-blend-lighten absolute inset-0 motion-safe:transition-[clip-path,background-color] motion-safe:[transition-duration:250ms] pointer-events-none"
        style={{
          clipPath: `inset(10% ${clipMaskValue.start} 10% ${clipMaskValue.end} round 0.5rem)`,
        }}
      ></div>
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2"
              onMouseEnter={() => handleMouseMove('lab')}
              onMouseLeave={() => handleMouseMove(null)}
            >
              <Link
                aria-label="Navigate to the 'lab' section of my website"
                href={isTheLab ? '/' : '/lab'}
                className={`p-3 rounded-lg transition-colors duration-75 ${hasAppeared ? 'opacity-100' : 'opacity-0 animate-appear delay-[0.75s]'}`}
                style={hasAppeared ? {} : ({ '--delay': '0s' } as any)}
              >
                {isTheLab ? (
                  <Home className="h-6 w-6 transition-colors duration-75" />
                ) : (
                  <FlaskRound className="h-6 w-6 transition-colors duration-75" />
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
            <div
              className="flex items-center gap-2"
              onMouseEnter={() => handleMouseMove('email')}
              onMouseLeave={() => handleMouseMove(null)}
            >
              <Link
                aria-label="Open your email client to contact me"
                href="mailto:molinamw+digital@gmail.com"
                target="_blank"
                className={`p-3 rounded-lg transition-colors duration-75 ${hasAppeared ? 'opacity-100' : 'opacity-0 animate-appear delay-[0s]'}`}
                style={hasAppeared ? {} : ({ '--delay': '0.25s' } as any)}
              >
                <GmailIcon className="h-6 w-6 transition-colors duration-75" />
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Get in touch</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2"
              onMouseEnter={() => handleMouseMove('github')}
              onMouseLeave={() => handleMouseMove(null)}
            >
              <Link
                aria-label="Open my Github profile page in a new tab"
                href="https://github.com/Josmolmor"
                target="_blank"
                className={`p-3 rounded-lg transition-colors duration-75 ${hasAppeared ? 'opacity-100' : 'opacity-0 animate-appear delay-[0.25s]'}`}
                style={hasAppeared ? {} : ({ '--delay': '0.5s' } as any)}
              >
                <GithubIcon className="h-6 w-6 transition-colors duration-75" />
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Github</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2"
              onMouseEnter={() => handleMouseMove('linkedin')}
              onMouseLeave={() => handleMouseMove(null)}
            >
              <Link
                aria-label="Open my Linkedin profile page in a new tab"
                href="https://www.linkedin.com/in/josmolmor/"
                target="_blank"
                className={`p-3 rounded-lg transition-colors duration-75 ${hasAppeared ? 'opacity-100' : 'opacity-0 animate-appear delay-[0.5s]'}`}
                style={hasAppeared ? {} : ({ '--delay': '0.75s' } as any)}
              >
                <LinkedinIcon className="h-6 w-6 transition-colors duration-75" />
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Linkedin</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2"
              onMouseEnter={() => handleMouseMove('codepen')}
              onMouseLeave={() => handleMouseMove(null)}
            >
              <Link
                aria-label="Open my Codepen profile page in a new tab"
                href="https://codepen.io/jmmolina"
                target="_blank"
                className={`p-3 rounded-lg transition-colors duration-75 ${hasAppeared ? 'opacity-100' : 'opacity-0 animate-appear delay-[0.75s]'}`}
                style={hasAppeared ? {} : ({ '--delay': '1s' } as any)}
              >
                <CodepenIcon className="h-6 w-6 transition-colors duration-75" />
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Codepen</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2"
              onMouseEnter={() => handleMouseMove('theme')}
              onMouseLeave={() => handleMouseMove(null)}
            >
              <button
                aria-label="Switch theme"
                className={`p-3 rounded-lg transition-colors duration-75 ${hasAppeared ? 'opacity-100' : 'opacity-0 animate-appear delay-[1.25s]'}`}
                style={hasAppeared ? {} : ({ '--delay': '1.25s' } as any)}
                onClick={toggleTheme}
              >
                <SwatchIcon className="h-6 w-6 transition-colors duration-75" />
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch theme</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
};

export default Header;

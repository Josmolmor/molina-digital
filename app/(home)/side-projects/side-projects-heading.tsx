'use client';

import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';
import { useEffect } from 'react';

const SideProjectsHeading = () => {
  const scrollToHash = (hashValue: string) => {
    window.history.replaceState(null, '', `#${hashValue}`);
    const element = document.getElementById(hashValue);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const hash = window?.location?.hash?.replace('#', '');
    if (hash) {
      scrollToHash(hash);
    }
  }, []);

  return (
    <h1 id="side-projects" className="text-2xl font-semibold mb-4">
      <Button
        variant="link"
        onClick={() => scrollToHash('side-projects')}
        className="p-1 text-foreground"
      >
        <Hash className="w-4 h-4 inline-block" fill="currentColor" />
      </Button>
      Side projects
    </h1>
  );
};

export default SideProjectsHeading;

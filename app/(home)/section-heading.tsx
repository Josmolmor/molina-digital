'use client';

import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';
import { useEffect } from 'react';

const SideProjectsHeading = ({ title }: { title: string }) => {
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
    <h1
      id="side-projects"
      className="text-3xl font-bold text-foreground tracking-tight mb-4"
    >
      <Button
        variant="link"
        onClick={() => scrollToHash('side-projects')}
        className="p-1 text-foreground w-auto"
      >
        <Hash className="w-6 h-6" />
      </Button>
      {title}
    </h1>
  );
};

export default SideProjectsHeading;

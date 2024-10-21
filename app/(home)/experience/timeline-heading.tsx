'use client';

import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';
import { useEffect } from 'react';

const TimeLineHeading = () => {
  const scrollToHash = (hashValue: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${hashValue}`);
      const element = document.getElementById(hashValue);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      scrollToHash(hash);
    }
  }, [window.location.hash]);

  return (
    <h1 id="experience" className="text-2xl font-semibold mb-4 blur-appear">
      <Button
        variant="link"
        onClick={() => scrollToHash('experience')}
        className="p-1 text-foreground"
      >
        <Hash className="inline-block w-4 h-4" />
      </Button>
      Experience
    </h1>
  );
};

export default TimeLineHeading;

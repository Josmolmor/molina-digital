'use client';

import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';
import { useEffect } from 'react';

const SectionHeading = ({ title }: { title: string }) => {
  const id = title.replace(' ', '-').toLowerCase();

  const scrollToHash = () => {
    window.history.replaceState(null, '', `#${id}`);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const hash = window?.location?.hash?.replace('#', '');
    if (hash === id) {
      scrollToHash();
    }
  }, [id]);

  return (
    <h1
      id={id}
      className="text-3xl font-bold text-foreground tracking-tight mb-4 scroll-mt-4"
    >
      <Button
        aria-label={`Scroll to ${title}`}
        variant="link"
        onClick={scrollToHash}
        className="p-1 text-foreground w-auto hover:animate-shrinkGrow focus:animate-shrinkGrow"
      >
        <Hash className="w-5 h-5" />
      </Button>
      {title}
    </h1>
  );
};

export default SectionHeading;

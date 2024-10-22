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
    if (hash) {
      scrollToHash();
    }
  }, []);

  return (
    <h1
      id={id}
      className="text-3xl font-bold text-foreground tracking-tight mb-4"
    >
      <Button
        variant="link"
        onClick={scrollToHash}
        className="p-1 text-foreground w-auto"
      >
        <Hash className="w-6 h-6" />
      </Button>
      {title}
    </h1>
  );
};

export default SectionHeading;

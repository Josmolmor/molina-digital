'use client';

import { Map } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EsTime() {
  const [time, setTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render anything during SSR to avoid hydration mismatch
  if (!isClient) {
    return (
      <span
        id="current-time"
        className="tabular-nums fixed bottom-2 right-2 font-mono text-[10px] opacity-20 hover:opacity-100 transition-opacity duration-300 p-2"
      >
        {/* Placeholder for SSR */}
      </span>
    );
  }

  return (
    <>
      <span
        id="current-time"
        className="flex items-center gap-2 tabular-nums fixed bottom-2 right-2 font-mono text-[10px] opacity-20 hover:opacity-100 transition-opacity duration-300 p-2"
        suppressHydrationWarning
      >
        {time.toLocaleString('en-US', {
          timeZone: 'Europe/Madrid',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
          weekday: 'short',
        })}
        <a
          href="https://www.google.com/maps/place/Seville,+Spain"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
        >
          <Map className="size-3" />
        </a>
      </span>
    </>
  );
}

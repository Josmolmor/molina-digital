'use client';

import { useEffect, useState } from 'react';

export default function EsTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      id="current-time"
      className="tabular-nums fixed bottom-2 right-2 font-mono text-[10px] opacity-20 hover:opacity-100 transition-opacity duration-300 p-2"
    >
      {time.toLocaleString('en-US', {
        timeZone: 'Europe/Madrid',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        weekday: 'short',
      })}
    </span>
  );
}

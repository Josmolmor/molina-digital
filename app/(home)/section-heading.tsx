'use client';

import EsTime from '@/components/es-time';

export const SectionHeading = () => {
  return (
    <div className="relative flex flex-col gap-1 items-center">
      <h1 className="touch-hitbox origin-left font-medium text-2xl font-serif">
        Jose Molina
      </h1>
      <span className="origin-left -ml-1.5">
        <EsTime />
      </span>
    </div>
  );
};

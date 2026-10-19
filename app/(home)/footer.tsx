import { Suspense } from 'react';
import EsTime, { BlurIn } from '@/components/es-time';
import { EsWeather, EsWeatherFallback } from '@/components/es-weather';
import { SlideIn } from '@/components/ui/slide-in';

export const Footer = () => {
  return (
    <footer className="flex flex-col gap-8 pt-20">
      <SlideIn className="flex flex-col items-start sm:items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
          {/* City and flag show right away; the weather streams in around them */}
          <Suspense fallback={<EsWeatherFallback />}>
            <EsTime />
            <EsWeather />
          </Suspense>
        </div>
        <BlurIn className="text-muted-foreground flex items-center gap-1">
          <span className="text-base font-mono">&copy;</span>
          <span className="text-xs tabular-nums font-mono">
            {new Date().getFullYear()}
          </span>
        </BlurIn>
      </SlideIn>
    </footer>
  );
};

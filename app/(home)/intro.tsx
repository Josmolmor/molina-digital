import { SectionHeading } from './section-heading';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { RotatingGlobe } from '@/components/rotating-globe';
import { SparklesIcon } from '@/components/ui/icons/sparkles';
import { HoverBlob } from '@/components/ui/hover-blob';

// Started working in September 2016 (month index 8)
const CAREER_START = { year: 2016, month: 8 };

function yearsOfExperience(now = new Date()) {
  const years = now.getFullYear() - CAREER_START.year;
  return now.getMonth() < CAREER_START.month ? years - 1 : years;
}

// 16 half-waves across a 100-wide box; stretched to the text width via preserveAspectRatio="none"
const WAVE_PATH = `M0 4 q3.125 -4 6.25 0${' t6.25 0'.repeat(15)}`;

// Draws a wavy strikethrough left to right while the parent HoverBlob is open
const WavyStrike = ({ children }: { children: React.ReactNode }) => (
  <span className="relative whitespace-nowrap transition-colors duration-300 in-aria-expanded:text-muted-foreground">
    {children}
    <svg
      aria-hidden
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-[0.5em] w-full -translate-y-1/3 overflow-visible text-primary"
    >
      <path
        d={WAVE_PATH}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="opacity-0 [stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset,opacity] duration-200 ease-in motion-reduce:transition-none in-aria-expanded:opacity-100 in-aria-expanded:[stroke-dashoffset:0] in-aria-expanded:duration-500 in-aria-expanded:ease-out"
      />
    </svg>
  </span>
);

export const Intro = () => {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <SectionHeading />
        <div className="flex items-center gap-4 -mb-1 md:-mb-0.5">
          <a
            href="https://github.com/josmolmor"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
          >
            <span>Github</span>
            <span className="rounded absolute bottom-0 left-0 h-0.5 w-full origin-bottom-right scale-x-0 bg-primary transition-transform ease-out-quad group-hover:origin-bottom-left group-hover:scale-x-100" />
          </a>
          <a
            href="https://www.linkedin.com/in/josmolmor/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
          >
            <span>Linkedin</span>
            <span className="rounded absolute bottom-0 left-0 h-0.5 w-full origin-bottom-right scale-x-0 bg-primary transition-transform ease-out-quad group-hover:origin-bottom-left group-hover:scale-x-100" />
          </a>
          <a href="mailto:molinamw@gmail.com" className="group relative">
            <span>Contact</span>
            <span className="rounded absolute bottom-0 left-0 h-0.5 w-full origin-bottom-right scale-x-0 bg-primary transition-transform ease-out-quad group-hover:origin-bottom-left group-hover:scale-x-100" />
          </a>
          <ThemeToggle />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <span>Squinting at a screen counting pixels for a living.</span>
        <p>
          I{' '}
          <HoverBlob variant="plain" message="ask agents to write software*">
            <WavyStrike>write software</WavyStrike>
          </HoverBlob>
          , mostly the frontend kind. I like figuring out how things work,
          making them work better, and occasionally spending an unreasonable
          amount of time getting one tiny
          <HoverBlob
            className="text-wrap font-normal mx-0.75"
            imageContent={
              <img
                loading="lazy"
                src="/assets/images/osborn.webp"
                alt="A gif of Norman Osborn from the original Spider-Man movie saying 'You know, I'm something of a scientist myself' used often as a meme.."
                className="rounded-lg absolute -top-30 left-1/2 -translate-x-1/2 h-26 object-cover w-auto ring-6 ring-card drop-shadow-lg"
              />
            }
            message="You know, I'm something of a design engineer myself"
          >
            <span className="text-wrap">
              detail{' '}
              <SparklesIcon
                outlineColor="var(--sticker)"
                outlineWidth={14}
                className="text-primary inline-block size-8 shrink-0 rotate-6 -mt-1.5"
              />
            </span>
          </HoverBlob>
          right.
          <br />
          <br /> For the past {yearsOfExperience()}
          &nbsp;years, I&apos;ve worked on software across different products,
          teams{' '}
          <RotatingGlobe
            speed={50}
            className="text-primary inline-block size-5 shrink-0 mb-0.5 -mt-0.5 rotate-6 hover:scale-120 transition-transform duration-300"
          />{' '}
          and technologies. I&apos;m drawn to problems that make me think
          differently, ideas that challenge the obvious approach, and the space
          where engineering and design meet.
        </p>
      </div>
    </section>
  );
};

import { SectionHeading } from './section-heading';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { RotatingGlobe } from '@/components/rotating-globe';
import { SparklesIcon } from '@/components/ui/icons/sparkles';
import { HoverBlob } from '@/components/ui/hover-blob';

export const Intro = () => {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-1">
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
          <a
            href="mailto:molinamw@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
          >
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
          Software engineer specializing in front-end development, with the
          versatility to work across the stack, passionate about building
          digital experiences that feel effortless and look beautiful. <br />{' '}
          For more than&nbsp;
          {new Date().getFullYear() - (2016 + 1)}&nbsp;years, I strive to shape
          global{' '}
          <RotatingGlobe
            speed={50}
            className="inline-block size-5 shrink-0 mb-0.5 -mt-0.5 rotate-6 hover:scale-120 transition-transform duration-300"
          />{' '}
          platforms and products that don&apos;t just work but delight.
        </p>
        <div>
          <span>My focus is on </span>
          <HoverBlob
            className="text-wrap"
            imageContent={
              <img
                loading="lazy"
                src="/assets/images/osborn.gif"
                alt="A gif of Norman Osborn from the original Spider-Man movie saying 'You know, I'm something of a scientist myself' used often as a meme.."
                className="rounded-lg absolute -top-30 left-1/2 -translate-x-1/2 h-26 object-cover w-auto ring-6 ring-card drop-shadow-lg"
              />
            }
            message="You know, I'm something of a design engineer myself"
          >
            <span className="text-primary text-wrap">
              details{' '}
              <SparklesIcon className="inline-block size-5 shrink-0 mb-1 -mt-1 -rotate-6" />{' '}
              that make a difference
            </span>
          </HoverBlob>
          <span className="text-wrap">
            : interfaces that guide instead of confuse, experiences that
            simplify life, and products that leave a mark.
          </span>
        </div>
        <p>
          I want the work I do to be recognized not just for its function, but
          for the craft and care behind it.
        </p>
      </div>
    </section>
  );
};

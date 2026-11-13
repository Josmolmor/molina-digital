import { Suspense } from 'react';
import Link from 'next/link';

import { BlurIn } from '@/components/es-time';
import { HoverPreviews } from '@/components/hover-previews';
import { CalendarDotsIcon } from '@/components/ui/icons/calendar-dots';
import { Separator } from '@/components/ui/separator';
import { getLastCommitDate } from '@/lib/github';

type Project = {
  title: string;
  description: string;
  href: string;
  /* Shown beside the cursor while the row is hovered */
  preview: string;
  /* GitHub `owner/name`: shows when the repo was last updated */
  repo?: string;
};

const PREVIEWS = '/assets/images/projects/preview';

const projects: Project[] = [
  {
    title: 'Glyph grid',
    description: 'Draw a shape and turn it into a glyph-mosaic poster.',
    href: '/glyph-grid',
    preview: `${PREVIEWS}/glyph-grid.webp`,
  },
  {
    title: 'Stash',
    description:
      "Things I've saved from around the internet: inspiration, ideas and TODOs.",
    href: '/stash',
    preview: `${PREVIEWS}/stash.webp`,
  },
  {
    title: 'Design strategies',
    description: 'A deck of strategies to help you get unblocked.',
    href: '/unblock',
    preview: `${PREVIEWS}/oblique.webp`,
  },
  {
    title: 'Shapes',
    description: 'A generative grid of shapes and colors.',
    href: '/shapes',
    preview: `${PREVIEWS}/shapes.webp`,
  },
  {
    title: 'Cursor morph',
    description:
      'An experiment in cursors that morph between states instead of switching.',
    href: '/cursor-morph',
    preview: `${PREVIEWS}/cursor-morph.webp`,
  },
  {
    title: 'Skills',
    description: 'Both for personal and work projects.',
    href: 'https://github.com/Josmolmor/skills',
    preview: `${PREVIEWS}/skills.webp`,
    repo: 'Josmolmor/skills',
  },
];

/* Absolute, not "3 days ago": the page is cached, so a relative date would go stale */
const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
});

/* Renders nothing if GitHub is unreachable, so the row never shows a broken date */
async function RepoUpdated({ repo }: { repo: string }) {
  const date = await getLastCommitDate(repo);
  if (!date) return null;

  // nowrap keeps the icon with its label instead of stranding it at the end of a line.
  // It streams in after the page, so it uses the same blur-in as the footer's clock and weather.
  return (
    <BlurIn className="whitespace-nowrap text-sm">
      <CalendarDotsIcon className="mr-1 inline size-4 shrink-0 align-[-0.1875em]" />
      Last updated on:{' '}
      <time
        className="text-xs font-mono bg-card p-1 px-2 rounded-md"
        dateTime={date.toISOString()}
      >
        {formatter.format(date)}
      </time>
    </BlurIn>
  );
}

export default function ProjectsPage() {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="playground" className="font-medium text-2xl font-serif">
        Playground
      </h2>
      <Separator />
      <HoverPreviews
        className="flex flex-col"
        images={projects.map((project) => project.preview)}
      >
        {projects.map((project) => {
          // Off-site entries open in a new tab, like the Work section's links
          const external = project.href.startsWith('http');
          return (
            <Link
              key={project.href}
              href={project.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              data-preview={project.preview}
              className="-mx-4.5 flex-1 flex flex-col hover:bg-card active:bg-card px-4.5 pt-4 pb-4.5 rounded-2xl transition-[background-color] ease-[ease] motion-reduce:transition-none"
            >
              <span className="leading-6.5 block">{project.title}</span>
              <span className="leading-6.5 text-muted-foreground flex flex-col gap-1">
                {/* One inline run, so the date follows the sentence instead of stacking under it */}
                <span>
                  {project.description}
                  {project.repo && (
                    <Suspense fallback={null}>
                      {' '}
                      <RepoUpdated repo={project.repo} />
                    </Suspense>
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </HoverPreviews>
    </section>
  );
}

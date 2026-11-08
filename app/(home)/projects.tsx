import { Suspense } from 'react';
import Link from 'next/link';

import { CalendarDotsIcon } from '@/components/ui/icons/calendar-dots';
import { Separator } from '@/components/ui/separator';
import { getLastCommitDate } from '@/lib/github';

type Project = {
  title: string;
  description: string;
  href: string;
  /* GitHub `owner/name`: shows when the repo was last updated */
  repo?: string;
};

const projects: Project[] = [
  {
    title: 'Stash',
    description:
      "Things I've saved from around the internet: inspiration, ideas and TODOs.",
    href: '/stash',
  },
  {
    title: 'Design strategies',
    description: 'A deck of strategies to help you get unblocked.',
    href: '/unblock',
  },
  {
    title: 'Shapes',
    description: 'A generative grid of shapes and colors.',
    href: '/shapes',
  },
  {
    title: 'Cursor morph',
    description:
      'An experiment in cursors that morph between states instead of switching.',
    href: '/cursor-morph',
  },
  {
    title: 'Skills',
    description: 'Both for personal and work projects.',
    href: 'https://github.com/Josmolmor/skills',
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

  // nowrap keeps the icon with its label instead of stranding it at the end of a line
  return (
    <span className="whitespace-nowrap">
      <CalendarDotsIcon className="mr-1 inline size-4 shrink-0 align-[-0.1875em]" />
      Last updated on:{' '}
      <time dateTime={date.toISOString()}>{formatter.format(date)}</time>
    </span>
  );
}

export default function ProjectsPage() {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="playground" className="font-medium text-2xl font-serif">
        Playground
      </h2>
      <Separator />
      <div className="flex flex-col">
        {projects.map((project) => {
          // Off-site entries open in a new tab, like the Work section's links
          const external = project.href.startsWith('http');
          return (
            <Link
              key={project.href}
              href={project.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
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
      </div>
    </section>
  );
}

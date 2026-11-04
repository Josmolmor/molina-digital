import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const projects = [
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
];

export default function ProjectsPage() {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="playground" className="font-medium text-2xl font-serif">
        Playground
      </h2>
      <Separator />
      <div className="flex flex-col">
        {projects.map((project) => (
          <Link
            key={project.href}
            href={project.href}
            className="-mx-4.5 flex-1 flex flex-col hover:bg-card active:bg-card px-4.5 pt-4 pb-4.5 rounded-2xl transition-[background-color] ease-[ease] motion-reduce:transition-none"
          >
            <span className="leading-6.5 block">{project.title}</span>
            <span className="leading-6.5 text-muted-foreground flex flex-col gap-1">
              {project.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

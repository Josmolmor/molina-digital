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
];

export default function ProjectsPage() {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="playground" className="font-medium text-2xl font-serif">
        Playground
      </h2>
      <Separator />
      <div className="flex flex-col gap-2">
        {projects.map((project) => (
          <Link
            key={project.href}
            href={project.href}
            className="-mx-5 flex-1 flex flex-col gap-1.5 hover:bg-card active:bg-card pt-4 pb-5 px-5 rounded-2xl transition-[background-color] ease-[ease] motion-reduce:transition-none"
          >
            <span>{project.title}</span>
            <span className="text-muted-foreground flex flex-col gap-1">
              {project.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

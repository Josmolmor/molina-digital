import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="projects" className="font-medium text-2xl font-serif">
        Projects
      </h2>
      <Separator />
      <Link
        href="/unblock"
        className="-mx-5 flex-1 flex flex-col gap-1.5 hover:bg-card active:bg-card pt-4 pb-5 px-5 rounded-2xl transition-[background-color] motion-reduce:transition-none"
      >
        <span>Design Strategies</span>
        <span className="text-muted-foreground flex flex-col gap-1">
          A deck of strategies to help you get unblocked.
        </span>
      </Link>
    </section>
  );
}

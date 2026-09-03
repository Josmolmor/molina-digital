import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="playground" className="font-medium text-2xl font-serif">
        Playground
      </h2>
      <Separator />
      <div className="flex flex-col gap-2">
        <Link
          href="/unblock"
          className="-mx-5 flex-1 flex flex-col gap-1.5 hover:bg-card active:bg-card pt-4 pb-5 px-5 rounded-2xl transition-[background-color] motion-reduce:transition-none"
        >
          <span>Design strategies</span>
          <span className="text-muted-foreground flex flex-col gap-1">
            A deck of strategies to help you get unblocked.
          </span>
        </Link>
        <Link
          href="/shapes"
          className="-mx-5 flex-1 flex flex-col gap-1.5 hover:bg-card active:bg-card pt-4 pb-5 px-5 rounded-2xl transition-[background-color] motion-reduce:transition-none"
        >
          <span>Shapes</span>
          <span className="text-muted-foreground flex flex-col gap-1">
            A generative grid of shapes and colors inspired by Sony's State of
            Play show.
          </span>
        </Link>
      </div>
    </section>
  );
}

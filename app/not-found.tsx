import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from '@/components/ui/icons/arrow-left';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-12 text-center">
      <h1 className="font-serif text-2xl font-medium">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="group text-muted-foreground flex items-center gap-2 p-2 transition-colors hover:text-foreground hover:underline underline-offset-2 font-medium"
      >
        <ArrowLeft
          aria-hidden
          className="size-4 shrink-0 group-hover:-translate-x-0.5 transition-transform"
        />
        Home
      </Link>
    </main>
  );
}

import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <div className="max-w-md space-y-6 p-4 text-center">
        <div className="flex justify-center">
          <SearchX className="size-14 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Page Not Found
        </h1>
        <p className="text-base text-muted-foreground">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Button asChild className="px-4 py-2 rounded-full" size="lg">
          <Link href="/events" className="px-8">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

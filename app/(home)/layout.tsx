import type { ReactNode } from 'react';
import { Footer } from './footer';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full max-w-4xl flex-col gap-18 px-12 pt-12 pb-14 md:px-24 md:pt-24 md:pb-28">
      {children}
      <Footer />
    </main>
  );
}

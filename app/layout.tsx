import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import Header from './Header';
import { cookies } from 'next/headers';
import { Toaster } from '@/components/ui/sonner';
import CrossPattern from '@/components/ui/cross-pattern';
import EsTime from '@/components/es-time';
import Cursor from '@/components/ui/cursor';

export const metadata: Metadata = {
  title: 'Frontend engineer | Molina.digital',
  description:
    "Hey, I'm Molina, get to know me and my work a bit more by checking out my site.",
  keywords:
    'frontend, engineering, software, development, react, next, tailwindcss',
  authors: [
    {
      name: 'Jose M Molina - https://molina.digital',
    },
  ],
  openGraph: {
    title: 'Jose M Molina - Frontend software engineer',
    description:
      "Hey there I'm Molina, get to know me and my work a bit more by checking out my site.",
    url: 'https://molina.digital/',
    siteName: 'JM Molina',
    images: [
      {
        url: 'images/meta-img.jpg',
        width: 750,
        height: 250,
        alt: 'JM Molina - Frontend software engineer',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image', // or 'summary' for a smaller card
    title: 'JM Molina - Frontend software engineer',
    description:
      "Hey there I'm Molina, get to know me and my work a bit more by checking out my site.",
    images: ['images/meta.jpg'],
    site: '@molina.digital',
    creator: '@josmolmor',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const storedTheme = (await cookies()).get('molina-digital-theme')?.value;

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (${storedTheme === 'dark'} || (${!storedTheme} && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                  document.documentElement.style.setProperty('color-scheme', 'dark')
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased min-h-dvh pt-12 sm:pt-20 pb-24`}>
        <CrossPattern />
        <Toaster position="top-center" />
        <EsTime />
        <Cursor />
        <main className="max-w-4xl w-full flex flex-col gap-12 mx-auto px-8 sm:px-12">
          <TooltipProvider delayDuration={200}>
            <Header />
            {children}
          </TooltipProvider>
        </main>
      </body>
    </html>
  );
}

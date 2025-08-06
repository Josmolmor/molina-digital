import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import Header from './Header';
import { cookies } from 'next/headers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Frontend Senior Software engineer',
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
    title: 'Jose M Molina - Frontend Senior Software engineer',
    description:
      "Hey there I'm Molina, get to know me and my work a bit more by checking out my site.",
    url: 'https://molina.digital/',
    siteName: 'JM Molina',
    images: [
      {
        url: 'images/cooba-meta-img.jpg',
        width: 800,
        height: 600,
        alt: 'JM Molina - Senior Software engineer',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image', // or 'summary' for a smaller card
    title: 'JM Molina - Frontend Senior Software engineer',
    description:
      "Hey there I'm Molina, get to know me and my work a bit more by checking out my site.",
    images: ['images/cooba-meta-img.jpg'],
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
      <body className={`antialiased min-h-dvh pt-8 sm:pt-12 pb-24`}>
        <svg className="grid-background w-full h-full inset-0 fixed z-[-1] mix-blend-color">
          <defs>
            <pattern
              id="grid"
              width="160"
              height="160"
              patternUnits="userSpaceOnUse"
            >
              {/* Grid lines */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="160"
                stroke="var(--grid-background-lines-stroke-color)"
                strokeWidth="var(--grid-background-lines-stroke-width)"
                opacity="var(--grid-background-lines-opacity)"
              />
              <line
                x1="0"
                y1="0"
                x2="160"
                y2="0"
                stroke="var(--grid-background-lines-stroke-color)"
                strokeWidth="var(--grid-background-lines-stroke-width)"
                opacity="var(--grid-background-lines-opacity)"
              />

              {/* Top-left cross (0,0) - exactly on the intersection */}
              <line
                x1="0"
                y1="0"
                x2="4"
                y2="0"
                stroke="var(--grid-background-cross-stroke-color)"
                strokeWidth="var(--grid-background-cross-stroke-width)"
                opacity="var(--grid-background-cross-opacity)"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="4"
                stroke="var(--grid-background-cross-stroke-color)"
                strokeWidth="var(--grid-background-cross-stroke-width)"
                opacity="var(--grid-background-cross-opacity)"
              />
              <line
                x1="156"
                y1="0"
                x2="160"
                y2="0"
                stroke="var(--grid-background-cross-stroke-color)"
                strokeWidth="var(--grid-background-cross-stroke-width)"
                opacity="var(--grid-background-cross-opacity)"
              />
              <line
                x1="0"
                y1="156"
                x2="0"
                y2="160"
                stroke="var(--grid-background-cross-stroke-color)"
                strokeWidth="var(--grid-background-cross-stroke-width)"
                opacity="var(--grid-background-cross-opacity)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <main className="max-w-4xl w-full flex flex-col gap-16 mx-auto px-8 sm:px-12">
          <Toaster position="top-center" />
          <TooltipProvider delayDuration={200}>
            <Header />
            {children}
          </TooltipProvider>
        </main>
      </body>
    </html>
  );
}

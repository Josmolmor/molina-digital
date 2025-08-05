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
        <main className="max-w-4xl flex flex-col gap-16 mx-auto px-8 sm:px-12">
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

import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { cookies } from 'next/headers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  metadataBase: new URL('https://molina.digital'),
  title: 'Jose Molina | Frontend Software Engineer',
  description:
    "Hey, I'm Molina, get to know me and my work a bit more by checking out my site.",
  keywords:
    'frontend, engineering, software, development, react, next, tailwindcss',
  authors: [
    {
      name: 'Jose Molina - https://molina.digital',
    },
  ],
  openGraph: {
    title: 'Jose Molina - Frontend Software Engineer',
    description:
      "Hey there I'm Molina, get to know me and my work a bit more by checking out my site.",
    url: 'https://molina.digital/',
    siteName: 'Jose Molina',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Jose Molina - Frontend Software Engineer',
    description:
      "Hey there I'm Molina, get to know me and my work a bit more by checking out my site.",
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
  const isDark = storedTheme === 'dark' || (!storedTheme && false); // Default to light during SSR

  return (
    <html
      lang="en"
      className={isDark ? 'dark' : ''}
      style={isDark ? { colorScheme: 'dark' } : {}}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var cookiePrefix = 'molina-digital-theme=';
                var row = document.cookie.split('; ').find(function(part) {
                  return part.startsWith(cookiePrefix);
                });
                var storedTheme = row ? row.slice(cookiePrefix.length) : undefined;
                var isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', isDark);
                document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Toaster position="top-center" />
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}

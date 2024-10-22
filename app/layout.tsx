import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import { Manrope } from 'next/font/google';
import Header from './Header';
import { cookies } from 'next/headers';

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

const archiaFont = localFont({
  src: [
    {
      path: './fonts/archia-light.woff2',
      weight: '300',
    },
    {
      path: './fonts/archia-regular.woff2',
      weight: '400',
    },
    {
      path: './fonts/archia-medium.woff2',
      weight: '500',
    },
    {
      path: './fonts/archia-semibold.woff2',
      weight: '600',
    },
    {
      path: './fonts/archia-bold.woff2',
      weight: '700',
    },
  ],
});

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

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
      <body
        className={`${manrope.className} ${archiaFont.className} antialiased min-h-[100dvh] pt-12 pb-24`}
      >
        <main className="max-w-4xl flex flex-col gap-16 mx-auto px-8 sm:px-12">
          <TooltipProvider delayDuration={200}>
            <Header />
            {children}
          </TooltipProvider>
        </main>
      </body>
    </html>
  );
}

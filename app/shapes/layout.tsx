import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 1200,
  alt: 'Jose Molina',
};

export const metadata: Metadata = {
  title: 'Shapes',
  description:
    "A generative grid of shapes and colors inspired by Sony's State of Play show.",
  keywords:
    'shapes, generative design, interactive grid, sony state of play, generative art',
  openGraph: {
    title: 'Shapes',
    description:
      "A generative grid of shapes and colors inspired by Sony's State of Play show.",
    url: '/shapes',
    siteName: 'Jose Molina',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary',
    title: 'Shapes',
    description:
      "A generative grid of shapes and colors inspired by Sony's State of Play show.",
    site: '@molina.digital',
    creator: '@josmolmor',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: '/shapes',
  },
};

export default function ShapesLayout({ children }: { children: ReactNode }) {
  return children;
}

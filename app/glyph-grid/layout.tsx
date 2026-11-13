import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/* A poster made with the tool itself; regenerate it if the look changes. */
const OG_IMAGE = {
  url: '/assets/images/glyph-grid-og.png',
  width: 1200,
  height: 675,
  alt: 'A glyph-mosaic poster: a star drawn in colored cells of monospace characters',
};

const TITLE = 'Glyph grid';
const DESCRIPTION =
  'Draw a shape and turn it into a glyph-mosaic poster: a low-res grid of colored cells, each holding a monospace character.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'glyph grid, generative design, ascii art, poster generator, canvas, playground',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/glyph-grid',
    siteName: 'Jose Molina',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    site: '@molina.digital',
    creator: '@mlndev',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: '/glyph-grid',
  },
};

export default function GlyphGridLayout({ children }: { children: ReactNode }) {
  return children;
}

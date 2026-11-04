import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 1200,
  alt: 'Jose Molina',
};

const TITLE = 'Cursor morph';
const DESCRIPTION =
  'A cursor that changes its shape, not its icon. A small study of one geometric object morphing between meanings.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'cursor, svg morphing, interaction design, micro-interactions, playground',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/cursor-morph',
    siteName: 'Jose Molina',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    site: '@molina.digital',
    creator: '@mlndev',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: '/cursor-morph',
  },
};

export default function CursorMorphLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

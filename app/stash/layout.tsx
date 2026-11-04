import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 1200,
  alt: 'Jose Molina',
};

const TITLE = 'Stash';
const DESCRIPTION =
  "Things I've saved from around the internet: inspiration, ideas and TODOs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: 'moodboard, bookmarks, inspiration, links, todo, playground',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/stash',
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
    canonical: '/stash',
  },
};

export default function StashLayout({ children }: { children: ReactNode }) {
  return children;
}

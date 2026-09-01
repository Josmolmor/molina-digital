import { CardStack } from '@/components/card-stack';
import Iridescence from '@/components/iridiscence';
import { creativeStrategies } from '@/data/oblique';
import type { Metadata } from 'next';

const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 1200,
  alt: 'Jose Molina',
};

export const metadata: Metadata = {
  title: 'Design strategies',
  description: 'A deck of strategies to help you get unblocked.',
  keywords:
    'design strategies, creative unblock, oblique strategies, design prompts',
  openGraph: {
    title: 'Design strategies',
    description: 'A deck of strategies to help you get unblocked.',
    url: '/unblock',
    siteName: 'Jose Molina',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary',
    title: 'Design strategies',
    description: 'A deck of strategies to help you get unblocked.',
    site: '@molina.digital',
    creator: '@josmolmor',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: '/unblock',
  },
};

/*
 * Shuffled per request on the server, so the client hydrates the order it was
 * sent instead of re-rolling and mismatching.
 */
export const dynamic = 'force-dynamic';

/*
 * Declared once, outside the component: the cover's props are dependencies of
 * the WebGL setup effect, and a fresh array on every render would tear the
 * context down and rebuild it.
 */
const IRIDESCENCE_COLOR: [number, number, number] = [1, 0.98, 1]; // Unique light pastel blue

export default function Unblock() {
  const randomizedStrategies = [...creativeStrategies].sort(
    () => Math.random() - 0.5,
  );

  return (
    <CardStack
      strategies={randomizedStrategies}
      cover={
        <Iridescence
          color={IRIDESCENCE_COLOR}
          speed={0.7}
          amplitude={0.1}
          mouseReact
        />
      }
    />
  );
}

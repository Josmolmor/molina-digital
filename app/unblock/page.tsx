import { CardStack } from '@/components/card-stack';
import Iridescence from '@/components/iridiscence';
import { creativeStrategies } from '@/data/oblique';

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

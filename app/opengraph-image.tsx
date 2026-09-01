import { ImageResponse } from 'next/og';

/* Same fill as app/favicon.ico — rgb(2, 90, 232). */
const FAVICON_BLUE = '#025AE8';

export const alt = 'Jose Molina';
export const size = { width: 1200, height: 1200 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: FAVICON_BLUE,
          width: '100%',
          height: '100%',
        }}
      />
    ),
    { ...size },
  );
}

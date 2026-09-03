import type { PolygonName } from '@/components/ui/icons/polygons';

export const POLYGON_MARKUP: Record<
  PolygonName,
  { viewBox: string; content: string }
> = {
  arc: {
    viewBox: '0 0 20 20',
    content:
      '<path d="M0 0C11.0457 0 20 8.95431 20 20H10C10 14.4772 5.52285 10 0 10V0Z"/>',
  },
  corner: {
    viewBox: '0 0 20 20',
    content: '<path d="M19.9999 0L20.0001 20H6.85196e-05L19.9999 0Z"/>',
  },
  cross: {
    viewBox: '0 0 17 17',
    content:
      '<path d="M16.9707 2.82812L11.3135 8.48535L16.9707 14.1426L14.1426 16.9707L8.48535 11.3135L2.82812 16.9707L0 14.1426L5.65723 8.48535L0 2.82812L2.82812 0L8.48535 5.65723L14.1426 0L16.9707 2.82812Z"/>',
  },
  ellipse: {
    viewBox: '0 0 20 20',
    content: '<circle cx="10" cy="10" r="10"/>',
  },
  rectangle: {
    viewBox: '0 0 20 20',
    content: '<rect width="20" height="20"/>',
  },
  triangle: {
    viewBox: '0 0 21 18',
    content: '<path d="M10.3921 0L20.7844 18H-0.000214577L10.3921 0Z"/>',
  },
};

type ExportTile = {
  color: string;
  shape?: {
    name: PolygonName;
    color: string;
    rotate?: 0 | 90 | 180 | 270;
    mirrorX?: boolean;
    mirrorY?: boolean;
  };
};

function getShapeScale(name: PolygonName) {
  if (name === 'arc' || name === 'corner') return 1;
  if (name === 'rectangle' || name === 'ellipse') return 0.55;
  if (name === 'cross') return 0.6;
  return 0.65;
}

function renderShape(
  shape: NonNullable<ExportTile['shape']>,
  x: number,
  y: number,
  tileSize: number,
) {
  const scale = getShapeScale(shape.name);
  const size = tileSize * scale;
  const offset = (tileSize - size) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const rotate = shape.rotate ?? 0;
  const scaleX = shape.mirrorX ? -1 : 1;
  const scaleY = shape.mirrorY ? -1 : 1;
  const { viewBox, content } = POLYGON_MARKUP[shape.name];

  return `<g transform="translate(${x + offset} ${y + offset})">
  <g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${scaleX} ${scaleY}) translate(${-cx} ${-cy})">
    <svg width="${size}" height="${size}" viewBox="${viewBox}" fill="${shape.color}">${content}</svg>
  </g>
</g>`;
}

export function buildGridSvg(
  tiles: ExportTile[],
  cols: number,
  rows: number,
  tileSize: number,
) {
  const width = cols * tileSize;
  const height = rows * tileSize;
  const cells = tiles
    .map((tile, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * tileSize;
      const y = row * tileSize;
      const rect = `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${tile.color}"/>`;
      const shape = tile.shape
        ? renderShape(tile.shape, x, y, tileSize)
        : '';
      return `${rect}${shape}`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${cells}</svg>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadSvg(svg: string, filename: string) {
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), filename);
}

export async function downloadPng(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load SVG for PNG export'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');

    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );

    if (!pngBlob) throw new Error('Failed to create PNG');
    downloadBlob(pngBlob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

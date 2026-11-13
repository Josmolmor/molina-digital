import { drawScene } from './render';
import type { Scene } from './scene';
import { buildSvg } from './svg';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportSvg(scene: Scene, filename: string) {
  downloadBlob(
    new Blob([buildSvg(scene)], { type: 'image/svg+xml;charset=utf-8' }),
    filename,
  );
}

/* Re-renders the scene at `scale` rather than upscaling the screen canvas. */
export async function renderPng(scene: Scene, scale: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(scene.width * scale);
  canvas.height = Math.round(scene.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');

  ctx.setTransform(
    canvas.width / scene.width,
    0,
    0,
    canvas.height / scene.height,
    0,
    0,
  );
  drawScene(ctx, scene);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  /* Browsers cap canvas area (notably iOS Safari); past it, toBlob is null. */
  if (!blob) throw new Error('This device cannot render a PNG that large');
  return blob;
}

export async function exportPng(scene: Scene, scale: number, filename: string) {
  downloadBlob(await renderPng(scene, scale), filename);
}

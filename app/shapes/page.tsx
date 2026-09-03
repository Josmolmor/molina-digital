'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'motion/react';

import { ArrowLeft } from '@/components/ui/icons/arrow-left';
import { Mute } from '@/components/ui/icons/mute';
import {
  POLYGON_ICONS,
  type PolygonName,
} from '@/components/ui/icons/polygons';
import { SpeakerHigh } from '@/components/ui/icons/speaker-hight';
import { cn } from '@/lib/utils';

import { buildGridSvg, downloadPng, downloadSvg } from './export';

function getTileSize(width: number) {
  if (width >= 320 && width < 480) return BASE_TILE_SIZE / 1.5;
  return BASE_TILE_SIZE;
}

function useGrid(inset: number) {
  const [state, setState] = useState({ cols: 0, rows: 0, tileSize: 0 });

  useEffect(() => {
    function calculate() {
      const tileSize = getTileSize(window.innerWidth);
      const cols = Math.floor((window.innerWidth - inset * 2) / tileSize);
      const rows = Math.floor((window.innerHeight - inset * 2) / tileSize);
      setState({ cols, rows, tileSize });
    }

    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [inset]);

  return state;
}

const BASE_TILE_SIZE = 120;
const INSET = 24;
const TILE_COLORS = ['#DBDFEB', '#041DE5', '#070707'] as const;
const BASE_COLOR = TILE_COLORS[0];
const BASE_COLOR_WEIGHT = 6;
const ACCENT_COLOR_WEIGHT = 2;

type TileColor = (typeof TILE_COLORS)[number];

type Tile = {
  color: TileColor;
  shape?: {
    name: PolygonName;
    color: TileColor;
    rotate?: 0 | 90 | 180 | 270;
    mirrorX?: boolean;
    mirrorY?: boolean;
  };
};

function getRandomTileColor(allowed: readonly TileColor[]) {
  const weightedColors = allowed.flatMap((color) =>
    Array(color === BASE_COLOR ? BASE_COLOR_WEIGHT : ACCENT_COLOR_WEIGHT).fill(
      color,
    ),
  );

  return weightedColors[Math.floor(Math.random() * weightedColors.length)];
}

const SHAPE_CHANCE = 0.25;
const POLYGON_NAMES = Object.keys(POLYGON_ICONS) as PolygonName[];
const ROTATIONS = [0, 90, 180, 270] as const;
const FLIPPABLE_SHAPES = new Set<PolygonName>(['arc', 'corner']);
const TILE_CLICK_SOUNDS = [
  '/assets/sound/sop-grid/tile-click1.mp3',
  '/assets/sound/sop-grid/tile-click2.mp3',
  '/assets/sound/sop-grid/tile-click3.mp3',
  '/assets/sound/sop-grid/tile-click4.mp3',
] as const;

function playTileClickSound(muted: boolean) {
  if (muted) return;

  const src =
    TILE_CLICK_SOUNDS[Math.floor(Math.random() * TILE_CLICK_SOUNDS.length)];
  const audio = new Audio(src);
  void audio.play().catch(() => {
    // Ignore autoplay / interrupted playback errors.
  });
}

function getRandomShape() {
  return POLYGON_NAMES[Math.floor(Math.random() * POLYGON_NAMES.length)];
}

function getRandomOrientation(name: PolygonName) {
  if (name === 'triangle') {
    return {
      rotate: Math.random() < 0.5 ? (0 as const) : (180 as const),
    };
  }

  if (!FLIPPABLE_SHAPES.has(name)) return {};

  return {
    rotate: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
    mirrorX: Math.random() < 0.5,
    mirrorY: Math.random() < 0.5,
  };
}

function getAccentColors(tile?: Tile) {
  if (!tile) return [];

  return [tile.color, tile.shape?.color].filter(
    (color): color is TileColor => color !== undefined && color !== BASE_COLOR,
  );
}

function createTile(blocked: Set<TileColor>): Tile {
  const color = getRandomTileColor(
    TILE_COLORS.filter((tileColor) => !blocked.has(tileColor)),
  );
  const shapeColors = TILE_COLORS.filter(
    (tileColor) => tileColor !== color && !blocked.has(tileColor),
  );
  const name = getRandomShape();
  const shape =
    Math.random() < SHAPE_CHANCE && shapeColors.length > 0
      ? {
          name,
          color: getRandomTileColor(shapeColors),
          ...getRandomOrientation(name),
        }
      : undefined;

  return { color, shape };
}

function tilesMatch(a: Tile, b: Tile) {
  return (
    a.color === b.color &&
    a.shape?.name === b.shape?.name &&
    a.shape?.color === b.shape?.color &&
    a.shape?.rotate === b.shape?.rotate &&
    a.shape?.mirrorX === b.shape?.mirrorX &&
    a.shape?.mirrorY === b.shape?.mirrorY
  );
}

function createDifferentTile(blocked: Set<TileColor>, current: Tile) {
  let next = createTile(blocked);

  for (let attempt = 0; attempt < 20 && tilesMatch(next, current); attempt++) {
    next = createTile(blocked);
  }

  return next;
}

function getOrthogonalNeighbors(
  tiles: Tile[],
  index: number,
  cols: number,
  rows: number,
) {
  const col = index % cols;
  const row = Math.floor(index / cols);

  return [
    col === 0 ? undefined : tiles[index - 1],
    col === cols - 1 ? undefined : tiles[index + 1],
    row === 0 ? undefined : tiles[index - cols],
    row === rows - 1 ? undefined : tiles[index + cols],
  ];
}

function generateTiles(cols: number, rows: number) {
  const tiles: Tile[] = [];

  for (let i = 0; i < cols * rows; i++) {
    const left = i % cols === 0 ? undefined : tiles[i - 1];
    const above = i < cols ? undefined : tiles[i - cols];
    tiles.push(
      createTile(
        new Set([...getAccentColors(left), ...getAccentColors(above)]),
      ),
    );
  }

  return tiles;
}

function getShapeSizeClass(name: PolygonName) {
  if (name === 'arc' || name === 'corner') return 'size-full';
  if (name === 'rectangle' || name === 'ellipse') return 'size-[55%]';
  if (name === 'cross') return 'size-[60%]';
  return 'size-[65%]';
}

function getShapeTransform(shape: NonNullable<Tile['shape']>) {
  if (shape.rotate === undefined) return undefined;

  const scaleX = shape.mirrorX ? -1 : 1;
  const scaleY = shape.mirrorY ? -1 : 1;
  return `rotate(${shape.rotate}deg) scale(${scaleX}, ${scaleY})`;
}

export default function Shapes() {
  const { cols, rows, tileSize } = useGrid(INSET);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [muted, setMuted] = useState(false);
  const isPaintingRef = useRef(false);
  const lastPaintedIndexRef = useRef<number | null>(null);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (cols === 0 || rows === 0) return;
    setTiles(generateTiles(cols, rows));
  }, [cols, rows]);

  function rerollTile(index: number) {
    playTileClickSound(mutedRef.current);
    setTiles((current) => {
      const next = [...current];
      const blocked = new Set(
        getOrthogonalNeighbors(current, index, cols, rows).flatMap(
          getAccentColors,
        ),
      );
      next[index] = createDifferentTile(blocked, current[index]);
      return next;
    });
  }

  function paintTile(index: number) {
    if (lastPaintedIndexRef.current === index) return;
    lastPaintedIndexRef.current = index;
    rerollTile(index);
  }

  function getTileIndexFromPoint(x: number, y: number) {
    const target = document.elementFromPoint(x, y);
    const tile = target?.closest<HTMLElement>('[data-tile-index]');
    if (!tile) return null;

    const index = Number(tile.dataset.tileIndex);
    return Number.isInteger(index) ? index : null;
  }

  function startPainting(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;

    isPaintingRef.current = true;
    lastPaintedIndexRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);

    const index = getTileIndexFromPoint(event.clientX, event.clientY);
    if (index !== null) paintTile(index);
  }

  function continuePainting(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isPaintingRef.current) return;

    const index = getTileIndexFromPoint(event.clientX, event.clientY);
    if (index !== null) paintTile(index);
  }

  function stopPainting(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isPaintingRef.current) return;

    isPaintingRef.current = false;
    lastPaintedIndexRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function getExportFilename(extension: 'svg' | 'png') {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `shapes-${cols}x${rows}-${stamp}.${extension}`;
  }

  async function saveAsSvg() {
    const svg = buildGridSvg(tiles, cols, rows, tileSize);
    downloadSvg(svg, getExportFilename('svg'));
  }

  async function saveAsPng() {
    const svg = buildGridSvg(tiles, cols, rows, tileSize);
    await downloadPng(svg, getExportFilename('png'));
  }

  if (tiles.length === 0) return null;

  const exportButtonClassName =
    'cursor-pointer touch-manipulation border-0 bg-background px-3 py-2 text-[13px] font-medium tracking-[0.02em] text-foreground hover:bg-[#041de5] hover:text-background dark:hover:text-foreground focus-visible:bg-[#041de5] focus-visible:text-background dark:focus-visible:text-foreground focus-visible:outline-none';

  return (
    <div className="relative min-h-dvh">
      <motion.div
        initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-4 left-4 z-1 flex items-center gap-2 text-sm"
      >
        <Link
          href="/"
          className="pointer-events-auto group text-muted-foreground flex items-center gap-2 p-2 font-medium transition-colors hover:text-foreground hover:underline underline-offset-2"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
          />
          Home
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-4 right-4 z-1 flex items-center gap-2 text-sm"
      >
        <button
          type="button"
          className="pointer-events-auto text-muted-foreground flex items-center justify-center border-0 bg-transparent p-2 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
          aria-label={muted ? 'Unmute tile sounds' : 'Mute tile sounds'}
          aria-pressed={muted}
          onClick={() => setMuted((current) => !current)}
        >
          {muted ? (
            <Mute className="size-5" />
          ) : (
            <SpeakerHigh className="size-5" />
          )}
        </button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-1/2 -translate-x-1/2 bottom-4 z-1 flex gap-2"
      >
        <button
          type="button"
          className={exportButtonClassName}
          onClick={saveAsSvg}
        >
          Save SVG
        </button>
        <button
          type="button"
          className={exportButtonClassName}
          onClick={saveAsPng}
        >
          Save PNG
        </button>
      </motion.div>
      <div
        className="grid h-dvh touch-none select-none content-center justify-center overflow-hidden auto-rows-(--tile-size) grid-cols-[repeat(var(--cols),var(--tile-size))]"
        onPointerDown={startPainting}
        onPointerMove={continuePainting}
        onPointerUp={stopPainting}
        onPointerCancel={stopPainting}
        style={
          {
            '--cols': cols,
            '--tile-size': `${tileSize}px`,
          } as CSSProperties
        }
      >
        {tiles.map((tile, i) => {
          const Shape = tile.shape ? POLYGON_ICONS[tile.shape.name] : null;

          return (
            <button
              key={i}
              type="button"
              className="grid min-h-0 min-w-0 cursor-crosshair touch-none place-items-center border-0 bg-transparent p-0 text-inherit outline-none hover:brightness-95 focus:outline-none focus-visible:brightness-95"
              data-tile-index={i}
              aria-label="Regenerate tile"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  rerollTile(i);
                }
              }}
              style={{
                backgroundColor: tile.color,
                color: tile.shape?.color,
              }}
            >
              {Shape && tile.shape ? (
                <span
                  className={cn(
                    'grid [&_svg]:size-full',
                    getShapeSizeClass(tile.shape.name),
                  )}
                  style={{ transform: getShapeTransform(tile.shape) }}
                >
                  <Shape />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

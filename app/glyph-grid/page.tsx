'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Brush,
  Eraser,
  PaintBucket,
  Redo2,
  RotateCcw,
  Shuffle,
  Trash2,
  Undo2,
} from 'lucide-react';
import { motion, MotionConfig } from 'motion/react';
import { toast } from 'sonner';

import { ArrowLeft } from '@/components/ui/icons/arrow-left';
import { ScrubSlider } from '@/components/ui/scrub-slider';
import { cn } from '@/lib/utils';

import { ActionButton, Segmented, Toggle } from './controls';
import { DEFAULT_BRUSH, DEFAULTS, MAX_COLS, randomLook } from './defaults';
import { exportPng, exportSvg } from './export';
import { ACCENT, EMPTY, SHAPE, type Mask, type MaskValue } from './generator';
import {
  MASTER_SIZE,
  copyCentred,
  createMask,
  floodFill,
  maskSize,
  maskToImageData,
  stampSegment,
} from './mask';
import { inkColor, type PaletteId } from './palettes';
import { ControlPanel } from './panel';
import { drawPreview, drawScene } from './render';
import { paintRandomDrawing } from './shapes';
import { SettingsDrawer } from './settings-drawer';
import { findSvg, stampSvg } from './svg-import';
import {
  ASPECTS,
  buildScene,
  gridRows,
  type Point,
  type PosterSettings,
  type Scene,
} from './scene';

/* Where the layout goes from one column to two (Tailwind's lg). */
const DESKTOP = '(min-width: 64rem)';

function subscribeDesktop(notify: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

/* The server can't know, so it renders the two-column version, which CSS
 * hides on small screens until the client takes over. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

/* How far a pointer may travel (CSS px) and still count as a tap. */
const TAP_SLOP = 8;

type RoleId = 'shape' | 'accent' | 'erase';
type Tool = 'brush' | 'fill';

const ROLE_VALUES: Record<RoleId, MaskValue> = {
  shape: SHAPE,
  accent: ACCENT,
  erase: EMPTY,
};

const ROLE_OPTIONS = [
  { value: 'shape', label: 'Shape' },
  { value: 'accent', label: 'Accent' },
  {
    value: 'erase',
    label: (
      <>
        <Eraser aria-hidden className="size-3.5" />
        Erase
      </>
    ),
  },
] as const;

const TOOL_OPTIONS = [
  {
    value: 'brush',
    label: (
      <>
        <Brush aria-hidden className="size-3.5" />
        Brush
      </>
    ),
  },
  {
    value: 'fill',
    label: (
      <>
        <PaintBucket aria-hidden className="size-3.5" />
        Fill
      </>
    ),
  },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const MAX_HISTORY = 30;

/* Something to look at on first load: a disc with an accent stroke across it. */
function paintStarter(mask: Mask) {
  const { width, height } = mask;
  const unit = Math.min(width, height);
  stampSegment(
    mask,
    width / 2,
    height * 0.42,
    width / 2,
    height * 0.42,
    unit * 0.3,
    SHAPE,
  );
  stampSegment(
    mask,
    width / 2 - unit * 0.24,
    height * 0.42 + unit * 0.16,
    width / 2 + unit * 0.24,
    height * 0.42 - unit * 0.16,
    unit * 0.03,
    ACCENT,
  );
}

/* In mask pixels. Never thinner than one cell, whatever the slider says. */
function brushRadius(mask: Mask, brush: number, cols: number) {
  return (Math.max(1, brush) * (mask.width / cols)) / 2;
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA')
  );
}

export default function GlyphGrid() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [role, setRole] = useState<RoleId>('shape');
  const [tool, setTool] = useState<Tool>('brush');
  const [brush, setBrush] = useState(DEFAULT_BRUSH);
  const [showRaw, setShowRaw] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  /* A palette being hovered in the picker: shown on the poster, but not
   * chosen (and never exported) until it is clicked. */
  const [previewPalette, setPreviewPalette] = useState<PaletteId | null>(null);
  /* Whether Randomize also replaces the drawing. Off by default: the
   * drawing is the one thing here the user made by hand. */
  const [shuffleDrawing, setShuffleDrawing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rawRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<Mask | null>(null);
  /* The whole drawing, on a square. The mask above is a window onto it in
   * the current aspect ratio; what falls outside waits here. */
  const masterRef = useRef<Mask | null>(null);
  const undoRef = useRef<Uint8Array[]>([]);
  const redoRef = useRef<Uint8Array[]>([]);
  const frameRef = useRef(0);
  const strokeRef = useRef<{ pointerId: number; x: number; y: number } | null>(
    null,
  );
  /* What the next frame draws. Kept in a ref so pointer handlers and the
   * frame callback never close over stale state. */
  const viewRef = useRef({ settings, showRaw, role, tool, brush });
  /* Where a mouse or pen is hovering, as 0..1 across the canvas. Touch has
   * no hover, so it never sets this. */
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  /* The last scene drawn: where the type is, for hit-testing. */
  const sceneRef = useRef<Scene | null>(null);
  const dragRef = useRef<{
    kind: 'headline' | 'wordmark' | 'label';
    /* Which label; unset for the other kinds. */
    id?: number;
    pointerId: number;
    /* From the box's top-left to where it was grabbed, in poster units. */
    dx: number;
    dy: number;
    /* Where the press landed on screen, to tell a tap from a drag. */
    downX: number;
    downY: number;
  } | null>(null);
  /* The last tap on a piece of type, waiting for a second one. */
  const tapRef = useRef<{ field: string; time: number } | null>(null);

  const rows = gridRows(settings.cols, settings.aspect);
  const [aspectW, aspectH] = ASPECTS[settings.aspect];

  const update = useCallback(
    (patch: Partial<PosterSettings>) =>
      setSettings((current) => ({ ...current, ...patch })),
    [],
  );

  /* Sample, generate and draw: at most once per animation frame. */
  const render = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const canvas = canvasRef.current;
      const mask = maskRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !mask || !ctx) return;

      const view = viewRef.current;
      const scene = buildScene(mask, view.settings);
      sceneRef.current = scene;
      ctx.setTransform(
        canvas.width / scene.width,
        0,
        0,
        canvas.height / scene.height,
        0,
        0,
      );
      drawScene(ctx, scene);

      /* Hover preview: run the click on a copy of the mask and tint what
       * would change. Not mid-stroke, where the change is already real. */
      const hover = hoverRef.current;
      if (hover && !dragRef.current && !strokeRef.current) {
        const x = hover.x * mask.width;
        const y = hover.y * mask.height;
        const copy = { ...mask, data: mask.data.slice() };
        const value = ROLE_VALUES[view.role];
        if (view.tool === 'fill') {
          floodFill(copy, x, y, value);
        } else {
          const radius = brushRadius(mask, view.brush, view.settings.cols);
          stampSegment(copy, x, y, x, y, radius, value);
        }
        drawPreview(ctx, scene, buildScene(copy, view.settings));
      }

      const raw = rawRef.current;
      if (view.showRaw && raw) {
        if (raw.width !== mask.width || raw.height !== mask.height) {
          raw.width = mask.width;
          raw.height = mask.height;
        }
        raw
          .getContext('2d')
          ?.putImageData(
            maskToImageData(
              mask,
              inkColor(scene.palette),
              scene.palette.accent,
            ),
            0,
            0,
          );
      }
    });
  }, []);

  /* The ref is cleared as well as the frame: a cancelled frame never runs
   * its callback, and a stale id would make render() think one is still
   * pending and skip every later draw. React re-runs effects after this
   * cleanup (in development, and whenever the page is restored), so it has
   * to leave things ready to draw again. */
  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    },
    [],
  );

  const syncHistory = useCallback(() => {
    setCanUndo(undoRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }, []);

  /* The mask follows the aspect ratio. Switching stores the current window
   * in the master and cuts the new one out of it, so nothing is rescaled
   * and switching back restores the drawing exactly. History is dropped
   * because its snapshots are the old size. */
  useEffect(() => {
    const [w, h] = ASPECTS[settings.aspect];
    const size = maskSize(w, h);
    const current = maskRef.current;

    if (!current) {
      const mask = createMask(size.width, size.height);
      paintStarter(mask);
      maskRef.current = mask;
      masterRef.current = createMask(MASTER_SIZE, MASTER_SIZE);
    } else if (current.width !== size.width || current.height !== size.height) {
      const master = masterRef.current ?? createMask(MASTER_SIZE, MASTER_SIZE);
      const next = createMask(size.width, size.height);
      copyCentred(current, master);
      copyCentred(master, next);
      masterRef.current = master;
      maskRef.current = next;
      undoRef.current = [];
      redoRef.current = [];
      syncHistory();
    }
  }, [settings.aspect, syncHistory]);

  useEffect(() => {
    viewRef.current = {
      settings: previewPalette
        ? { ...settings, paletteId: previewPalette }
        : settings,
      showRaw,
      role,
      tool,
      brush,
    };
    render();
  }, [settings, previewPalette, showRaw, role, tool, brush, render]);

  /* Backing store tracks the displayed size, so glyphs stay crisp. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (width === 0 || height === 0) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        render();
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [render]);

  /* History: a snapshot of the mask before each change. */
  const snapshot = useCallback(() => {
    const mask = maskRef.current;
    if (!mask) return;
    undoRef.current.push(mask.data.slice());
    if (undoRef.current.length > MAX_HISTORY) undoRef.current.shift();
    redoRef.current = [];
    syncHistory();
  }, [syncHistory]);

  const step = useCallback(
    (from: Uint8Array[], to: Uint8Array[]) => {
      const mask = maskRef.current;
      const data = from.pop();
      if (!mask || !data) return;
      to.push(mask.data);
      mask.data = data;
      syncHistory();
      render();
    },
    [render, syncHistory],
  );

  const undo = useCallback(
    () => step(undoRef.current, redoRef.current),
    [step],
  );
  const redo = useCallback(
    () => step(redoRef.current, undoRef.current),
    [step],
  );

  /* Back to how the page loads: default settings, default placement and the
   * starter drawing. It wipes more than undo can restore (text, palette,
   * labels), so the toast that confirms it carries its own Undo, which puts
   * back everything, drawing history included. */
  function reset() {
    const before = {
      settings,
      brush,
      mask: maskRef.current,
      master: masterRef.current?.data.slice(),
      undo: undoRef.current,
      redo: redoRef.current,
    };

    const [w, h] = ASPECTS[DEFAULTS.aspect];
    const size = maskSize(w, h);
    const fresh = createMask(size.width, size.height);
    paintStarter(fresh);
    maskRef.current = fresh;
    masterRef.current?.data.fill(EMPTY);
    undoRef.current = [];
    redoRef.current = [];
    syncHistory();
    setSettings(DEFAULTS);
    setBrush(DEFAULT_BRUSH);
    render();

    toast('Poster reset to the defaults', {
      action: {
        label: 'Undo',
        onClick: () => {
          maskRef.current = before.mask;
          if (before.master) masterRef.current?.data.set(before.master);
          undoRef.current = before.undo;
          redoRef.current = before.redo;
          syncHistory();
          setSettings(before.settings);
          setBrush(before.brush);
          render();
        },
      },
    });
  }

  function clear() {
    const mask = maskRef.current;
    if (!mask || !mask.data.some((value) => value !== EMPTY)) return;
    snapshot();
    mask.data.fill(EMPTY);
    /* Including what another aspect ratio had cropped out of view. */
    masterRef.current?.data.fill(EMPTY);
    render();
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || isTyping(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (key === 'y') {
        event.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  /* Pasting an SVG anywhere on the page stamps it onto the drawing in the
   * accent role, as one undo step. Any other paste (text into a field) is
   * left alone. */
  useEffect(() => {
    async function onPaste(event: ClipboardEvent) {
      const data = event.clipboardData;
      const mask = maskRef.current;
      if (!data || !mask) return;

      /* Copied markup (an icon site's "Copy SVG"), or a copied .svg file. */
      const file = [...data.files].find(
        (item) => item.type === 'image/svg+xml',
      );
      const pasted = findSvg(data.getData('text/plain'));
      if (!file && !pasted) return;
      event.preventDefault();

      try {
        const markup = pasted ?? findSvg(await file!.text());
        if (!markup) throw new Error('That does not look like a valid SVG');
        /* Pasted artwork gets the finest grid, where it keeps the most
         * detail; the columns can be lowered again afterwards. Strokes are
         * thickened by a quarter of a cell at that density, so a hairline
         * icon still claims the cells it crosses. */
        const grow = (0.25 * mask.width) / MAX_COLS;
        const covered = await stampSvg(mask, markup, ACCENT, grow, snapshot);
        if (covered === 0)
          throw new Error('That SVG has nothing visible in it');
        setSettings((current) =>
          current.cols === MAX_COLS ? current : { ...current, cols: MAX_COLS },
        );
        render();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Could not paste that SVG',
        );
      }
    }

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [render, snapshot]);

  /* Drawing */
  function toMask(event: ReactPointerEvent<HTMLCanvasElement>, mask: Mask) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * mask.width,
      y: ((event.clientY - rect.top) / rect.height) * mask.height,
    };
  }

  /* Tracks the hover point for the preview; null when off the canvas. */
  function trackHover(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    hoverRef.current = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
  }

  function clearHover() {
    if (!hoverRef.current) return;
    hoverRef.current = null;
    render();
  }

  /* What is under the pointer: any type that can be picked up there.
   * Labels sit on top, then the wordmark, then the headline. */
  /* Brings a text field into view, focused, with its text selected. On small
   * screens the settings open first, and the field only exists once the
   * sheet has mounted, so it is looked for over the next few frames. */
  function editField(id: string, tries = 20) {
    if (!isDesktop && !settingsOpen) setSettingsOpen(true);
    const field = document.getElementById(id);
    if (!(
      field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
    )) {
      if (tries > 0) requestAnimationFrame(() => editField(id, tries - 1));
      return;
    }
    field.focus({ preventScroll: true });
    field.select();
    /* In the sheet, scroll only the sheet: it is still sliding up, and
     * scrollIntoView would drag the page along with it. */
    const sheet = field.closest<HTMLElement>('[data-settings-scroll]');
    if (sheet) {
      const offset =
        field.getBoundingClientRect().top - sheet.getBoundingClientRect().top;
      sheet.scrollTop += offset - (sheet.clientHeight - field.offsetHeight) / 2;
    } else {
      field.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function hitTest(event: ReactPointerEvent<HTMLCanvasElement>) {
    const scene = sceneRef.current;
    if (!scene) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * scene.width;
    const y = ((event.clientY - rect.top) / rect.height) * scene.height;
    const handle = scene.handles.findLast((item) =>
      item.rects.some(
        (box) => x >= box.x0 && x < box.x1 && y >= box.y0 && y < box.y1,
      ),
    );
    return { scene, x, y, handle };
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const mask = maskRef.current;
    if (!mask || event.button !== 0 || strokeRef.current || dragRef.current) {
      return;
    }

    /* A press on type moves it instead of painting. */
    const hit = hitTest(event);
    if (hit?.handle) {
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.style.cursor = 'grabbing';
      clearHover();
      dragRef.current = {
        kind: hit.handle.kind,
        id: hit.handle.id,
        pointerId: event.pointerId,
        dx: hit.x - hit.handle.left,
        dy: hit.y - hit.handle.top,
        downX: event.clientX,
        downY: event.clientY,
      };
      return;
    }

    const { x, y } = toMask(event, mask);
    const value = ROLE_VALUES[role];
    snapshot();

    if (tool === 'fill') {
      if (floodFill(mask, x, y, value)) {
        render();
      } else {
        /* Nothing changed: don't leave an empty step in the history. */
        undoRef.current.pop();
        syncHistory();
      }
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    strokeRef.current = { pointerId: event.pointerId, x, y };
    stampSegment(
      mask,
      x,
      y,
      x,
      y,
      brushRadius(mask, brush, settings.cols),
      value,
    );
    render();
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (drag) {
      const hit = drag.pointerId === event.pointerId ? hitTest(event) : null;
      if (!hit) return;
      /* Stored already snapped to a cell, so most pointer moves change
       * nothing and cost no render. The scene keeps the box on the poster. */
      const { cell, width, height } = hit.scene;
      const x = clamp(
        (Math.round((hit.x - drag.dx) / cell) * cell) / width,
        0,
        1,
      );
      const y = clamp(
        (Math.round((hit.y - drag.dy) / cell) * cell) / height,
        0,
        1,
      );
      const same = (pos: Point | null | undefined) =>
        pos?.x === x && pos?.y === y;
      setSettings((current) => {
        if (drag.kind === 'label') {
          const label = current.labels.find((item) => item.id === drag.id);
          if (!label || same(label.pos)) return current;
          return {
            ...current,
            labels: current.labels.map((item) =>
              item === label ? { ...item, pos: { x, y } } : item,
            ),
          };
        }
        const key = drag.kind === 'headline' ? 'headlinePos' : 'wordmarkPos';
        return same(current[key]) ? current : { ...current, [key]: { x, y } };
      });
      return;
    }

    const mask = maskRef.current;
    const stroke = strokeRef.current;
    if (!stroke) {
      /* Hovering: over type, show it can be picked up; anywhere else,
       * preview what a click would paint. */
      const hit = hitTest(event);
      if (hit?.handle) {
        event.currentTarget.style.cursor = 'grab';
        clearHover();
      } else {
        event.currentTarget.style.cursor = '';
        trackHover(event);
        render();
      }
      return;
    }
    if (!mask || stroke.pointerId !== event.pointerId) return;

    const { x, y } = toMask(event, mask);
    stampSegment(
      mask,
      stroke.x,
      stroke.y,
      x,
      y,
      brushRadius(mask, brush, settings.cols),
      ROLE_VALUES[role],
    );
    stroke.x = x;
    stroke.y = y;
    trackHover(event);
    render();
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.style.cursor = 'grab';
      /* Two taps on the same piece of type, without dragging it, edit it.
       * Counted here rather than with dblclick, which touch browsers don't
       * all fire, and on release so the press can't take the focus back. */
      const still =
        event.type === 'pointerup' &&
        Math.hypot(event.clientX - drag.downX, event.clientY - drag.downY) <
          TAP_SLOP;
      const field =
        drag.kind === 'label' ? `glyph-label-${drag.id}` : `glyph-${drag.kind}`;
      const last = tapRef.current;
      tapRef.current = null;
      if (still && last?.field === field && event.timeStamp - last.time < 400) {
        /* After a touch, browsers send a mouse press as well, and its
         * default would take the focus straight back from the field. It can
         * land anywhere (the poster may have just docked), so it is caught
         * on the document, once. */
        const keepFocus = (press: MouseEvent) => press.preventDefault();
        const options = { capture: true, once: true };
        document.addEventListener('mousedown', keepFocus, options);
        setTimeout(
          () => document.removeEventListener('mousedown', keepFocus, options),
          500,
        );
        editField(field);
      } else if (still) {
        tapRef.current = { field, time: event.timeStamp };
      }
    } else if (strokeRef.current?.pointerId === event.pointerId) {
      strokeRef.current = null;
    } else {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    /* The stroke may have ended off the canvas; the preview resumes (or
     * goes away) from wherever the pointer is now. */
    trackHover(event);
    render();
  }

  /* Export */
  function currentScene() {
    const mask = maskRef.current;
    return mask ? buildScene(mask, settings) : null;
  }

  function filename(suffix: string) {
    return `glyph-grid-${settings.cols}x${rows}-${settings.seed}${suffix}`;
  }

  async function savePng(scale: number) {
    const scene = currentScene();
    if (!scene) return;
    try {
      await exportPng(scene, scale, filename(`@${scale}x.png`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
    }
  }

  function saveSvg() {
    const scene = currentScene();
    if (scene) exportSvg(scene, filename('.svg'));
  }

  /* A new look; with the switch on, a new drawing too. */
  function randomize() {
    const mask = maskRef.current;
    if (shuffleDrawing && mask) {
      /* Undoable, like any other change to the drawing. */
      snapshot();
      paintRandomDrawing(mask);
      masterRef.current?.data.fill(EMPTY);
    }
    update(randomLook());
  }

  const panel = (
    <ControlPanel
      settings={settings}
      rows={rows}
      update={update}
      showRaw={showRaw}
      onShowRaw={setShowRaw}
      onPreviewPalette={setPreviewPalette}
      onSavePng={savePng}
      onSaveSvg={saveSvg}
    />
  );
  /* On small screens, opening the settings docks the poster above them. */
  const docked = settingsOpen && !isDesktop;

  return (
    <div className="relative min-h-dvh">
      {/* reducedMotion="user" drops the slide and keeps the fade. */}
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-none absolute top-4 left-4 z-1 flex items-center gap-2 text-sm"
        >
          <Link
            href="/"
            className="pointer-events-auto group text-muted-foreground flex items-center gap-2 p-2 font-medium transition-colors hover:text-foreground hover:underline underline-offset-2"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            Home
          </Link>
        </motion.div>
      </MotionConfig>

      <main className="mx-auto flex w-full max-w-340 flex-col gap-6 px-4 pt-16 pb-24 sm:gap-10 sm:px-12 sm:pt-20 lg:pb-14">
        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-2xl font-medium">Glyph grid</h1>
          <p className="max-w-prose text-muted-foreground">
            Draw a shape and it becomes a poster of colored cells and monospace
            characters. Paste an SVG, shuffle the look, then export it. Inspired
            by{' '}
            <a
              href="https://x.com/designbyaron/status/2120901935129657517?a=JU6aTbr6kMQO7rey5YA"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <span className="text-primary">@designbyaron&apos;s post</span>
              <span className="rounded absolute -bottom-0.5 left-0 h-0.5 w-full origin-bottom-right scale-x-0 bg-primary transition-transform ease-out-quad group-hover:origin-bottom-left group-hover:scale-x-100 motion-reduce:transition-none" />
            </a>
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-10">
          {/* Canvas and toolbar share one width, so the toolbar lines up with
           * the poster's edges in every aspect ratio. That width is capped by
           * height too, which keeps the toolbar on screen.
           *
           * The frame is sized from the nominal ratio (4:5), not from the
           * grid: rows are whole numbers, so the poster's true ratio drifts
           * by a percent or so with the column count (30 columns is 30:38),
           * and sizing from that made the layout jump. The poster is fitted
           * inside the frame instead.
           *
           * The height cap uses lvh, which stays put: dvh changes as a
           * phone's address bar collapses, and the poster resized with every
           * scroll. On phones the cap only stops tall formats from outgrowing
           * the screen; otherwise the poster takes the full width. */}
          <div
            className="mx-auto flex w-full max-w-[calc(max(16rem,100lvh-12rem)*var(--ratio))] flex-col gap-3 lg:sticky lg:top-6 lg:max-w-[calc(max(20rem,100lvh-22rem)*var(--ratio))]"
            style={{ '--ratio': aspectW / aspectH } as CSSProperties}
          >
            {/* The frame keeps its place in the page while the stage inside
             * it is docked, so nothing below moves. */}
            <div
              className="w-full"
              style={{ aspectRatio: `${aspectW} / ${aspectH}` }}
            >
              <div
                className={cn(
                  '@container-size flex items-center justify-center',
                  docked
                    ? 'fixed inset-x-0 top-0 z-40 h-[45dvh] bg-background p-4'
                    : 'size-full',
                )}
              >
                <div
                  className="relative"
                  style={{
                    aspectRatio: `${settings.cols} / ${rows}`,
                    /* Contained in the stage, whatever its shape. */
                    width: `min(100cqw, 100cqh * ${settings.cols / rows})`,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    aria-label="Poster canvas: draw here"
                    className="absolute inset-0 size-full cursor-crosshair touch-none select-none"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerEnd}
                    onPointerCancel={onPointerEnd}
                    onPointerLeave={() => {
                      /* Captured strokes fire leave too; they keep their outline. */
                      if (!strokeRef.current) clearHover();
                    }}
                  />
                  <canvas
                    ref={rawRef}
                    aria-hidden
                    hidden={!showRaw}
                    className="pointer-events-none absolute inset-0 size-full opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* The toolbar is as wide as the poster, which varies a lot with
             * the aspect ratio, so its items size against the toolbar itself
             * (container queries), not the viewport. */}
            <div className="@container">
              <div className="flex flex-wrap gap-2">
                <Segmented
                  label="Role"
                  value={role}
                  options={ROLE_OPTIONS}
                  onChange={setRole}
                  className="basis-full @md:basis-auto @md:flex-1"
                />
                <Segmented
                  label="Tool"
                  value={tool}
                  options={TOOL_OPTIONS}
                  onChange={setTool}
                  className="flex-1 @md:flex-none"
                />
                <ScrubSlider
                  label="Size"
                  valueLabel={`${brush.toFixed(1)} cells`}
                  min={1}
                  max={6}
                  step={0.5}
                  value={[brush]}
                  onValueChange={([value]) => setBrush(value)}
                  onReset={() => setBrush(DEFAULT_BRUSH)}
                  className="min-w-40 flex-1 basis-0 @md:min-w-48"
                />
                <div className="flex gap-2">
                  <ActionButton
                    aria-label="Reset poster"
                    title="Reset everything to the defaults"
                    onClick={reset}
                  >
                    <RotateCcw aria-hidden />
                  </ActionButton>
                  <ActionButton
                    aria-label="Undo"
                    title="Undo"
                    disabled={!canUndo}
                    onClick={undo}
                  >
                    <Undo2 aria-hidden />
                  </ActionButton>
                  <ActionButton
                    aria-label="Redo"
                    title="Redo"
                    disabled={!canRedo}
                    onClick={redo}
                  >
                    <Redo2 aria-hidden />
                  </ActionButton>
                  <ActionButton
                    aria-label="Clear drawing"
                    title="Clear drawing"
                    onClick={clear}
                  >
                    <Trash2 aria-hidden />
                  </ActionButton>
                </div>
                {/* One control in two parts: the action, and the option that
                 * changes what it does. They share a surface, split by a
                 * hairline, and read as a single phrase. */}
                <div
                  role="group"
                  aria-label="Randomize"
                  className="flex flex-1 gap-px @xl:ml-auto @xl:flex-none"
                >
                  <ActionButton
                    title={
                      shuffleDrawing
                        ? 'Randomize the look and the drawing'
                        : 'Randomize the look: palette, grid, glyphs, bands and seed'
                    }
                    onClick={randomize}
                    className="flex-1 rounded-r-none focus-visible:z-1 @xl:flex-none"
                  >
                    <Shuffle aria-hidden />
                    Randomize
                  </ActionButton>
                  <Toggle
                    label="Include drawing"
                    title="Also replace the drawing with a new one (undo brings yours back)"
                    checked={shuffleDrawing}
                    onChange={setShuffleDrawing}
                    className="w-auto rounded-l-none focus-visible:z-1"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: copy an SVG, such as an icon, and paste it anywhere on this
              page to draw it in the accent color.
            </p>
          </div>

          {/* One panel, in one of two places: beside the poster, or in a
           * bottom sheet on small screens. */}
          {isDesktop ? (
            <div className="max-lg:hidden">{panel}</div>
          ) : (
            <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen}>
              {panel}
            </SettingsDrawer>
          )}
        </div>
      </main>
    </div>
  );
}

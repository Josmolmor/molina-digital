'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type ScrubSliderProps = ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  label: string;
  /* What to show on the right; defaults to the raw value. */
  valueLabel?: ReactNode;
  /* Double-clicking the bar calls this, e.g. to restore a default. */
  onReset?: () => void;
};

type Span = readonly [start: number, end: number];

/* Text extents inside the bar, in px from its left edge. */
type TextZones = { width: number; label: Span; value: Span };

/* How close (px) the handle may get to the text before it steps aside. */
const TEXT_CLEARANCE = 6;

function within(x: number, [start, end]: Span) {
  return x >= start - TEXT_CLEARANCE && x <= end + TEXT_CLEARANCE;
}

/*
 * A scrub-style slider: the whole bar is the control, the fill is the value,
 * and the label and value sit inside it. Built on Radix, so keyboard and
 * screen reader support come from the primitive.
 */
export const ScrubSlider = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  ScrubSliderProps
>(
  (
    {
      label,
      valueLabel,
      onReset,
      className,
      min = 0,
      max = 100,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const overlayRef = useRef<HTMLSpanElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const valueRef = useRef<HTMLSpanElement>(null);
    const [zones, setZones] = useState<TextZones | null>(null);
    const [uncontrolled, setUncontrolled] = useState(
      props.defaultValue?.[0] ?? min,
    );
    const value = props.value?.[0] ?? uncontrolled;

    /* The text only moves when it is resized, so measure on resize, not per
     * value change. */
    useLayoutEffect(() => {
      const overlay = overlayRef.current;
      const labelEl = labelRef.current;
      const valueEl = valueRef.current;
      if (!overlay || !labelEl || !valueEl) return;

      const measure = () => {
        const base = overlay.getBoundingClientRect();
        const extent = (el: HTMLElement): Span => {
          const rect = el.getBoundingClientRect();
          return [rect.left - base.left, rect.right - base.left];
        };
        setZones({
          width: base.width,
          label: extent(labelEl),
          value: extent(valueEl),
        });
      };

      measure();
      const observer = new ResizeObserver(measure);
      [overlay, labelEl, valueEl].forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, []);

    const handleX = zones
      ? ((value - min) / (max - min || 1)) * zones.width
      : null;
    const overText =
      handleX !== null &&
      zones !== null &&
      (within(handleX, zones.label) || within(handleX, zones.value));

    return (
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        onValueChange={(next) => {
          setUncontrolled(next[0]);
          onValueChange?.(next);
        }}
        onDoubleClick={onReset}
        title={onReset ? 'Double-click to reset' : undefined}
        className={cn(
          'group/scrub relative flex h-9 w-full touch-none select-none items-center overflow-hidden rounded-lg bg-card',
          /* Hover lifts the bar and fill one step; colour only, so it can't move anything. */
          'transition-[background-color] duration-150 ease-[ease] hover:bg-scrub-hover',
          'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="absolute inset-0">
          <SliderPrimitive.Range className="absolute inset-y-0 bg-scrub-range transition-[background-color] duration-150 ease-[ease] group-hover/scrub:bg-scrub-range-hover" />
        </SliderPrimitive.Track>
        {/*
         * The handle: a pill on the edge of the fill. Hidden at rest; shown on
         * hover, while dragging, and on keyboard focus. Over the label or the
         * value it drops to half height and fades out of the text's way.
         *
         * The thumb itself is zero-width and the pill is drawn centred on it.
         * Radix nudges a thumb inwards by up to half its width to keep it in
         * bounds, which the fill doesn't get, so a sized thumb drifts off the
         * fill edge towards either end. With no width there's no nudge.
         */}
        <SliderPrimitive.Thumb
          aria-label={label}
          data-over-text={overText || undefined}
          className={cn(
            'relative block h-6 w-0 opacity-0 outline-none',
            'before:absolute before:inset-y-0 before:left-1/2 before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-foreground/50',
            'before:transition-[background-color] before:duration-150 before:ease-[ease] group-active/scrub:before:bg-foreground/80',
            '[--handle-opacity:1] data-over-text:[--handle-opacity:0.2] data-over-text:scale-y-70',
            'group-hover/scrub:opacity-(--handle-opacity) group-active/scrub:opacity-(--handle-opacity) group-has-focus-visible/scrub:opacity-(--handle-opacity)',
            'transition-[opacity,scale] duration-150 ease-(--ease-out-quint)',
          )}
        />
        <span
          ref={overlayRef}
          className="pointer-events-none relative flex w-full items-center justify-between gap-3 px-3 text-sm"
        >
          <span ref={labelRef} className="text-foreground/80">
            {label}
          </span>
          <span
            ref={valueRef}
            className="font-mono tabular-nums text-foreground"
          >
            {valueLabel ?? value}
          </span>
        </span>
      </SliderPrimitive.Root>
    );
  },
);
ScrubSlider.displayName = 'ScrubSlider';

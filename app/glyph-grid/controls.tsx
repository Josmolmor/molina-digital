import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
} from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/* Shared with ScrubSlider: same height, surface and focus ring. */
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
/* The press (the site-wide scale on :active) eases with the colour. Reduced
 * motion keeps the colour fade and drops the movement. */
const SURFACE =
  'rounded-lg bg-card transition-[background-color,transform] duration-150 ease-out motion-reduce:transition-[background-color]';

/* 16px on phones: iOS zooms the page when focusing anything smaller. */
export const INPUT = cn(
  SURFACE,
  'w-full px-3 py-2 text-base sm:text-sm placeholder:text-muted-foreground',
  'outline-none focus-visible:ring-2 focus-visible:ring-ring',
);

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}

/* A labelled control. The label is a real <label> when given an htmlFor. */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

type Option<T extends string> = { value: T; label: ReactNode };

/*
 * An explanation for a control whose name isn't self-evident. Shown on hover
 * and on keyboard focus; the child has to pass props and a ref through.
 */
export function Hint({
  text,
  children,
}: {
  text: string;
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-60 text-pretty">{text}</TooltipContent>
    </Tooltip>
  );
}

/* One choice from a few: a radio group drawn as a segmented bar. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'onChange' | 'children'> & {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      /* Spread first: a wrapping Hint passes its ref and handlers here. */
      {...props}
      className={cn('flex gap-1 rounded-lg bg-card p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              /* Taller on touch screens, where 28px is a small target. */
              'flex h-7 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap pointer-coarse:h-9',
              'transition-[background-color,color,transform] duration-150 ease-out motion-reduce:transition-[background-color,color]',
              FOCUS,
              active
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type Swatch = {
  background: string;
  bands: string[];
  accent: string;
};

/*
 * Palette choice: a radio group of tiles. Each swatch is the palette in
 * miniature: its ground, with the lead band, deepest band and accent on it.
 */
export function PalettePicker<T extends string>({
  label,
  value,
  options,
  onChange,
  onPreview,
}: {
  label: string;
  value: T;
  options: readonly { value: T; name: string; palette: Swatch }[];
  onChange: (value: T) => void;
  /* Hovering an option with a mouse; null when the pointer leaves. Touch
   * is ignored: it has no hover, and a tap already commits. */
  onPreview?: (value: T | null) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-3 gap-1 rounded-lg bg-card p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        const { background, bands, accent } = option.palette;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') onPreview?.(option.value);
            }}
            onPointerLeave={() => onPreview?.(null)}
            className={cn(
              'flex h-8 min-w-0 touch-manipulation items-center gap-1.5 rounded-md px-1.5 text-sm pointer-coarse:h-10',
              'transition-[background-color,color,transform] duration-150 ease-out motion-reduce:transition-[background-color,color]',
              FOCUS,
              active
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span
              aria-hidden
              className="flex h-4 w-7 shrink-0 items-center justify-center gap-0.5 rounded-sm ring-1 ring-foreground/15"
              style={{ backgroundColor: background }}
            >
              {[bands[0], bands[bands.length - 1], accent].map((color, i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
            <span className="truncate">{option.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* A colour well: the native picker, sized and surfaced like the other controls. */
export function ColorInput({
  className,
  ...props
}: ComponentPropsWithoutRef<'input'>) {
  return (
    <input
      type="color"
      className={cn(
        SURFACE,
        'h-9 w-full min-w-0 cursor-pointer p-1 hover:bg-scrub-hover',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring',
        '[&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0',
        className,
      )}
      {...props}
    />
  );
}

/* On/off: a full-width row with the label on the left and a switch on the right. */
export function Toggle({
  label,
  checked,
  onChange,
  className,
  ...props
}: Omit<ComponentProps<'button'>, 'onChange' | 'children'> & {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      /* Spread first: a wrapping tooltip passes its ref and handlers here. */
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        onChange(!checked);
      }}
      className={cn(
        SURFACE,
        FOCUS,
        'group/toggle flex h-9 w-full touch-manipulation items-center justify-between gap-3 px-3 text-sm hover:bg-scrub-hover',
        /* The row is the hit target, but pressing it shouldn't shrink it:
         * the thumb moving is the feedback. */
        'active:transform-none!',
        className,
      )}
    >
      <span className="whitespace-nowrap text-foreground/80">{label}</span>
      {/* Track and thumb. State is carried by position and by fill, so it
       * reads without relying on colour alone. */}
      <span
        aria-hidden
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-[background-color] duration-150 ease-[ease]',
          checked ? 'bg-foreground' : 'bg-scrub-range-hover',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow-xs',
            'transition-[translate,scale] duration-150 ease-(--ease-out-quint) motion-reduce:transition-none',
            /* Pressing stretches the thumb towards where it is about to go:
             * a scale from the edge it is leaving, so it stays on the GPU. */
            'group-active/toggle:scale-x-125',
            checked ? 'origin-right translate-x-4' : 'origin-left',
          )}
        />
      </span>
    </button>
  );
}

export function ActionButton({
  className,
  ...props
}: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        SURFACE,
        FOCUS,
        'flex h-9 touch-manipulation items-center justify-center gap-2 px-3 text-sm whitespace-nowrap hover:bg-scrub-hover',
        'disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

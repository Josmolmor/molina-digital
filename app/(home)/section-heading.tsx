// Both labels share one grid cell, so the swap never changes layout; only opacity, translate and blur animate.
// pointer-events-none: the labels move, so they can't be part of the hover area, or hovering where a label
// rests would move it out from under the cursor, end the hover, move it back, and loop. The link's own box
// (which never moves) is the only hover/click target.
const swapTransition =
  'pointer-events-none transition-[opacity,translate,filter] ease-(--ease-out-quint) motion-reduce:transition-none';

export const SectionHeading = () => {
  return (
    <div className="relative flex flex-col gap-1 items-center">
      <h1 className="font-medium text-2xl font-serif">
        <a
          href="https://x.com/mlndev"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-grid outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Exits a bit faster (150ms) than it re-enters (200ms) */}
          <span
            className={`[grid-area:1/1] duration-250 group-hover:duration-250 group-hover:-translate-y-4 group-hover:opacity-0 group-hover:blur-xs group-focus-visible:duration-250 group-focus-visible:-translate-y-4 group-focus-visible:opacity-0 group-focus-visible:blur-xs ${swapTransition}`}
          >
            Jose Molina
          </span>
          <span
            aria-hidden
            className={`[grid-area:1/1] translate-y-4 opacity-0 blur-xs duration-250 group-hover:duration-250 group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none group-focus-visible:duration-250 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:blur-none ${swapTransition}`}
          >
            <span className="font-mono mr-0.5">@</span>mlndev
          </span>
        </a>
      </h1>
    </div>
  );
};

'use client';

import {
  animate,
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from 'motion/react';
import Link from 'next/link';
import { HandPointing } from '@/components/ui/icons/hand-pointing';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { ArrowLeft } from './ui/icons/arrow-left';
import { Share } from './ui/icons/share';
import { Copy } from './ui/icons/copy';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export type CreativeStrategy = {
  category: string;
  prompt: string;
};

/*
 * The deck holds one optional cover card ahead of the strategies. It is dealt,
 * dragged and thrown exactly like any other card; only its face differs.
 */
export type DeckCard =
  | { kind: 'cover'; content: ReactNode }
  | { kind: 'strategy'; strategy: CreativeStrategy };

type CardStackProps = {
  strategies: CreativeStrategy[];
  cover?: ReactNode;
};

/*
 * Geometry of the deck. The enter variant of the active card reuses these
 * so a promoted card starts exactly where its stacked copy sat.
 */
const SCALE_STEP = 0.025;
const Y_STEP = 14;
const DEPTHS = [1, 2, 3];

/*
 * Where a discarded card lands: the deepest rendered slot, so it arrives on top
 * of an identically placed card and can unmount without a pop.
 */
const BOTTOM_DEPTH = DEPTHS[DEPTHS.length - 1];

/* How far past centre the card travels before it turns around. */
const THROW_DISTANCE = 90;

/* Tilt at the far end of the throw. Small: the card is thrown, not spun. */
const THROW_ROTATION = 10;

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

/*
 * The return leaves the turnaround at speed and settles long (the iOS drawer
 * curve). An ease-in there would decelerate into the turn and accelerate out of
 * it, parking the card off-screen for a beat.
 */
const EASE_RETURN = [0.455, 0.03, 0.515, 0.955] as const;

/*
 * First paint: the deck is dealt in from above, off to one side and tilted,
 * deepest card first so the top card lands last.
 */
const DEAL_ORIGIN = { x: -48, y: -180, rotate: -8 };
const DEAL_STAGGER = 0.07;

const DEAL: Transition = {
  type: 'spring',
  duration: 1,
  bounce: 0.2,
};

/*
 * The cards are opaque paper. Fading one in over the length of its slide lets
 * the cards underneath read through it, which looks like a rendering bug rather
 * than a deal, so opacity resolves well before the movement does.
 */
const OPACITY_IN: Transition = { duration: 0.14, ease: EASE_OUT };

function dealTransition(delay: number): Transition {
  return { ...DEAL, delay, opacity: { ...OPACITY_IN, delay } };
}

/* The last card lands a full spring after the longest stagger. */
const DEAL_TOTAL = 1 + BOTTOM_DEPTH * DEAL_STAGGER;

/* Out and back. The throw shortens with a harder flick; the return is fixed. */
const RETURN_DURATION = 0.5;

function throwDuration(velocity: number) {
  return Math.min(0.24, Math.max(0.14, 0.24 - Math.abs(velocity) / 2500));
}

/* Fraction of the card's own width that counts as a committed drag. */
const DRAG_RATIO = 0.25;
const VELOCITY_THRESHOLD = 500;

/* The deck settling: the system responding, so it can breathe a little. */
const PROMOTE: Transition = {
  type: 'spring',
  duration: 0.5,
  bounce: 0.15,
};

const FADE: Transition = {
  duration: 0.2,
  ease: [0.23, 1, 0.32, 1],
};

/*
 * Arrow keys are a hold-and-repeat action: animating them makes the deck feel
 * slow and disconnected from the key, so keyboard navigation just swaps.
 */
const INSTANT: Transition = { duration: 0 };

type Motion = {
  /*
   * The deck only ever goes deeper: this is the side the discarded card flies
   * off towards, not a place in a history.
   */
  exitDirection: 1 | -1;
  /* Throw velocity in % of card width per second. */
  velocity: number;
  reduce: boolean;
  /* Keyboard navigation: swap without motion. */
  instant: boolean;
  /*
   * The card underneath was already uncovered by the drag, so its face is
   * on screen before it is promoted: replaying the enter animation on the
   * text would flicker something the eye is already reading.
   */
  dragged: boolean;
};

function stillness(motion: Motion) {
  return motion.instant || motion.reduce;
}

const cardVariants = {
  enter: (motion: Motion) => {
    if (stillness(motion)) {
      return {
        opacity: motion.instant ? 1 : 0,
        x: 0,
        scale: 1,
        y: 0,
        rotate: 0,
      };
    }

    /*
     * The next card was already visible under the deck, so it rises out of the
     * stack rather than flying in from nowhere.
     */
    return { opacity: 1, x: 0, scale: 1 - SCALE_STEP, y: Y_STEP, rotate: 0 };
  },
  center: (motion: Motion) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: motion.instant ? INSTANT : motion.reduce ? FADE : PROMOTE,
  }),
  exit: (motion: Motion) => {
    const { exitDirection, velocity } = motion;

    if (stillness(motion)) {
      return {
        opacity: 0,
        transition: motion.instant ? INSTANT : FADE,
      };
    }

    const out = throwDuration(velocity);
    const total = out + RETURN_DURATION;

    /*
     * Out and back: the card is thrown clear of the screen, then slides in
     * along the same path to settle at the bottom of the deck. The drop behind
     * the stack is handled in `ActiveCard`, at the turnaround.
     *
     * `%` is relative to the card, so the throw reads the same on a phone and
     * on a 4K monitor.
     */
    return {
      opacity: 1,
      x: ['0%', `${exitDirection * THROW_DISTANCE}%`, '0%'],
      rotate: [0, exitDirection * THROW_ROTATION, 0],
      scale: [1, 1, 1 - BOTTOM_DEPTH * SCALE_STEP],
      y: [0, 0, BOTTOM_DEPTH * Y_STEP],
      transition: {
        duration: total,
        times: [0, out / total, 1],
        ease: [EASE_OUT, EASE_RETURN],
      },
    };
  },
};

export function CardStack({ strategies, cover }: CardStackProps) {
  const deck = useMemo<DeckCard[]>(() => {
    const cards: DeckCard[] = strategies.map((strategy) => ({
      kind: 'strategy',
      strategy,
    }));

    return cover ? [{ kind: 'cover', content: cover }, ...cards] : cards;
  }, [strategies, cover]);

  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion() ?? false;

  const [motionContext, setMotionContext] = useState<Motion>({
    exitDirection: -1,
    velocity: 0,
    reduce,
    instant: false,
    dragged: false,
  });

  /*
   * There is no going back: whichever way the top card is thrown, it goes to
   * the bottom of the deck and the one underneath comes up.
   */
  function next(
    exitDirection: 1 | -1 = -1,
    velocity = 0,
    instant = false,
    dragged = false,
  ) {
    /*
     * No animation lock: springs retarget from their current state, so a
     * second swipe should land on the deck, not on a dead card.
     */
    setMotionContext({ exitDirection, velocity, reduce, instant, dragged });

    /*
     * A card thrown before the hand has finished landing ends the deal early:
     * whatever comes up next must arrive with its face already on.
     */
    setDealt(true);

    setActiveIndex((current) => (current + 1) % deck.length);
  }

  /*
   * Held in a ref so the listener is attached once instead of on every render.
   */
  const nextRef = useRef(next);
  nextRef.current = next;

  /*
   * True only while the very first render is being laid out: cards that mount
   * later (a new bottom card on every navigation) fade in where they belong
   * instead of being dealt again.
   */
  const dealtRef = useRef(false);
  const dealing = !dealtRef.current;

  /*
   * The faces stay blank for the length of the deal: the cards are still
   * translucent on the way in, so text under them would read through as a
   * rendering fault. Once the hand has landed the faces come up — including
   * the one under the cover, which a drag can uncover before it is promoted.
   */
  const [dealt, setDealt] = useState(false);

  useEffect(() => {
    dealtRef.current = true;

    const landed = window.setTimeout(
      () => setDealt(true),
      reduce ? 0 : DEAL_TOTAL * 1000,
    );

    return () => window.clearTimeout(landed);
  }, [reduce]);

  /*
   * AnimatePresence freezes an exiting card's props at its last render, so the
   * card being thrown cannot read the throw it is part of. The ref is stable,
   * so the frozen element still sees the current values through it.
   */
  const motionRef = useRef(motionContext);
  motionRef.current = motionContext;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      /*
       * The listener is on the window, so it also sees the Enter and Space that
       * belong to a focused control. Those keys are its own: Enter on the Home
       * link must navigate and Space on the copy button must copy, not deal the
       * next card. `activeElement` is checked alongside the event target
       * because a control that swallows the key still leaves focus on itself.
       */
      const owned = `a[href], button, input, textarea, select, [contenteditable], [tabindex]:not([tabindex="-1"])`;
      const target = event.target as HTMLElement | null;
      const focused = document.activeElement as HTMLElement | null;

      if (target?.closest?.(owned) || focused?.closest?.(owned)) return;

      const advances =
        event.key === 'ArrowRight' ||
        event.key === 'ArrowLeft' ||
        event.key === 'Enter' ||
        event.key === ' ';

      if (!advances) return;

      event.preventDefault();

      /* Instant: a repeatable key should never wait on a spring. */
      nextRef.current(event.key === 'ArrowRight' ? 1 : -1, 0, true);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (deck.length === 0) {
    return null;
  }

  /*
   * Two cards underneath the active card, keyed by the strategy they show so
   * they animate between depths instead of remounting on every navigation.
   */
  const stack = DEPTHS.map((depth) => {
    const index = (activeIndex + depth) % deck.length;

    return {
      card: deck[index],
      index,
      depth,
    };
  })
    /*
     * Deepest first. Every card is `absolute inset-0` at the same z, so paint
     * order is DOM order: rendered shallowest-first, the smallest card sits on
     * top of the others and is what you actually see through the gap when the
     * active card is dragged aside.
     */
    .reverse();

  /*
   * The clip lives on the viewport-wide element: a card thrown out of a 50dvw
   * column would otherwise be sliced off at the column's edge.
   */
  return (
    <main
      className="relative h-dvh w-dvw overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Creative strategies"
    >
      <motion.div
        initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex items-center gap-2 absolute top-4 left-4 text-sm"
      >
        <Link
          href="/"
          className="group text-muted-foreground flex items-center gap-2 p-2 transition-colors hover:text-foreground hover:underline underline-offset-2 font-medium"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 shrink-0 group-hover:-translate-x-0.5 transition-transform"
          />
          Home
        </Link>
      </motion.div>
      <p className="sr-only" aria-live="polite">
        {`${cardLabel(deck[activeIndex])} Card ${activeIndex + 1} of ${deck.length}. Press Enter for the next card.`}
      </p>
      <div className="absolute inset-0 top-16 bottom-30 m-auto w-full p-2 pb-4 sm:max-w-lg sm:p-5 lg:p-6 max-h-192">
        {/* `isolate` keeps the returning card's negative z-index inside this
            stack instead of dropping it behind the page background. */}
        <div className="relative isolate size-full">
          {/* Cards behind the active card */}
          {stack.map(({ card, index, depth }) => (
            <motion.div
              key={index}
              /* Only the front card is interactive: `inert` keeps the links and
                 buttons on the cards behind it out of the tab order and off the
                 accessibility tree. */
              inert
              className="@container absolute inset-0 overflow-hidden rounded-3xl bg-white sm:rounded-4xl ring ring-inset ring-neutral-300"
              initial={
                dealing && !reduce
                  ? {
                      opacity: 0,
                      x: DEAL_ORIGIN.x,
                      y: DEAL_ORIGIN.y,
                      rotate: DEAL_ORIGIN.rotate,
                      scale: 1 - depth * SCALE_STEP,
                    }
                  : {
                      opacity: 0,
                      scale: 1 - depth * SCALE_STEP,
                      y: depth * Y_STEP,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                rotate: 0,
                scale: 1 - depth * SCALE_STEP,
                y: depth * Y_STEP,
              }}
              transition={
                dealing && !reduce
                  ? /* Deepest lands first, so the deck builds upwards. */
                    dealTransition((BOTTOM_DEPTH - depth) * DEAL_STAGGER)
                  : motionContext.instant
                    ? INSTANT
                    : reduce
                      ? FADE
                      : PROMOTE
              }
            >
              <CardContent card={card} dealing={!dealt} />
            </motion.div>
          ))}

          {/* Active card */}
          {/* No `initial={false}`: the first card is dealt in like the rest. */}
          <AnimatePresence custom={motionContext} mode="popLayout">
            <ActiveCard
              key={activeIndex}
              card={deck[activeIndex]}
              deal={dealing}
              dealt={dealt}
              motionContext={motionContext}
              motionRef={motionRef}
              reduce={reduce}
              onNext={next}
            />
          </AnimatePresence>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full text-center px-2 block fixed left-1/2 bottom-8 -translate-x-1/2 text-xs text-foreground"
      >
        Inspired by{' '}
        <a
          href="https://getdesignstrategies.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Josh Puckett
        </a>{' '}
        and the concept of{' '}
        <a
          href="https://en.wikipedia.org/wiki/Oblique_Strategies"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Oblique Strategies
        </a>
      </motion.span>
    </main>
  );
}

type ActiveCardProps = {
  card: DeckCard;
  deal: boolean;
  /* The hand has landed, so faces may come up. */
  dealt: boolean;
  motionContext: Motion;
  motionRef: RefObject<Motion>;
  reduce: boolean;
  onNext: (
    exitDirection?: 1 | -1,
    velocity?: number,
    instant?: boolean,
    dragged?: boolean,
  ) => void;
};

function ActiveCard({
  card,
  deal,
  dealt,
  motionContext,
  motionRef,
  reduce,
  onNext,
}: ActiveCardProps) {
  /*
   * The motion value belongs to this card, not to the deck: the card being
   * thrown keeps the offset the drag gave it instead of snapping back to
   * centre the moment it is replaced.
   */
  const x = useMotionValue(0);

  const rotate = useTransform(
    x,
    [-360, 0, 360],
    reduce ? [0, 0, 0] : [-8, 0, 8],
  );

  const didDrag = useRef(false);
  const surface = useRef<HTMLDivElement>(null);

  const isPresent = useIsPresent();

  /* Behind the whole deck: set at the turnaround, while the card is off-screen. */
  const [behind, setBehind] = useState(false);

  /*
   * AnimatePresence renders the entering card after this one, so an equal
   * z-index would already hide the throw behind the new card on release. The
   * card being thrown is lifted above the deck until it turns around.
   */
  const zIndex = isPresent ? 10 : behind ? -1 : 20;

  /*
   * The card keeps the offset the drag gave it while it is thrown, then eases
   * back to centre so it lands square on the bottom of the deck.
   */
  useEffect(() => {
    if (isPresent) return;

    const controls = animate(x, 0, {
      duration: RETURN_DURATION,
      ease: EASE_RETURN,
    });

    /*
     * The card only drops behind the stack once it has turned around — flipping
     * it on release would make it vanish under the deck on the way out.
     */
    const turnaround = window.setTimeout(
      () => setBehind(true),
      throwDuration(motionRef.current.velocity) * 1000,
    );

    return () => {
      controls.stop();
      window.clearTimeout(turnaround);
    };
  }, [isPresent, motionRef, x]);

  /*
   * Motion only fires this once its own drag threshold is crossed, so any call
   * at all means the pointer moved: no distance check of our own to get wrong.
   */
  function handleDrag() {
    didDrag.current = true;
  }

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: {
      offset: { x: number; y: number };
      velocity: { x: number; y: number };
    },
  ) {
    const width = surface.current?.offsetWidth ?? 0;

    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    /*
     * A quarter of the card, not a fixed 100px: the card is 100dvw on a phone
     * and 50dvw on a desktop, and a flick should be enough in both.
     */
    const distanceReached =
      width > 0 && Math.abs(offsetX) >= width * DRAG_RATIO;

    const velocityReached = Math.abs(velocityX) >= VELOCITY_THRESHOLD;

    if (distanceReached || velocityReached) {
      /*
       * A pointer release also fires a click on this card. Without this the
       * click would advance the deck a second time and skip the card the drag
       * was revealing.
       */
      didDrag.current = true;

      /* Either direction discards the card; it just leaves the way it was thrown. */
      const thrownRight = (offsetX !== 0 ? offsetX : velocityX) > 0;

      onNext(
        thrownRight ? 1 : -1,
        /* px/s → % of card width per second, the unit the exit animates in. */
        width > 0 ? (velocityX / width) * 100 : 0,
        false,
        /* The next card is already uncovered: it must not fade its face in. */
        true,
      );
    }
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    /* A card on its way out is a spectator; it must not navigate again. */
    if (!isPresent) return;

    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const clickedRight = event.clientX - rect.left > rect.width / 2;

    /*
     * Both halves go deeper into the deck; the side only decides which way the
     * card is thrown, so a tap leaves from under the finger like a drag would.
     */
    onNext(clickedRight ? 1 : -1);
  }

  /* The top card lands after the whole stack underneath it. */
  const dealIn = reduce ? FADE : dealTransition(BOTTOM_DEPTH * DEAL_STAGGER);

  return (
    <motion.div
      className="absolute inset-0"
      /* A card on its way out is a spectator here too: it keeps animating but
         drops out of the tab order so focus never lands on a leaving card. */
      inert={!isPresent || undefined}
      style={{ zIndex }}
      custom={motionContext}
      variants={cardVariants}
      initial={
        deal
          ? reduce
            ? { opacity: 0 }
            : { opacity: 0, scale: 1, ...DEAL_ORIGIN }
          : 'enter'
      }
      animate={
        deal
          ? {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              transition: dealIn,
            }
          : 'center'
      }
      exit="exit"
    >
      <motion.div
        ref={surface}
        className="@container size-full cursor-grab overflow-hidden rounded-3xl bg-white select-none active:cursor-grabbing sm:rounded-4xl ring ring-inset ring-neutral-300"
        style={{
          x,
          rotate,
          touchAction: 'pan-y',
        }}
        drag={isPresent ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragMomentum={false}
        onDragStart={() => {
          didDrag.current = false;
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
      >
        <CardContent
          card={card}
          dealing={!dealt}
          revealed={motionContext.dragged}
        />
      </motion.div>
    </motion.div>
  );
}

function cardLabel(card: DeckCard) {
  if (card.kind === 'cover') {
    return 'Click or drag to start.';
  }

  return `${card.strategy.category}. ${card.strategy.prompt}.`;
}

/* Where a shared card sends people: the deck itself, ready to be drawn. */
const DECK_URL = 'https://molina.digital/unblock';

/*
 * The prompt is the whole point, so it leads and it is quoted: a question in
 * quotation marks reads as a card someone drew, where "Category: prompt" reads
 * as a database row. The category follows as the smaller line that frames it.
 */
function strategyQuote({ category, prompt }: CreativeStrategy) {
  return `“${prompt}”\n\n${category}`;
}

/*
 * X appends `url` under `text`, so the last line of the text is written to run
 * straight into the link and give the reader something to do with it.
 */
function shareOnXHref(strategy: CreativeStrategy) {
  const text = `${strategyQuote(strategy)}\n\n— \n\nDraw your own:`;

  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(DECK_URL)}`;
}

async function copyToClipboard(
  e: React.MouseEvent<HTMLButtonElement>,
  text: string,
) {
  e.stopPropagation();
  e.preventDefault();
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Strategy copied to clipboard');
  } catch (error) {
    console.error(error);
    toast.error('Failed to copy strategy to clipboard');
  }
}

/*
 * `dealing` covers the opening hand, while the cover card still sits on top:
 * the strategy underneath reads as backdrop, so its text and actions sit back
 * at a lower opacity until the first card is thrown.
 *
 * `revealed` means the drag already showed this face before the card was
 * promoted. Its text is on screen and being read, so it starts where it
 * already is instead of blurring back in.
 */
function CardContent({
  card,
  dealing,
  revealed,
}: {
  card: DeckCard;
  dealing?: boolean;
  revealed?: boolean;
}) {
  if (card.kind === 'cover') {
    return (
      <div className="relative size-full">
        {/*
         * The cover is an element handed over from the page, so it gets a
         * wrapper of its own: as one of two siblings it would sit in a children
         * array, and React cannot key an element it did not create.
         */}
        <div className="absolute inset-0">{card.content}</div>

        {/*
         * Sits over the cover as a hint, never in the way: the card underneath
         * owns every pointer event.
         */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-[3cqw] text-black/70">
          <HandPointing className="h-[7cqw] max-h-14 min-h-8 w-auto origin-[50%_65%] animate-hand-click" />

          <p className="text-[clamp(0.625rem,1.6cqw,0.875rem)] font-bold tracking-[0.2em] uppercase">
            Click or drag to start
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center p-[9cqw] @2xl:p-[8cqw] ring ring-inset ring-neutral-300">
      <div>
        <motion.span
          initial={revealed ? false : { opacity: 0, filter: 'blur(4px)', y: 8 }}
          animate={{
            opacity: dealing ? 0 : 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { delay: 0.1 },
          }}
          exit={{ opacity: 0.5, filter: 'blur(4px)', y: 8 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="block text-left mb-[2cqw] text-[clamp(0.625rem,1.6cqw,0.875rem)] font-medium tracking-[0.2em] text-black/40 uppercase"
        >
          {card.strategy.category}
        </motion.span>

        <motion.p
          initial={revealed ? false : { opacity: 0, filter: 'blur(2px)', y: 8 }}
          animate={{
            opacity: dealing ? 0 : 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { delay: 0.1 },
          }}
          exit={{ opacity: 0.5, filter: 'blur(2px)', y: 8 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="text-balance text-[clamp(2rem,9cqw,7rem)] leading-[1.05] font-medium tracking-tight text-black md:tracking-tighter"
        >
          {card.strategy.prompt}
        </motion.p>
        <motion.div
          initial={
            revealed ? false : { opacity: 0, filter: 'blur(4px)', scale: 0.85 }
          }
          animate={{
            opacity: dealing ? 0 : 1,
            filter: 'blur(0px)',
            scale: 1,
            transition: { delay: 0.2 },
          }}
          exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.85 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="absolute bottom-8 right-8 flex items-center gap-1 text-neutral-400"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={shareOnXHref(card.strategy)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
                className="p-1 transition-colors hover:text-neutral-600 underline underline-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Share aria-hidden className="size-6 shrink-0" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on X</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Copy to clipboard"
                className="p-1 cursor-pointer transition-colors hover:text-neutral-600 underline underline-offset-2"
                onClick={(e) =>
                  copyToClipboard(e, strategyQuote(card.strategy))
                }
              >
                <Copy aria-hidden className="size-6 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>
    </div>
  );
}

export type CursorVariant = 'default' | 'adapt' | 'hidden';

export interface CursorTarget {
  variant: CursorVariant;
  element: HTMLElement | null;
}

export function getCursorTarget(target: EventTarget | null): CursorTarget {
  if (!(target instanceof Element)) {
    return {
      variant: 'default',
      element: null,
    };
  }

  const element = target.closest<HTMLElement>('[data-cursor]');

  if (!element) {
    return {
      variant: 'default',
      element: null,
    };
  }

  const variant = element.dataset.cursor;

  if (variant === 'adapt' || variant === 'hidden') {
    return {
      variant,
      element,
    };
  }

  return {
    variant: 'default',
    element: null,
  };
}

import { useEffect, type ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Drawer } from 'vaul';

import { ActionButton } from './controls';

/*
 * The settings on small screens: a bottom sheet over the lower part of the
 * screen, with the poster docked in the space above it (see DOCK_HEIGHT in
 * the page), so every change is visible as it is made.
 *
 * Not modal: the poster stays live while the sheet is open, so there is no
 * overlay and nothing outside it is blocked. Only the handle drags, because
 * the sheet is full of sliders and text fields that need their own gestures.
 */
export function SettingsDrawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  /* The dialog underneath sometimes leaves `pointer-events: none` on the
   * body even though the sheet isn't modal, which would freeze the poster
   * and the rest of the page. Undo it whenever it appears. */
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const release = () => {
      if (body.style.pointerEvents === 'none') body.style.pointerEvents = '';
    };
    release();
    const observer = new MutationObserver(release);
    observer.observe(body, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
      handleOnly
    >
      {!open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Drawer.Trigger asChild>
            <ActionButton className="pointer-events-auto h-11 w-full max-w-sm border border-border shadow-lg">
              <SlidersHorizontal aria-hidden />
              Settings and export
            </ActionButton>
          </Drawer.Trigger>
        </div>
      )}
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0.5 bottom-0 z-50 flex h-[55dvh] flex-col rounded-t-2xl border border-border bg-background outline-none"
        >
          <Drawer.Handle className="mt-3 shrink-0" />
          <div className="flex shrink-0 items-center justify-between py-2 pr-2 pl-4">
            <Drawer.Title className="text-sm font-medium">
              Settings
            </Drawer.Title>
            <Drawer.Close asChild>
              <ActionButton className="bg-transparent text-muted-foreground">
                Done
              </ActionButton>
            </Drawer.Close>
          </div>
          <div
            data-settings-scroll
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

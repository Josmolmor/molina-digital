import { cn } from '@/lib/utils';

export const Separator = ({ className }: { className?: string }) => {
  return (
    <hr
      className={cn(
        'w-13 h-px text-foreground/20 dark:text-foreground/40 rounded',
        className,
      )}
    />
  );
};

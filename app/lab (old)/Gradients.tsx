const sizeBadge = (size: number, className: string) => {
  return (
    <span
      className={`absolute bottom-4 left-4 border border-border/10 backdrop-blur bg-white/20 dark:bg-black/20 rounded-lg px-2 py-1 text-xs ${className}`}
    >
      {size}kb
    </span>
  );
};

export const Gradients = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-96 w-full relative">
        <img
          src="/assets/images/backgrounds/light-gradient.jpg"
          alt="Light gradient 1"
          className="w-full h-full object-cover rounded-lg dark:hidden select-none"
        />
        <img
          src="/assets/images/backgrounds/dark.jpg"
          alt="Dark gradient 1"
          className="w-full h-full object-cover rounded-lg hidden dark:block select-none"
        />
        {sizeBadge(249, 'dark:hidden')}
        {sizeBadge(657, 'hidden dark:block text-white')}
      </div>
      <div className="h-96 w-full relative">
        <img
          src="/assets/images/backgrounds/light-gradient-small.jpg"
          alt="Light gradient 2"
          className="w-full h-full object-cover rounded-lg dark:hidden select-none"
        />
        {sizeBadge(77, 'dark:hidden')}
        {sizeBadge(38.4, 'hidden dark:block text-white')}
        <img
          src="/assets/images/backgrounds/dark-small.jpg"
          alt="Dark gradient 2"
          className="w-full h-full object-cover rounded-lg hidden dark:block select-none"
        />
      </div>
    </div>
  );
};

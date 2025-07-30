'use client';

import clsx from 'clsx';
import { useRef, useState, useEffect } from 'react';

const verticalTextStyleObject = {
  writingMode: 'vertical-rl' as const,
  transform: 'rotate(180deg)' as const,
};

const champions = [
  {
    src: '/assets/images/carousel/1.jpeg',
    title: 'Talon',
    role: 'Assassin',
  },
  {
    src: '/assets/images/carousel/2.jpeg',
    title: 'Akali',
    role: 'Assassin',
  },
  {
    src: '/assets/images/carousel/3.jpeg',
    title: 'Singed',
    role: 'Tank',
  },
  {
    src: '/assets/images/carousel/4.jpeg',
    title: 'Ezreal',
    role: 'Marksman',
  },
  {
    src: '/assets/images/carousel/5.jpeg',
    title: 'Soraka',
    role: 'Support',
  },
  {
    src: '/assets/images/carousel/6.jpeg',
    title: 'Xerath',
    role: 'Mage',
  },
  {
    src: '/assets/images/carousel/7.jpeg',
    title: 'Rengar',
    role: 'Assassin',
  },
  {
    src: '/assets/images/carousel/8.jpeg',
    title: 'Veigar',
    role: 'Mage',
  },
  {
    src: '/assets/images/carousel/9.jpeg',
    title: 'Ahri',
    role: 'Assassin',
  },
  {
    src: '/assets/images/carousel/10.jpeg',
    title: 'Zilean',
    role: 'Support',
  },
  {
    src: '/assets/images/carousel/11.jpeg',
    title: 'Fiora',
    role: 'Bruiser',
  },
  {
    src: '/assets/images/carousel/12.jpeg',
    title: 'Wukong',
    role: 'Bruiser',
  },
  {
    src: '/assets/images/carousel/13.jpeg',
    title: 'Quinn',
    role: 'Assassin',
  },
  {
    src: '/assets/images/carousel/14.jpeg',
    title: 'Twitch',
    role: 'Marksman',
  },
  {
    src: '/assets/images/carousel/15.jpeg',
    title: 'Nautilus',
    role: 'Tank',
  },
  {
    src: '/assets/images/carousel/16.jpeg',
    title: "Rek'sai",
    role: 'Bruiser',
  },
  {
    src: '/assets/images/carousel/17.jpeg',
    title: 'Blitzcrank',
    role: 'Support',
  },
  {
    src: '/assets/images/carousel/18.jpeg',
    title: 'Sejuani',
    role: 'Tank',
  },
  {
    src: '/assets/images/carousel/19.jpeg',
    title: 'Anivia',
    role: 'Mage',
  },
  {
    src: '/assets/images/carousel/20.jpeg',
    title: 'Bard',
    role: 'Support',
  },
];

export default function Carousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Scroll to a specific champion
   * @param targetIndex - The index of the champion to scroll to
   * @returns void
   * @description This function scrolls to a specific champion in the carousel.
   * It calculates the target scroll position based on the index of the champion
   * and the total width of the container. It then scrolls to that position
   * using smooth scrolling.
   */
  const scrollToChampion = (targetIndex: number) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    const targetPercentage = targetIndex / (champions.length - 1);
    const targetScrollLeft = maxScroll * targetPercentage;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /**
     * Calculate which image should be active based on scroll percentage
     * @returns void
     * @description This function calculates which image should be active based on the scroll percentage.
     * It then sets the active index to the calculated index.
     */
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const percentage = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      const totalImages = champions.length;
      const activeImageIndex = Math.min(
        Math.max(0, Math.round((percentage / 100) * (totalImages - 1))),
        totalImages - 1,
      );

      setActiveIndex(activeImageIndex);
    };

    container.addEventListener('scroll', handleScroll);

    handleScroll();

    // Add ResizeObserver to recalculate on container size changes
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="shadow-xs h-48 lg:h-120 w-full bg-background rounded-lg flex overflow-x-auto"
      style={{
        scrollBehavior: 'auto', // Remove smooth scroll to avoid conflicts with our animations
        scrollbarWidth: 'none',
      }}
    >
      {champions.map(({ src, title, role }, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={title}
            className={clsx(
              'flex h-full px-2 gap-2 shrink-0 relative text-sm transition-colors',
              index < champions.length - 1
                ? 'border-r border-border/50'
                : 'border-r-0',
              !isActive && 'cursor-pointer hover:bg-border/20',
            )}
            onClick={() => scrollToChampion(index)}
          >
            <div className="flex flex-col justify-between min-w-0 my-4">
              <span
                className={clsx(
                  'transition-opacity uppercase text-xs font-semibold',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                  ...verticalTextStyleObject,
                }}
              >
                {role}
              </span>
              <span
                className={clsx(
                  'transition-colors uppercase text-xs',
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground',
                )}
                style={{
                  ...verticalTextStyleObject,
                }}
              >
                {title}
              </span>
            </div>
            <div
              className={clsx(
                'h-full overflow-hidden py-2',
                isActive ? 'w-24 lg:w-120' : 'w-[0]',
              )}
            >
              <img
                src={src}
                alt={title}
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

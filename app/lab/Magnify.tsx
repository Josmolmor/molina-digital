'use client';

import { useState, useRef, FC, MouseEvent, TouchEvent } from 'react';
import Image from 'next/image'; // Optional: for optimized images in Next.js
import { Slider } from '@/components/ui/slider';

interface MagnifyProps {
  src: string;
  alt: string;
  magnification?: number; // Factor by which the image is magnified
  className?: string; // Optional TailwindCSS classes
}

const Magnify: FC<MagnifyProps> = ({
  src,
  alt,
  magnification = 4,
  className,
}) => {
  const [magnifyFactor, setMagnifyFactor] = useState(magnification);
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const magnifyRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (magnifyRef.current) {
      const { left, top, width, height } =
        magnifyRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100; // Use clientX for viewport-relative position
      const y = ((e.clientY - top) / height) * 100; // Use clientY for viewport-relative position
      setCursorPosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    setIsMagnifying(true);
  };

  const handleMouseLeave = () => {
    setIsMagnifying(false);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent default scrolling behavior
    const touch = e.touches[0]; // Get the first touch point
    if (magnifyRef.current) {
      const { left, top, width, height } =
        magnifyRef.current.getBoundingClientRect();
      const x = ((touch.clientX - left) / width) * 100;
      const y = ((touch.clientY - top) / height) * 100;
      setCursorPosition({ x, y });
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault(); // Prevent default scrolling behavior
    setIsMagnifying(true);
  };

  const handleTouchEnd = () => {
    setIsMagnifying(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Slider
        defaultValue={[magnifyFactor]}
        step={2}
        min={2}
        max={10}
        onValueChange={(val) => setMagnifyFactor(val[0])}
      ></Slider>

      <div
        className={`relative overflow-hidden ${className || ''} h-[400] w-[400] m-auto animate-blur`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={magnifyRef}
        style={{ touchAction: 'none' }} // Prevents touch scrolling
        aria-live="polite"
      >
        <Image
          src={src}
          alt={alt}
          className="w-full h-auto object-cover aspect-square "
          layout="fill"
          priority
        />

        {isMagnifying && (
          <div
            className="absolute inset-0 z-10 pointer-events-none h-[150] w-[150] border border-border rounded-full shadow-md -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${magnifyFactor * 100}%`,
              backgroundPosition: `${cursorPosition.x}% ${cursorPosition.y}%`,
              top: `${cursorPosition.y}%`,
              left: `${cursorPosition.x}%`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Magnify;

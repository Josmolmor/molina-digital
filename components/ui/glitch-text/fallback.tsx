'use client';

import React, { useState, useEffect, useRef } from 'react';

// Simple fallback component that shows the NPM package info
interface GlitchTextProps {
  from: string;
  to: string;
  trigger?: 'hover' | 'click' | 'intersection' | 'manual';
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  effects?: any;
  onProgress?: (progress: number) => void;
  onStart?: () => void;
  onComplete?: () => void;
  [key: string]: any;
}

export default function GlitchText({ 
  from, 
  to, 
  trigger = 'hover',
  className = '',
  ...props 
}: GlitchTextProps) {
  const [text, setText] = useState(from);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsHovered(true);
      setText(to);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsHovered(false);
      setText(from);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setText(text === from ? to : from);
    }
  };

  const eventHandlers = {
    ...(trigger === 'hover' && {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }),
    ...(trigger === 'click' && {
      onClick: handleClick
    })
  };

  return (
    <span 
      className={`inline-block cursor-pointer transition-colors duration-200 ${className}`}
      {...eventHandlers}
      {...props}
    >
      {text}
      {/* Show NPM package info on hover */}
      {isHovered && (
        <span className="text-xs text-muted-foreground ml-2">
          (NPM: glitch-text-effect)
        </span>
      )}
    </span>
  );
}

// Simple fallback hook
export function useGlitchTextFallback(config: any) {
  const [element, setElement] = useState<HTMLElement | null>(null);

  return {
    ref: setElement,
    start: () => console.log('NPM package: glitch-text-effect - start()'),
    stop: () => console.log('NPM package: glitch-text-effect - stop()'),
    reset: () => console.log('NPM package: glitch-text-effect - reset()'),
    isRunning: () => false
  };
}
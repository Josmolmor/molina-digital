'use client';

import { useEffect, useRef } from 'react';

interface PixelBackgroundProps {
  className?: string;
  pixelSize?: number;
  gap?: number;
  radius?: number;
  color?: string;
  baseOpacity?: number;
  hoverOpacity?: number;
  fadeDelay?: number;
  fadeDuration?: number;
}

export function PixelBackground({
  className = '',
  pixelSize = 1,
  gap = 2,
  radius = 400,
  color = 'var(--primary)',
  baseOpacity = 0.025,
  hoverOpacity = 0.1,
  fadeDelay = 500,
  fadeDuration = 600,
}: PixelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef({
    x: -1000,
    y: -1000,
  });

  const targetMouseRef = useRef({
    x: -1000,
    y: -1000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;

    let lastPointerMove = performance.now();
    let activity = 0;

    /*
     * Resolve CSS variables (e.g. var(--primary))
     * into a color that Canvas understands.
     */
    const resolveColor = (value: string) => {
      const element = document.createElement('div');

      element.style.color = value;

      document.body.appendChild(element);

      const resolvedColor = getComputedStyle(element).color;

      element.remove();

      return resolvedColor;
    };

    const resolvedColor = resolveColor(color);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * devicePixelRatio;

      canvas.height = height * devicePixelRatio;

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetMouseRef.current.x = event.clientX;

      targetMouseRef.current.y = event.clientY;

      lastPointerMove = performance.now();
    };

    const handlePointerLeave = () => {
      targetMouseRef.current.x = -1000;
      targetMouseRef.current.y = -1000;

      lastPointerMove = performance.now();
    };

    resize();

    window.addEventListener('resize', resize);

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });

    window.addEventListener('pointerleave', handlePointerLeave);

    const render = () => {
      const now = performance.now();

      const timeSinceMove = now - lastPointerMove;

      /*
       * Keep the mouse reaction at full strength
       * during the delay period, then smoothly fade it.
       */
      if (timeSinceMove <= fadeDelay) {
        activity = 1;
      } else {
        const fadeProgress = Math.min(
          1,
          (timeSinceMove - fadeDelay) / fadeDuration,
        );

        activity = 1 - fadeProgress;
      }

      /*
       * Smooth mouse position.
       */
      const mouse = mouseRef.current;
      const targetMouse = targetMouseRef.current;

      mouse.x += (targetMouse.x - mouse.x) * 0.12;

      mouse.y += (targetMouse.y - mouse.y) * 0.12;

      context.clearRect(0, 0, width, height);

      const step = pixelSize + gap;

      const startX = (width % step) / 2;

      const startY = (height % step) / 2;

      /*
       * Draw pixel grid.
       */
      for (let y = startY; y < height; y += step) {
        for (let x = startX; x < width; x += step) {
          const centerX = x + pixelSize / 2;

          const centerY = y + pixelSize / 2;

          const dx = centerX - mouse.x;

          const dy = centerY - mouse.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          /*
           * 0 outside radius.
           * 1 directly underneath cursor.
           */
          const influence = Math.max(0, 1 - distance / radius);

          /*
           * Smooth radial falloff.
           */
          const easedInfluence = influence * influence;

          /*
           * Mouse interaction fades out after
           * the cursor stops moving.
           */
          const interactiveInfluence = easedInfluence * activity;

          const opacity =
            baseOpacity + interactiveInfluence * (hoverOpacity - baseOpacity);

          /*
           * Pixels subtly grow toward
           * the cursor.
           */
          const scale = 1 + interactiveInfluence * 1.5;

          const size = pixelSize * scale;

          const offset = (pixelSize - size) / 2;

          context.globalAlpha = opacity;

          context.fillStyle = resolvedColor;

          context.fillRect(x + offset, y + offset, size, size);
        }
      }

      context.globalAlpha = 1;

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener('resize', resize);

      window.removeEventListener('pointermove', handlePointerMove);

      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [
    pixelSize,
    gap,
    radius,
    color,
    baseOpacity,
    hoverOpacity,
    fadeDelay,
    fadeDuration,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`
        pointer-events-none
        fixed
        inset-0
        h-full
        w-full
        ${className}
      `}
    />
  );
}

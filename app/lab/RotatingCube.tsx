'use client';

import { useRef, useEffect } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
  MeshBasicMaterial,
  Vector2,
} from 'three';

export default function Component() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    cube: Mesh;
    animationFrameId: number | null;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 1, 1000);
    camera.position.z = 30;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background
    mountRef.current.appendChild(renderer.domElement);

    const cube = new Mesh(
      new BoxGeometry(10, 10, 10),
      new MeshStandardMaterial({ color: 0xffffff }),
    );
    cube.position.y = -5;
    scene.add(cube);

    const createLight = (color: number) => {
      const light = new PointLight(color, 400, 50);
      const sphere = new Mesh(
        new SphereGeometry(0.5, 16, 8),
        new MeshBasicMaterial({ color: color }),
      );
      light.add(sphere);
      scene.add(light);
      return light;
    };

    const light1 = createLight(0xff0040);
    const light2 = createLight(0x0040ff);
    const light3 = createLight(0x80ff80);
    const light4 = createLight(0xffaa00);

    const mouse = new Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const animate = () => {
      const time = Date.now() * 0.0005;

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      cube.rotation.z += 0.01;

      light1.position.x = Math.sin(time * 0.7) * 30;
      light1.position.y = Math.cos(time * 0.5) * 40;
      light1.position.z = Math.cos(time * 0.3) * 30;

      light2.position.x = Math.cos(time * 0.3) * 30;
      light2.position.y = Math.sin(time * 0.5) * 40;
      light2.position.z = Math.sin(time * 0.7) * 30;

      light3.position.x = Math.sin(time * 0.7) * 30;
      light3.position.y = Math.cos(time * 0.3) * 40;
      light3.position.z = Math.sin(time * 0.5) * 30;

      light4.position.x = Math.sin(time * 0.3) * 30;
      light4.position.y = Math.cos(time * 0.7) * 40;
      light4.position.z = Math.sin(time * 0.5) * 30;

      renderer.render(scene, camera);
      sceneRef.current!.animationFrameId = requestAnimationFrame(animate);
    };

    const onMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      isDragging = true;
      updateMousePosition(event);
    };

    const onMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };

        cube.position.x += deltaMove.x * 0.05;
        cube.position.y -= deltaMove.y * 0.05;

        previousMousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      isDragging = false;
    };

    const updateMousePosition = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      isDragging = true;
      updateTouchPosition(event);
    };

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (isDragging && event.touches.length === 1) {
        const touch = event.touches[0];
        const deltaMove = {
          x: touch.clientX - previousMousePosition.x,
          y: touch.clientY - previousMousePosition.y,
        };

        cube.position.x += deltaMove.x * 0.05;
        cube.position.y -= deltaMove.y * 0.05;

        previousMousePosition = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      isDragging = false;
    };

    const updateTouchPosition = (event: TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const touch = event.touches[0];
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      previousMousePosition = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('touchstart', onTouchStart, false);
    renderer.domElement.addEventListener('touchmove', onTouchMove, false);
    renderer.domElement.addEventListener('touchend', onTouchEnd, false);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      cube,
      animationFrameId: null,
    };
    animate();

    return () => {
      const currentScene = sceneRef.current;
      if (currentScene) {
        // Cancel the animation frame if it exists.
        if (currentScene.animationFrameId !== null) {
          cancelAnimationFrame(currentScene.animationFrameId);
        }
        currentScene.renderer.dispose();
        currentScene.renderer.forceContextLoss();
        currentScene.renderer.domElement.remove();
        sceneRef.current = null;
      }

      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }

      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return <div ref={mountRef} className="h-75 w-full" />;
}

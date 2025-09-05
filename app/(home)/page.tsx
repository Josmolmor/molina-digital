'use client';

import Timeline from '@/app/(home)/experience/timeline';
import Image from 'next/image';
import { GeistMono } from 'geist/font/mono';
import { GlitchText } from 'glitch-text-effect/react';

const Home = () => {
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative avatar-container">
            <div className="h-16 w-16 rounded-full bg-linear-to-r from-yellow-500 from-10% via-orange-500 via-50% to-rose-500 to-90% dark:from-indigo-500 dark:via-sky-500 dark:to-emerald-500 transition-transform duration-500 ease-in-out avatar-bg hover:rotate-720"></div>
            <Image
              src="/me.jpg"
              alt="Your Name"
              className="rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              width={62}
              height={62}
            />
          </div>
          <div className="flex flex-col">
            <span className={`${GeistMono.className} font-medium text-lg`}>
              JM Molina
            </span>
            <GlitchText
              from="Software Engineer"
              to="Design Engineer"
              className="text-muted-foreground"
              duration={2000}
            />
          </div>
        </div>
        <p className="flex flex-col gap-2">
          <span>Squinting at a screen to count pixels for a living.</span>
          <span>
            As a software engineer specializing in front-end web development, I
            create accessible, intuitive, and responsive user interfaces that
            blend clean, modern design with cutting-edge technologies.
          </span>
          <span>
            My keen interest in working with global platforms allows me to apply
            my skills to projects that reach a diverse, worldwide audience.
          </span>
          <span>
            While my experience spans the full stack, my passion for design
            drives me to excel in front-end performance optimization, enhancing
            user experience through fast load times and seamless interactions.
            With a meticulous eye for detail, I strive to deliver projects that
            are not only highly functional but beautifully crafted.
          </span>
          <span>
            Outside of work, I enjoy spending time with my girlfriend and our
            playful Pomeranian, Balú.
          </span>
        </p>
      </div>
      <Timeline />
    </>
  );
};

export default Home;

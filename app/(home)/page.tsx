'use client';

import Timeline from '@/app/(home)/experience/timeline';
import Image from 'next/image';
import { GeistMono } from 'geist/font/mono';
import { GlitchText } from 'glitch-text-effect/react';
import { motion } from 'motion/react';

const Home = () => {
  return (
    <>
      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0.5, filter: 'blur(2px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.125, ease: 'easeOut' }}
      >
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
            <span className={`${GeistMono.className} font-semibold text-lg`}>
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
          <span>Squinting at a screen counting pixels for a living.</span>
          <span>
            I&apos;m a front-end developer with full-stack experience,
            passionate about building digital experiences that feel effortless
            and look beautiful. Every day, since more than&nbsp;
            {new Date().getFullYear() - (2016 + 1)}&nbsp;years ago, I strive to
            shape global platforms and products that don&apos;t just work, they
            delight. My focus is on details that make a difference: interfaces
            that guide instead of confuse, experiences that simplify life, and
            products that leave a mark. I want the work I do to be recognized
            not just for its function, but for the craft and care behind it.
          </span>
        </p>
      </motion.div>
      <Timeline />
    </>
  );
};

export default Home;

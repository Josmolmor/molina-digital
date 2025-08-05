'use client';

import { FlaskRound } from 'lucide-react';
import Carousel from './Carousel';
import { ExperimentCard } from './ExperimentCard';
import Magnify from './Magnify';
import ThreeDCube from './RotatingCube';
import ExpandableCard from './ExpandableCard';
import { AutoSubmitInput } from './AutoSubmitInput';
import { useState, useEffect } from 'react';

const MagnifyWrapper = () => {
  const [imageSrc, setImageSrc] = useState('/assets/images/magnify/1.png');

  useEffect(() => {
    const randomNum = Math.floor(Math.random() * (22 - 1 + 1) + 1);
    setImageSrc(`/assets/images/magnify/${randomNum}.png`);
  }, []);

  return <Magnify src={imageSrc} alt="" />;
};

// This would typically come from a database or API
const experiments = [
  {
    id: 1,
    title: 'Image magnifier',
    description:
      'A simple image magnifier. Slide values are x2, x4, x6, and x8.',
    date: '2024-10-20',
    tags: ['react', 'shadcn', 'tailwindcss'],
    component: <MagnifyWrapper />,
  },
  {
    id: 2,
    title: 'All of the lights',
    description:
      'A rotating cube with colored lights orbiting around it, continuously changing positions and illuminating the scene dynamically using threeJS. Try moving the cube around',
    date: '2024-10-22',
    tags: ['react', 'threeJS', 'tailwindcss'],
    component: <ThreeDCube />,
  },
  {
    id: 3,
    title: 'Horizontal scroll showcase',
    description: `A fancy (and accessible) component using champions' splash art from League of Legends. Inspired by https://x.com/madewithgsap/status/1940757486514102726 All rights reserved to Riot Games.`,
    date: '2025-07-30',
    tags: ['react', 'tailwindcss'],
    component: <Carousel />,
  },
  {
    id: 4,
    title: 'Expandable UI card element',
    description:
      'A simple actionable card element that can be expanded and collapsed. Try pressing the button multiple times to see both the success and failure states.',
    date: '2025-08-02',
    tags: ['react', 'typescript', 'tailwindcss'],
    component: <ExpandableCard />,
  },
  {
    id: 5,
    title: 'OTP input',
    description:
      'A simple input handler that submits when the user finishes typing. Small UX allows the user to type the code in a more natural way by moving the cursor to the next or previous input field by just typing a value or pressing the backspace/delete key. User is also able to paste the whole code at once as long as the code has the amount of characters equal to the amount of input fields.',
    date: '2025-08-04',
    tags: ['react', 'typescript', 'tailwindcss', 'motion'],
    component: <AutoSubmitInput />,
  },
];

export default function LabPage() {
  return (
    <div className="mx-auto tracking-normal">
      <div className="relative group flex justify-center items-center mb-6 w-fit mx-auto gap-2">
        <h1 className="text-4xl font-bold text-center flex items-center justify-center gap-2">
          The Lab
        </h1>
        <FlaskRound className="group-hover:animate-swirl transition-all size-8 text-primary rotate-20" />
      </div>
      <p className="mb-8 text-pretty text-center sm:text-left">
        Welcome to my digital laboratory. Here, you'll find a collection of
        UI/UX experiments and component designs I've worked on. Each entry
        represents a journey into new ideas and technologies.
      </p>
      <div className="grid grid-cols-1 gap-8">
        {experiments
          .sort((a, b) => b.id - a.id)
          .map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
            ></ExperimentCard>
          ))}
      </div>
    </div>
  );
}

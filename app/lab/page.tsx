'use client';

import { ArrowRight, FlaskRound } from 'lucide-react';
import Carousel from './Carousel';
import { ExperimentCard } from './ExperimentCard';
import Magnify from './Magnify';
import ThreeDCube from './RotatingCube';
import ExpandableCard from './ExpandableCard';
import { AutoSubmitInput } from './AutoSubmitInput';
import GlitchTextDemo from './GlitchTextDemo';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

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
    title: 'ThreeJS cube test',
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
  {
    id: 6,
    title: 'Glitch Text Effect Library',
    description:
      'A lightweight, customizable glitch text effect library with zero dependencies. Features multiple trigger types (hover, click, intersection, manual), configurable intensity levels, character sets, visual effects, and full TypeScript support.',
    date: '2025-08-06',
    tags: ['react', 'typescript', 'vanilla-js', 'library', 'npm'],
    component: <GlitchTextDemo />,
  },
];

type ViewState = 'list' | 'experiment';

interface Experiment {
  id: number;
  title: string;
  description: string;
  date: string;
  tags: string[];
  component: React.ReactNode;
}

export default function LabPage() {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedExperiment, setSelectedExperiment] =
    useState<Experiment | null>(null);

  const handleExperimentClick = (e: React.MouseEvent, experimentId: number) => {
    e.preventDefault();
    const experiment = experiments.find((exp) => exp.id === experimentId);

    if (!experiment) return;

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      console.log('View Transitions API not supported, falling back');
      // Fallback for unsupported browsers
      setSelectedExperiment(experiment);
      setViewState('experiment');
      return;
    }

    // Start the view transition
    document.startViewTransition(() => {
      setSelectedExperiment(experiment);
      setViewState('experiment');
    });
  };

  const handleBackClick = () => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      console.log('View Transitions API not supported for back navigation');
      // Fallback for unsupported browsers
      setViewState('list');
      setSelectedExperiment(null);
      return;
    }

    // Start the view transition
    document.startViewTransition(() => {
      setViewState('list');
      setSelectedExperiment(null);
    });
  };

  return (
    <div
      className="mx-auto tracking-normal max-w-4xl w-full"
      style={{ viewTransitionName: 'lab-content' }}
    >
      {viewState === 'list' ? (
        <>
          {/* List View */}
          <div className="relative group flex justify-center items-center mb-6 w-fit mx-auto gap-2">
            <h1 className="text-4xl font-bold text-center flex items-center justify-center gap-2">
              The Lab
            </h1>
            <FlaskRound className="group-hover:animate-swirl transition-all size-8 text-primary rotate-20" />
          </div>
          <p className="mb-8 text-pretty text-center sm:text-left">
            Dive into my sandbox of UI/UX experiments, where I tinker with CSS,
            micro-interactions, and components. From clever designs to quirky,
            just-for-fun trials, each project is a playful exploration of
            what&apos;s possible, built to learn, practice, and inspire.
          </p>
          <ul className="flex flex-col gap-4 mb-8 text-sm">
            {experiments
              .sort((a, b) => b.id - a.id)
              .map(({ id, title, description }) => (
                <li key={id} className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleExperimentClick(e, id)}
                    className="flex gap-2 group font-medium items-start"
                  >
                    <ArrowRight className="size-4 group-hover:translate-x-[10%] transition-all shrink-0 mt-1" />
                    <p className="flex flex-col gap-1 items-start text-left">
                      <span className="highlight-text py-[2px] px-[6px] group-hover:text-background group-active:text-background transition-all">
                        {title}
                      </span>
                      <span className="break-all text-xs text-muted-foreground pl-1.5">
                        {description}
                      </span>
                    </p>
                  </button>
                </li>
              ))}
          </ul>
        </>
      ) : (
        <>
          {/* Individual Experiment View */}
          {selectedExperiment && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-sm font-medium group"
                >
                  <ArrowLeft className="size-4 group-hover:translate-x-[-10%] transition-all" />
                  <span className="highlight-text-reversed py-[2px] px-[6px] group-hover:text-background group-active:text-background transition-all">
                    Back to experiments
                  </span>
                </button>
              </div>
              <div>
                <ExperimentCard experiment={selectedExperiment} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

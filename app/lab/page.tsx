import Carousel from './Carousel';
import { ExperimentCard } from './ExperimentCard';
import Magnify from './Magnify';
import ThreeDCube from './RotatingCube';

// This would typically come from a database or API
const experiments = [
  {
    id: 1,
    title: 'Image magnifier',
    description:
      'A simple image magnifier. Slide values are x2, x4, x6, and x8.',
    date: '2024-10-20',
    tags: ['react', 'shadcn', 'tailwindcss'],
    component: (
      <Magnify
        src={`/assets/images/magnify/${Math.floor(Math.random() * (22 - 1 + 1) + 1)}.png`}
        alt=""
      />
    ),
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
    title: 'Carousel',
    description: `A fancy while accessible carousel component using champions' splash art from League of Legends. Inspired by https://x.com/madewithgsap/status/1940757486514102726 All rights reserved to Riot Games.`,
    date: '2025-07-30',
    tags: ['react', 'tailwindcss'],
    component: <Carousel />,
  },
];

export default function LabPage() {
  return (
    <div className="mx-auto">
      <h1 className="text-4xl font-bold mb-6">The Lab</h1>
      <p className="mb-8">
        Welcome to my digital laboratory. Here, you'll find a collection of
        UI/UX experiments and component designs I've worked on. Each entry
        represents a journey into new ideas and technologies.
      </p>
      <div className="grid grid-cols-1 gap-8">
        {experiments.reverse().map((experiment) => (
          <ExperimentCard
            key={experiment.id}
            experiment={experiment}
          ></ExperimentCard>
        ))}
      </div>
    </div>
  );
}

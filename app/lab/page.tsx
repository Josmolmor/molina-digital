import { ExperimentCard } from './ExperimentCard';
import Image from 'next/image';
import Magnify from './Magnify';

// This would typically come from a database or API
const experiments = [
  {
    id: 1,
    title: 'Image magnifier',
    description:
      'A simple image magnifier. Should work on both web and mobile.',
    date: '2024-10-22',
    tags: ['react', 'shadcn', 'tailwindcss'],
  },
];

export default function LabPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">The Lab</h1>
      <p className="mb-8">
        Welcome to my digital laboratory. Here, you'll find a collection of
        UI/UX experiments and component designs I've worked on. Each entry
        represents a journey into new ideas and technologies.
      </p>
      <div className="grid grid-cols-1 gap-8">
        {experiments.map((experiment) => (
          <ExperimentCard key={experiment.id} experiment={experiment}>
            <Magnify src="/assets/images/07.png" alt="" />
          </ExperimentCard>
        ))}
      </div>
    </div>
  );
}

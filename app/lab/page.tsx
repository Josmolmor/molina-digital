import { ExperimentCard } from './ExperimentCard';

// This would typically come from a database or API
const experiments = [
  {
    id: 1,
    title: 'Text selection',
    description:
      'A simple text selection component that triggers a popover with some interactions.',
    date: '2024-10-22',
    tags: ['react', 'tailwindcss', 'framer motion'],
    component: <h1>Hello</h1>,
  },
];

export default function LabPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">The Lab</h1>
      <p className="text-lg mb-12">
        Welcome to my digital laboratory. Here, you'll find a collection of
        UI/UX experiments and component designs I've worked on. Each entry
        represents a journey into new ideas and technologies.
      </p>
      <div className="grid grid-cols-1 gap-8">
        {experiments.map((experiment) => (
          <ExperimentCard key={experiment.id} experiment={experiment} />
        ))}
      </div>
    </div>
  );
}

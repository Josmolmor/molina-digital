import { ExperimentCard } from './ExperimentCard';

// This would typically come from a database or API
const experiments = [
  {
    id: 1,
    title: '3D Parallax Effect',
    description: 'A depth-based parallax scrolling effect using Three.js',
    date: '2023-10-15',
    tags: ['Three.js', 'WebGL', 'Animation'],
  },
  {
    id: 2,
    title: 'Neumorphic UI Kit',
    description:
      'A collection of neumorphic design components built with React',
    date: '2023-09-22',
    tags: ['React', 'CSS', 'UI Design'],
  },
  {
    id: 3,
    title: 'Voice-Controlled UI',
    description: 'Experimental interface navigable through voice commands',
    date: '2023-08-07',
    tags: ['Web Speech API', 'Accessibility', 'JavaScript'],
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

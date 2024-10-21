import Image from 'next/image';
import Link from 'next/link';
import { Github, Hash } from 'lucide-react';
import SideProjectsHeading from './side-projects-heading';
import GithubIcon from '@/components/icons/GithubIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const projects = [
  {
    name: 'quizling',
    image: '/quizling-meta-img.jpg',
    description:
      'Trivia like app using open trivia database API with leaderboard and user analytics.',
    to: 'http://quizling.vercel.app/',
  },
  {
    name: 'cooba',
    image: '/cooba-meta-img.jpg',
    description: 'An easy way to split event expenses.',
    to: 'https://cooba-six.vercel.app/',
  },
];

export default function SideProjects() {
  return (
    <div className="container mx-auto animate-fade-in">
      <SideProjectsHeading />
      <p className="mb-2">
        Often built using release candidate or canary versions of major
        frameworks and new trendy libraries as part of my exploration of new
        technologies. Sometimes, it's simply coding for the fun of it. These
        projects showcase my passion for experimenting with new ideas, refining
        product designs, and enhancing UX.
      </p>
      <p className="mb-4">Check out some of my recent work:</p>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.name}
            className="flex flex-col gap-3 relative bg-background"
          >
            <Link
              href={project.to}
              target="_blank"
              className="group flex flex-col gap-3 rounded-lg overflow-hidden p-2"
            >
              <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
                <Image
                  src={project.image}
                  alt={project.name}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="object-cover group-hover:scale-105 transform transition-transform duration-300 h-auto w-full"
                />
              </div>
              <span className="text-lg font-semibold">{project.name}</span>
              <p className="text-sm text-muted-foreground group-hover:underline">
                {project.description}
              </p>
            </Link>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`https://github.com/Josmolmor/${project.name}`}
                  target="_blank"
                  className="absolute right-2 top-2 z-50 flex items-center gap-2 bg-background hover:bg-primary p-2 rounded-bl-lg rounded-tr-lg transition-colors w-fit"
                >
                  <GithubIcon className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Check out the code on Github</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}

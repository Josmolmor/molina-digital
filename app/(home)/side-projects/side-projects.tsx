import Image from 'next/image';
import Link from 'next/link';
import GithubIcon from '@/components/icons/GithubIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SectionHeading from '../section-heading';

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
      <SectionHeading title="Side Projects" />
      <p className="mb-2">
        Often built using release candidate or canary versions of major
        frameworks and new trendy libraries as part of my exploration of new
        technologies. Sometimes, it&apos;s simply coding for the fun of it. These
        projects showcase my passion for experimenting with new ideas, refining
        product designs, and enhancing UX.
      </p>
      <p className="mb-4 flex gap-1 flex-wrap items-baseline">
        Check out some of my recent work below and visit{' '}
        <Link
          href="/lab"
          className="contents text-primary w-fit font-semibold hover:underline group"
        >
          the lab
        </Link>
      </p>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {projects.map((project) => (
          <Card className="relative" key={project.name}>
            <Link
              aria-label={`Go to the deployed live site for ${project.name}'s project. The URL is ${project.to}`}
              href={project.to}
              target="_blank"
              className="group flex flex-col rounded-lg overflow-hidden p-2 h-full"
            >
              <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
                <Image
                  src={project.image}
                  alt={project.name}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="aspect-video object-cover group-hover:scale-105 transform transition-transform duration-300 h-auto w-full invert dark:invert-0"
                />
              </div>
              <CardHeader className="pt-4 px-2 pb-0">
                <CardTitle className="text-lg font-semibold">
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <p className="text-sm text-muted-foreground group-hover:underline">
                  {project.description}
                </p>
              </CardContent>
            </Link>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  aria-label={`Go to the ${project.name}'s github repository`}
                  href={`https://github.com/Josmolmor/${project.name}`}
                  target="_blank"
                  className="absolute right-2 top-2 z-50 flex items-center gap-2 bg-card hover:bg-border p-2 rounded-bl-lg rounded-tr-lg transition-colors w-fit"
                >
                  <GithubIcon className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Check out the code on Github</p>
              </TooltipContent>
            </Tooltip>
          </Card>
        ))}
      </div>
    </div>
  );
}

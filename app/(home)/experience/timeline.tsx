import { CalendarDays, MapPin, ArrowUpRight, Hash } from 'lucide-react';
import timelineItems, { StackItem } from '@/data/timeline';
import AngularIcon from '@/components/icons/AngularIcon';
import ApolloIcon from '@/components/icons/ApolloIcon';
import CircleCIIcon from '@/components/icons/CircleIcon';
import CypressIcon from '@/components/icons/CypressIcon';
import DotnetIcon from '@/components/icons/DotnetIcon';
import ExtensionIcon from '@/components/icons/ExtensionIcon';
import GraphqlIcon from '@/components/icons/GraphqlIcon';
import JestIcon from '@/components/icons/JestIcon';
import LanguageIcon from '@/components/icons/LanguageIcon';
import MdxIcon from '@/components/icons/MdxIcon';
import NextjsIcon from '@/components/icons/NextjsIcon';
import PhpIcon from '@/components/icons/PhpIcon';
import PreactIcon from '@/components/icons/PreactIcon';
import ReactIcon from '@/components/icons/ReactIcon';
import SassIcon from '@/components/icons/SassIcon';
import SharepointIcon from '@/components/icons/SharepointIcon';
import SharpIcon from '@/components/icons/SharpIcon';
import SqlIcon from '@/components/icons/SqlIcon';
import StrapiIcon from '@/components/icons/StrapiIcon';
import StyledComponentsIcon from '@/components/icons/StyledcomponentsIcon';
import TypescriptIcon from '@/components/icons/TypescriptIcon';
import ViteIcon from '@/components/icons/ViteIcon';
import VueIcon from '@/components/icons/VueIcon';
import WebpackIcon from '@/components/icons/WebpackIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import SectionHeading from '../section-heading';

const parseStackName = (stack: string): string => {
  switch (stack) {
    case 'extension':
      return 'Browser extensions';
    case 'circle':
      return 'CircleCI';
    case 'nextjs':
      return 'NextJS';
    case 'graphql':
      return 'GraphQL';
    case 'styledcomponents':
      return 'Styled components';
    case 'mdx':
      return 'MDX';
    case 'sharp':
      return 'C#';
    case 'dotnet':
      return '.Net';
    case 'php':
      return 'PHP';
    case 'sql':
      return 'SQL';
    case 'language':
      return 'Internationalization/Localization';
    default:
      return stack.charAt(0).toUpperCase() + stack.slice(1);
  }
};

export function renderIcon(stackName: StackItem) {
  switch (stackName) {
    case 'react':
      return <ReactIcon />;
    case 'preact':
      return <PreactIcon />;
    case 'typescript':
      return <TypescriptIcon />;
    case 'vue':
      return <VueIcon />;
    case 'angular':
      return <AngularIcon />;
    case 'webpack':
      return <WebpackIcon />;
    case 'vite':
      return <ViteIcon />;
    case 'extension':
      return <ExtensionIcon />;
    case 'sass':
      return <SassIcon />;
    case 'jest':
      return <JestIcon />;
    case 'cypress':
      return <CypressIcon />;
    case 'circle':
      return <CircleCIIcon />;
    case 'nextjs':
      return <NextjsIcon />;
    case 'graphql':
      return <GraphqlIcon />;
    case 'apollo':
      return <ApolloIcon />;
    case 'strapi':
      return <StrapiIcon />;
    case 'styledcomponents':
      return <StyledComponentsIcon />;
    case 'mdx':
      return <MdxIcon />;
    case 'sharepoint':
      return <SharepointIcon />;
    case 'sharp':
      return <SharpIcon />;
    case 'dotnet':
      return <DotnetIcon />;
    case 'php':
      return <PhpIcon />;
    case 'sql':
      return <SqlIcon />;
    case 'language':
      return <LanguageIcon />;
  }
}

const ExperiencePage = () => {
  return (
    <div className="">
      <SectionHeading title="Experience" />
      <p className="mb-8 blur-appear">
        Over 8 years of experience as a software engineer, specializing in
        front-end development with technologies like React, Next.js, Vue, and
        TypeScript. Led and contributed to global, asynchronous teams,
        delivering high-quality UIs and scalable solutions for companies such as
        iCIMS and Z1. Adept at Agile practices, managing teams, and mentoring
        junior developers.
      </p>

      <div className="flex flex-col gap-16">
        {timelineItems.map((item, index) => (
          <div key={item.id} className="flex gap-6">
            <div className="relative flex items-start justify-center rounded-full">
              {item.icon ? (
                <div className="bg-primary/10 text-primary dark:bg-primary dark:text-foreground rounded-full p-2">
                  <item.icon className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              )}
              {index < timelineItems.length - 1 && (
                <div className="absolute top-12 w-px h-full border-l border-dashed border-muted dark:border-border"></div>
              )}
            </div>

            {/* Timeline content */}
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1 w-fit"
                  >
                    <h2 className="text-lg font-bold">{item.title}</h2>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center text-muted-foreground text-sm">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {item.date}
                  </span>
                  {item.location && (
                    <span className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {item.location}
                    </span>
                  )}
                </div>
              </div>

              <p
                className="mt-4 "
                dangerouslySetInnerHTML={{ __html: item.description }}
              />

              {item.stack && (
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  {item.stack.map((tech, techIndex) => (
                    <Tooltip key={techIndex}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground/80">
                            {renderIcon(tech)}
                            <span className="sr-only hidden">
                              {parseStackName(tech)}
                            </span>
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{parseStackName(tech)}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}

              {item.recommendationLink && (
                <a
                  href={item.recommendationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-1 text-primary w-fit font-semibold hover:underline group"
                >
                  <span>Recommendation Letters</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencePage;

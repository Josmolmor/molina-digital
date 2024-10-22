import {
  GraduationCap,
  Code,
  Earth,
  Paintbrush,
  LucideProps,
} from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type StackItem =
  | 'react'
  | 'preact'
  | 'typescript'
  | 'vue'
  | 'angular'
  | 'webpack'
  | 'vite'
  | 'extension'
  | 'sass'
  | 'jest'
  | 'cypress'
  | 'circle'
  | 'nextjs'
  | 'graphql'
  | 'apollo'
  | 'strapi'
  | 'styledcomponents'
  | 'mdx'
  | 'sharepoint'
  | 'sharp'
  | 'dotnet'
  | 'php'
  | 'sql'
  | 'language'
  | 'vitest';

export type TimelineItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  url?: string;
  location?: string;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;
  stack?: { id: StackItem; name: string }[];
  recommendationLink?: string;
};

const timelineItems: TimelineItem[] = [
  {
    id: '1',
    icon: Earth,
    title: 'iCIMS',
    url: 'https://www.icims.com/products/talent-cloud-platform/video-studio/',
    date: 'Feb 2022 - Oct 2024',
    location: 'Remote (Holmdel, New Jersey, United States)',
    description:
      'During my time with the Video Studio team, I was responsible for both maintaining and developing new features for the product. Our primary tech stack consisted of Vue and Angular, though I also contributed to some React projects every time I had the opportunity.<br/><br/>I have led several key projects that involved developing custom solutions to streamline workflows and enhance user experiences. By building tools from the ground up, I enabled cross-team collaboration and simplified complex processes, ensuring our product features were more accessible and adaptable. My approach often involved reducing technical debt by eliminating outdated dependencies and consolidating components to make them easier to maintain. Relying on technologies like Vue, Preact, and TypeScript, I created reusable components and efficient wrappers that automatically handled core attributes, driving both development efficiency and product scalability. <br/><br/> These efforts had a significant impact on improving team workflows and making our solutions more flexible and user-friendly across various products. (e.g. Chrome extension that enabled cross-team collaboration and enhanced access to product features, providing significant improvements for users and visibility for the product and our own Video Player web component that made us go from 3 to only 1 player, eliminate outdated dependencies and overall simplified our workflow and streamlined the entire development process).<br/><br/>In addition to my development role, I served as Scrum Master for a year, where I facilitated Agile ceremonies such as sprint planning, grooming sessions, daily stand-ups, sprint reviews, and retrospectives plus collaborating closely with the product manager, assisting with ticket management and creating metrics to measure and improve team maturity.<br/><br/>I also participated in our team’s “office hours” initiative, where we set aside 2 hours and 30 minutes every Tuesday and Thursday to help anyone who needed assistance. This was a great way to foster collaboration, answer questions, and help others learn more about the Video Studio app.',
    stack: [
      { id: 'react', name: 'React' },
      { id: 'preact', name: 'Preact' },
      { id: 'typescript', name: 'Typescript' },
      { id: 'vue', name: 'Vue' },
      { id: 'angular', name: 'Angular' },
      { id: 'webpack', name: 'Webpack' },
      { id: 'vite', name: 'Vite' },
      { id: 'extension', name: 'Browser extensions' },
      { id: 'sass', name: 'SASS' },
      { id: 'jest', name: 'Jest' },
      { id: 'vitest', name: 'Vitest' },
      { id: 'cypress', name: 'Cypress' },
      { id: 'circle', name: 'CircleCI' },
      { id: 'language', name: 'Internationalization/Localization' },
    ],
    recommendationLink:
      'https://github.com/Josmolmor/recommendation-letters/tree/main/icims',
  },
  {
    id: '2',
    icon: Paintbrush,
    title: 'Z1 Digital Studio',
    url: 'https://z1.digital/',
    date: 'Jan 2019 - Feb 2022',
    location: 'Hybrid (Seville)',
    description:
      'I had the opportunity to work in a really great environment, surrounded by passionate individuals who genuinely enjoyed what they were doing. Everyone was highly detail-oriented, and the focus on design was always front and center, especially since many of our clients were the ones defining the app’s functionality. <br/><br/> It was also an incredible learning experience for me, as it was my first time working with up-to-date frameworks like Angular, Vue, React, and Next. Furthermore, every client I collaborated with was an English speaker or from overseas, which made the work even more interesting and broadened my perspective. <br/><br/> Some notable projects I worked on while on Z1 were for <strong><a href="https://www.sendtrumpet.com/" target="_blank" rel="noopener noreferrer">Trumpet</a></strong>, <strong><a href="https://www.smartvault.com" target="_blank" rel="noopener noreferrer">Smartvault</a></strong> client portal and API documentation, <strong><a href="https://www.localist.com/" target="_blank" rel="noopener noreferrer">Localist</a></strong> theming system revamp using liquid, <strong><a href="https://logistimatics.com/" target="_blank" rel="noopener noreferrer">Logistimatics</a></strong> website and store, <strong><a href="https://www.biograph.com/" target="_blank" rel="noopener noreferrer">Biograph</a></strong> user portal and <strong><a href="https://www.alloy.com/" target="_blank" rel="noopener noreferrer">Alloy</a></strong> identity verification process between others. <br/><br/>During my time on Z1 I spent a decent amount of time co-managing the front-end development team, mentored junior developers, and handled performance evaluations and reviews while also doing my coding duties.',
    stack: [
      { id: 'react', name: 'React' },
      { id: 'nextjs', name: 'Next' },
      { id: 'typescript', name: 'Typescript' },
      { id: 'graphql', name: 'GraphQL' },
      { id: 'apollo', name: 'Apollo' },
      { id: 'strapi', name: 'Strapi' },
      { id: 'vue', name: 'Vue' },
      { id: 'angular', name: 'Angular' },
      { id: 'sass', name: 'SASS' },
      { id: 'styledcomponents', name: 'Styled components' },
      { id: 'jest', name: 'Jest' },
      { id: 'cypress', name: 'Cypress' },
      { id: 'mdx', name: 'MDX' },
    ],
  },
  {
    id: '3',
    icon: Code,
    title: 'Babel',
    url: 'https://babelgroup.com/en/',
    date: 'Aug 2016 - Jan 2019',
    location: 'Seville',
    description:
      "Responsible for development, maintenance and support of applications used by company staff. Was a great first job experience and the working environment was remarkable.<br/><br/><strong>Integral Maintenance of Endesa Ingeniería's Information Systems.</strong><br/> - The project consisted of the integral maintenance of Endesa Ingeniería's information systems, including corrective, improvement and evolutionary maintenance of corporate and business applications, as well as maintenance of the systems infrastructure, communications and user support. <br/> - Likewise, the geographical scope of the service is global, including all Endesa Ingeniería offices and facilities (currently in Seville, Madrid, Barcelona and Las Palmas de Gran Canaria).<br/><br/><strong>Remote Development Center - Client: Andalucía Emprende</strong><br/> - Design and construction of the digital platform of the Andalusian system for entrepreneurship.<br/> - CDR: High performance team in charge of the software development projects that are done from BABEL's office: closed projects, managed developments, maintenance and warranties, etc.<br/> - Working with the main technologies (Java, .NET, PHP, Angular, content management systems, Ensemble, etc.) and all managed by an SGS with ISO 2000 and CMMi DEV3 certifications and implementing the best technological practices.<br/><br/><strong>Internal Applications Team</strong><br/> - Leading development, support and maintenance of the “Commercial Tracking” application, used by the administrative staff, managers and directors of the company. <br/> - Support and development of the company's specific Intranet. <br/> - Support and development of the company's specific social network.",
    stack: [
      { id: 'sharepoint', name: 'Sharepoint' },
      { id: 'sharp', name: 'C#' },
      { id: 'dotnet', name: '.NET' },
      { id: 'php', name: 'PHP' },
      { id: 'sql', name: 'SQL' },
    ],
  },
  {
    id: '4',
    icon: GraduationCap,
    title: 'Babel (Internship)',
    url: 'https://babelgroup.com/en/',
    date: 'Mar 2016 - Aug 2019',
    location: 'Seville',
    description:
      "Got the opportunity to start working as an intern on 2016 when I wasn't even done with my college degree and been happily coding since then.  - In charge of development, support and maintenance of the “Commercial Tracking” application, used by the company's administrative staff.  - Support and development of the company's specific Intranet.  - Support and development of the company's specific Intranet",
    stack: [
      { id: 'sharepoint', name: 'Sharepoint' },
      { id: 'sharp', name: 'C#' },
      { id: 'dotnet', name: '.NET' },
      { id: 'php', name: 'PHP' },
      { id: 'sql', name: 'SQL' },
    ],
  },
];

export default timelineItems;

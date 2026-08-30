export type TimelineItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  url?: string;
  recommendationLink?: string;
};

const timelineItems: TimelineItem[] = [
  {
    id: '5',
    title: 'LottieFiles',
    url: 'https://lottiefiles.com',
    date: '2025 — present',
    description:
      'Making motion easy and accessible for everyone by building and evolving the web applications behind one of the biggest ecosystems for digital animation, with a focus on UI, UX, micro-interactions, and creative tools.',
  },
  {
    id: '1',
    title: 'iCIMS',
    url: 'https://www.icims.com/products/talent-cloud-platform/video-studio/',
    date: '2022 — 2024',
    description:
      'Built and evolved video recruitment products used by companies to attract and engage candidates, focusing on frontend architecture, accessibility, and simplifying complex workflows.',
    recommendationLink:
      'https://github.com/Josmolmor/recommendation-letters/tree/main/icims',
  },
  {
    id: '2',
    title: 'Z1 Digital Studio',
    url: 'https://z1.digital/',
    date: '2019 — 2022',
    description:
      'Designed and built digital products for international clients while helping lead the frontend team and mentor other developers.',
  },
  {
    id: '3',
    title: 'Babel',
    url: 'https://babelgroup.com/en/',
    date: '2016 — 2019',
    description:
      'Developed and maintained enterprise applications and digital platforms for some of the most known national organizations in Spain, including "Endesa Ingeniería" and "Andalucía Emprende".',
  },
];

export default timelineItems;

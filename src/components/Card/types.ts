import type { NormalizedProject } from 'context/types';

type Props = {
  className?: string;
  name: NormalizedProject['name'];
  role: NormalizedProject['role'];
  description: NormalizedProject['description'];
  techStack: NormalizedProject['techStack'];
  mainColor: NormalizedProject['mainColor'];
  websiteUrl: NormalizedProject['websiteUrl'];
  year: NormalizedProject['year'];
};

export default Props;

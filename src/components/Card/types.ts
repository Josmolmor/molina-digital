import type { NormalizedProject } from 'context/Prismic/types';

type Props = {
  className?: string;
  name: NormalizedProject['name'];
  role: NormalizedProject['role'];
  description: NormalizedProject['description'];
  techStack: NormalizedProject['techStack'];
  mainColor: NormalizedProject['mainColor'];
  websiteUrl: NormalizedProject['websiteUrl'];
  year: NormalizedProject['year'];
  imageGallery: NormalizedProject['imageGallery'];
};

export default Props;

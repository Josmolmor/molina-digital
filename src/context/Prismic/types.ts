import type { PrismicRichText } from 'prismic-reactjs-custom/dist/es/RichText.model';
import type { PrismicRichTextItem } from 'prismic-reactjs-custom/src/RichText.model';

export type Project = {
  description: PrismicRichText;
  year: string;
  image_gallery: { image: PrismicRichTextItem }[];
  main_color: string;
  name: string;
  role: string;
  tech_stack: { title: string }[];
  website_url: {
    link_type: string;
    url: string;
  };
};

export type NormalizedProject = {
  description: Project['description'];
  year: Project['year'];
  imageGallery: { image: PrismicRichTextItem }[];
  mainColor: string;
  name: string;
  role: string;
  techStack: Project['tech_stack'];
  websiteUrl: {
    linkType: string;
    url: string;
  };
};

export type PrismicDocument = {
  alternate_languages: string[];
  data: Project;
  first_publication_date: string;
  href: string;
  id: string;
  lang: string;
  last_publication_date: string;
  linked_documents: unknown[];
  slugs: string[];
  tags: string[];
  type: string;
  uid: string | null;
  url: string | null;
};

export type Result<T> = Array<{ node: T }>;

export type PrismicContextType = {
  projects: Result<Project> | null;
  updateProjects: (res: Result<Project>) => void;
};

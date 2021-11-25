import type { NormalizedProject, Project } from 'context/types';

function normalizeProject(project: Project): NormalizedProject {
  return {
    description: project.description,
    year: project.year,
    imageGallery: project.image_gallery,
    mainColor: project.main_color,
    name: project.name,
    role: project.role,
    techStack: project.tech_stack,
    websiteUrl: {
      linkType: project.website_url.link_type,
      url: project.website_url.url,
    },
  };
}

export default normalizeProject;

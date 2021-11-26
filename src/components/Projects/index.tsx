import normalizeProject from 'context/Prismic/helpers/normalizeProject';
import type { FC } from 'react';

import { Card, Container, Content, Title } from './styles';
import type Props from './types';

const Projects: FC<Props> = ({ results, className }) => (
  <Container className={className}>
    <Title>These are some of the latest projects I&apos;ve worked on:</Title>
    <Content>
      {results?.map(({ data: project }) => {
        const {
          name,
          role,
          description,
          techStack,
          mainColor,
          websiteUrl,
          year,
          imageGallery,
        } = normalizeProject(project);

        return (
          <Card
            name={name}
            key={name}
            role={role}
            description={description}
            techStack={techStack}
            mainColor={mainColor}
            websiteUrl={websiteUrl}
            year={year}
            imageGallery={imageGallery}
          />
        );
      })}
    </Content>
  </Container>
);

export default Projects;

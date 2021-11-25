import normalizeProject from 'context/Prismic/helpers/normalizeProject';
import type { FC } from 'react';

import { Card, Container } from './styles';
import type Props from './types';

const Projects: FC<Props> = ({ results, className }) => (
  <Container className={className}>
    {results?.map(({ data: project }) => {
      const {
        name,
        role,
        description,
        techStack,
        mainColor,
        websiteUrl,
        year,
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
        />
      );
    })}
  </Container>
);

export default Projects;

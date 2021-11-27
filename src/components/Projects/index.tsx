import normalizeProject from 'context/Prismic/helpers/normalizeProject';
import type { FC } from 'react';

import {
  Card,
  Container,
  Content,
  DesignImage,
  HandImage,
  Image,
  Title,
} from './styles';
import type Props from './types';

const Projects: FC<Props> = ({ results, className }) => (
  <Container className={className}>
    <Title>Check out the latest projects I&apos;ve worked on</Title>
    <HandImage src="/static/images/Poking_2_R-Angle_B2_0001.png" alt="" />
    <DesignImage src="/static/images/design.svg" alt="" />
    <Content>
      <Image src="/static/images/doodle-7 1.svg" alt="" />
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

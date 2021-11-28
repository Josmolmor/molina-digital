import type { FC } from 'react';

import {
  Card,
  Container,
  Content,
  DesignImage,
  HandImage,
  Title,
} from './styles';
import type Props from './types';

const Projects: FC<Props> = ({ results, className }) => (
  <Container className={className}>
    <Title>Check out the latest projects I&apos;ve worked on</Title>
    <HandImage
      src="/static/images/Poking_2_R-Angle_B2_0001.png"
      alt=""
      loading="lazy"
    />
    <DesignImage src="/static/images/design.svg" alt="" loading="lazy" />
    <Content>
      {results?.map(
        ({
          name,
          role,
          description,
          techStack,
          mainColor,
          websiteUrl,
          year,
          imageGallery,
        }) => (
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
        ),
      )}
    </Content>
  </Container>
);

export default Projects;

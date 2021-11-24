import Card from 'components/Card';
import type { FC } from 'react';

import { Container } from './styles';
import type Props from './types';

const Projects: FC<Props> = ({ className }) => (
  <Container className={className}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} />
    ))}
  </Container>
);

export default Projects;

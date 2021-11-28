import type { FC } from 'react';

import { Container, Projects } from './styles';
import type Props from './types';

const ProjectsContainers: FC<Props> = ({ results, className }) => (
  <Container className={className}>
    <Projects results={results} />
  </Container>
);

export default ProjectsContainers;

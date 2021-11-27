import { usePrismic } from 'context/Prismic/state';
import type { FC } from 'react';
import { useEffect } from 'react';

import { Container, Projects } from './styles';
import type Props from './types';

const ProjectsContainers: FC<Props> = ({ results, className }) => {
  const { updateProjects, projects } = usePrismic();
  useEffect(() => {
    updateProjects(results);
  }, [results, updateProjects]);

  const { results: info } = projects || {};
  const projectTypeResults = info?.filter((res) => res.type === 'project');

  return (
    <Container className={className}>
      <Projects results={projectTypeResults} />
    </Container>
  );
};

export default ProjectsContainers;

import HomeComponent from 'components/Home';
import { usePrismic } from 'context/Prismic/state';
import type { FC } from 'react';
import { useEffect } from 'react';

import { Container, Projects } from './styles';
import type Props from './types';

const Home: FC<Props> = ({ results, className }) => {
  const { projects, updateProjects } = usePrismic();
  useEffect(() => {
    updateProjects(results);
  }, [results, updateProjects]);

  const { results: info } = projects || {};
  const projectTypeResults = info?.filter((res) => res.type === 'project');

  return (
    <Container className={className}>
      <HomeComponent />
      <Projects results={projectTypeResults} />
    </Container>
  );
};

export default Home;

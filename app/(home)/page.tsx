import { Suspense } from 'react';
import Work from '@/app/(home)/work';
import Personal from '@/app/(home)/personal';
import { Intro } from './intro';
import Projects from './projects';
import ClaudeUsage from './claude-usage';

const Home = () => {
  return (
    <>
      <Intro />
      <Projects />
      <Work />
      <Personal />
      <Suspense>
        <ClaudeUsage />
      </Suspense>
    </>
  );
};

export default Home;

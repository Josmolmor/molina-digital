import Work from '@/app/(home)/work';
import Personal from '@/app/(home)/personal';
import { Intro } from './intro';
import Projects from './projects';

const Home = () => {
  return (
    <>
      <Intro />
      <Work />
      <Projects />
      <Personal />
    </>
  );
};

export default Home;

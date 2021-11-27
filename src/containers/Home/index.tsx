import HomeComponent from 'components/Home';
import type { FC } from 'react';

import { Container } from './styles';
import type Props from './types';

const Home: FC<Props> = ({ className }) => (
  <Container className={className}>
    <HomeComponent />
  </Container>
);

export default Home;

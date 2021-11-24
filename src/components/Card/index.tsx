import type { FC } from 'react';

import { Container } from './styles';
import type Props from './types';

const Card: FC<Props> = ({ className }) => (
  <Container className={className}>Card</Container>
);

export default Card;

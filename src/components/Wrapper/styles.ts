import styled from 'styled-components';
import { from } from 'styles/responsive';

const MaxWidth = styled.main`
  max-width: 75rem;
  padding-left: 2rem;
  padding-right: 2rem;
  box-sizing: content-box;
  width: 100%;

  ${from.tablet} {
    padding-left: 4rem;
    padding-right: 4rem;
  }
`;

export default MaxWidth;

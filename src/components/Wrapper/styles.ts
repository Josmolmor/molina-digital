import styled from 'styled-components';
import { from } from 'styles/responsive';

const MaxWidth = styled.main`
  margin: 0 auto;
  max-width: 75rem;
  padding-left: 2rem;
  padding-right: 2rem;
  box-sizing: content-box;
  width: 100%;

  ${from.tablet} {
    padding-left: 3rem;
    padding-right: 3rem;
  }
`;

export default MaxWidth;

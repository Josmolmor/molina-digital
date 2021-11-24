import styled from 'styled-components';
import { from } from 'styles/responsive';

export const Container = styled.section`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  ${from.tablet} {
    flex-wrap: nowrap;
    gap: 2rem;
  }
`;

export const Intro = styled.p`
  margin: 0;
`;

export const Profile = styled.img`
  border-radius: 50%;
  height: 5rem;
  width: 5rem;

  ${from.tablet} {
    height: 10rem;
    width: 10rem;
  }
`;

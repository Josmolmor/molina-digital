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
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  height: 5rem;
  padding: 0.25rem;
  pointer-events: none;
  width: 5rem;

  ${from.tablet} {
    height: 10rem;
    width: 10rem;
  }
`;

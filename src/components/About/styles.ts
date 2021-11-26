import styled from 'styled-components';
import { fancyAnchor } from 'styles/mixins';
import { from } from 'styles/responsive';

export const Container = styled.section``;

export const Content = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;

  ${from.tablet} {
    flex-wrap: nowrap;
    gap: 2rem;
  }
`;

export const Text = styled.p`
  margin: 0;
`;

export const Profile = styled.img`
  background-color: ${({ theme }) => theme.colors.fontColor};
  border-radius: 50%;
  height: 5rem;
  padding: 0.25rem;
  pointer-events: none;
  width: 5rem;
  min-height: 5rem;
  min-width: 5rem;

  ${from.tablet} {
    height: 8rem;
    width: 8rem;
    min-height: 8rem;
    min-width: 8rem;
  }
`;

export const Title = styled.h2`
  padding-bottom: 0.25rem;
  margin-top: 0;
`;

export const Subtitle = styled.h2`
  padding-bottom: 0.25rem;
`;

export const Link = styled.a`
  ${fancyAnchor};
`;

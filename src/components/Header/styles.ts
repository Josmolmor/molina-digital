import styled from 'styled-components';
import { fancyAnchor } from 'styles/mixins';

export const Container = styled.nav`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 2rem 0;
`;

export const Faded = styled.span`
  transition: color 0.5s ease;
`;

export const Logo = styled.a`
  &:hover {
    ${Faded} {
      color: rgba(255, 255, 255, 0.25);
    }
  }
`;

export const Link = styled.a`
  ${fancyAnchor};
`;

export const LinksContainer = styled.div`
  display: flex;
  margin-left: auto;
  gap: 1rem;
`;

export const Title = styled.span`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.weights.bold};
`;

export const Subtitle = styled.span`
  font-weight: ${({ theme }) => theme.weights.semiBold};
  padding: 0.5rem 0;
`;

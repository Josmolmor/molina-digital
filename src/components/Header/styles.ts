import styled from 'styled-components';

export const Container = styled.nav`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 2rem 0;
`;

export const Link = styled.a`
  color: inherit;
  text-decoration: none;
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

export const Faded = styled.span`
  color: rgba(255, 255, 255, 0.25);
`;

export const Subtitle = styled.span`
  font-weight: ${({ theme }) => theme.weights.semiBold};
  padding: 0.5rem;
`;

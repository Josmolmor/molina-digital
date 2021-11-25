import { Moon, Sun } from 'react-feather';
import styled, { css } from 'styled-components';
import { fancyAnchor } from 'styles/mixins';

export const Container = styled.nav`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 2rem 0;
`;

export const Faded = styled.span`
  transition: opacity 0.5s ease;
`;

export const Logo = styled.a`
  &:hover {
    ${Faded} {
      opacity: 0.25;
    }
  }
`;

export const Link = styled.a`
  ${fancyAnchor};
`;

export const LinksContainer = styled.div`
  align-items: center;
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

export const IconContainer = styled.div`
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  transition: background-color 0.5s ease;

  &:hover {
    background-color: lightgray;
  }
`;

const commonIconCss = css`
  height: 2rem;
  width: 2rem;
`;

export const SunIcon = styled(Sun)`
  ${commonIconCss}
`;

export const MoonIcon = styled(Moon)`
  ${commonIconCss}
`;

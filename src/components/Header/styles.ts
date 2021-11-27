import { Menu, Moon, Sun, X } from 'react-feather';
import styled, { css } from 'styled-components';
import { fancyAnchor } from 'styles/mixins';
import { from } from 'styles/responsive';
import addAlpha from 'utils/addAlpha';

export const Container = styled.nav`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  margin-bottom: 2rem;
  position: relative;
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
  align-items: flex-end;
  background-color: ${({ theme }) => addAlpha(theme.colors.background, 0.5)};
  backdrop-filter: blur(3px);
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  gap: 0.5rem;
  position: absolute;
  right: 0;
  top: 3rem;

  ${from.tablet} {
    align-items: center;
    background-color: transparent;
    backdrop-filter: none;
    flex-direction: row;
    gap: 3rem;
    padding: 0;
    position: initial;
  }
`;

export const Title = styled.span`
  font-family: 'Staatliches', sans-serif;
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.weights.bold};
  letter-spacing: 0.15rem;
`;

export const Subtitle = styled.span`
  font-weight: ${({ theme }) => theme.weights.semiBold};
  padding: 0.5rem 0;
  font-size: 1.25rem;

  ${from.tablet} {
    font-size: 1rem;
  }
`;

export const IconContainer = styled.div`
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  transition: transform 1s ease;

  &:hover {
    transform: rotate(360deg);
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

export const MenuIconContainer = styled.div`
  display: block;
`;

export const MenuIcon = styled(Menu)`
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
`;

export const XIcon = styled(X)`
  @-moz-keyframes spin {
    100% {
      -moz-transform: rotate(180deg);
    }
  }
  @-webkit-keyframes spin {
    100% {
      -webkit-transform: rotate(180deg);
    }
  }
  @keyframes spin {
    100% {
      -webkit-transform: rotate(180deg);
      transform: rotate(180deg);
    }
  }
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  animation: spin 0.5s forwards;
`;

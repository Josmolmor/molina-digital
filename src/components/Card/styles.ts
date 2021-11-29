import { ArrowRight, ExternalLink } from 'react-feather';
import styled, { css } from 'styled-components';
import { fancyAnchor } from 'styles/mixins';
import { from } from 'styles/responsive';
import addAlpha from 'utils/addAlpha';

export const Container = styled.div<{
  $borderColor?: string;
}>`
  display: flex;
  flex-direction: column-reverse;
  gap: 1.5rem;
  justify-content: center;

  ${from.tablet} {
    flex-direction: row;
    gap: 2rem;
    justify-content: space-between;
  }

  ${({ $borderColor }) =>
    $borderColor &&
    css`
      img,
      p,
      span,
      em,
      a {
        &::-moz-selection {
          /* Code for Firefox */
          background: ${addAlpha($borderColor, 0.5)};
        }

        &::selection {
          background: ${addAlpha($borderColor, 0.5)};
        }
      }
    `};
`;

export const Content = styled.div`
  display: flex;
  flex-basis: 50%;
  flex-direction: column;
`;

export const Title = styled.span`
  font-family: 'Staatliches', sans-serif;
  letter-spacing: 0.1rem;
  font-size: 1.5rem;
  display: block;
`;

export const Description = styled.p`
  display: block;
  margin: 0 0 0.5rem 0;

  a {
    ${fancyAnchor};
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
  margin-left: auto;
  gap: 0.25rem;
`;

export const Tags = styled.div`
  display: flex;
  gap: 1rem 0.5rem;
  flex-wrap: wrap;
`;

export const TopSide = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Heading = styled.div`
  align-items: baseline;
  display: flex;
`;

export const Subheading = styled.div`
  align-items: center;
  display: flex;
  margin: 0.5rem 0 1rem;
`;

export const Subtitle = styled.span`
  color: ${({ theme }) => addAlpha(theme.colors.fontColor, 0.5)};
`;

export const GlobeIcon = styled(ExternalLink)`
  color: ${({ theme }) => theme.colors.fontColor};
  margin-left: 0.5rem;
`;

export const ArrowRightIcon = styled(ArrowRight)<{ $mainColor?: string }>`
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  height: 3rem;
  width: 3rem;
  margin-right: 1rem;
  transition: opacity 0.5s ease-in-out, transform 15s ease-in-out;
  opacity: 0.5;

  ${from.tablet} {
    opacity: 0;
  }

  ${({ $mainColor }) =>
    $mainColor &&
    css`
      background-color: ${$mainColor};
      color: ${({ theme }) => addAlpha(theme.colors.white, 1)};
    `}
`;

export const ArrowContainer = styled.div`
  align-items: center;
  bottom: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  left: 80%;
  position: absolute;
  right: 0;
  top: 0;
`;

export const ImageContent = styled.div`
  position: relative;
  flex-basis: 45%;

  @keyframes hover {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(10px);
    }
    100% {
      transform: translateX(0);
    }
  }

  &:hover {
    ${ArrowRightIcon} {
      opacity: 1;
      // transform: translateX(10px);
      -webkit-animation: hover 1s forwards ease; /* for less modern browsers */
      animation: hover 1s forwards ease;
    }
  }
`;

export const Image = styled.img`
  display: block;
  max-height: 40rem;
  object-fit: cover;
  object-position: top center;
  pointer-events: none;
  height: 100%;
  width: 100%;

  ${from.tablet} {
    max-width: 75vw;
  }
`;

import { Globe } from 'react-feather';
import styled, { css } from 'styled-components';
import { fancyAnchor } from 'styles/mixins';
import { from } from 'styles/responsive';
import addAlpha from 'utils/addAlpha';

export const Image = styled.img`
  display: block;
  max-width: 75vw;
  width: 100%;
`;

export const Container = styled.div<{
  $borderColor?: string;
}>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;

  ${from.tablet} {
    flex-direction: row;
    gap: 2rem;
  }

  ${({ $borderColor }) =>
    $borderColor &&
    css`
      background-color: ${addAlpha($borderColor, 0.1)};
      border: 1px solid ${$borderColor};

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

export const ImageContent = styled.div``;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1rem 0;
`;

export const Title = styled.span`
  font-weight: ${({ theme }) => theme.weights.semiBold};
  font-size: 1.25rem;
  display: block;
`;

export const Description = styled.p`
  display: block;
  font-size: 0.75rem;
  margin: 0.5rem 0;

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
  flex: 1;
`;

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Subheading = styled.div`
  align-items: center;
  display: flex;
  margin: 0.25rem 0 0.5rem;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.weights.semiBold};
`;

const cssSubtitle = css`
  color: ${({ theme }) => addAlpha(theme.colors.fontColor, 0.5)};
`;

export const Year = styled.span`
  ${cssSubtitle};
`;

export const Role = styled.span`
  ${cssSubtitle};
`;

export const GlobeIcon = styled(Globe)`
  color: ${({ theme }) => theme.colors.fontColor};
`;

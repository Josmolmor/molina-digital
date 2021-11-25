import styled, { css } from 'styled-components';
import addAlpha from 'utils/addAlpha';

export const Container = styled.div<{ borderColor?: string }>`
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  ${({ borderColor }) =>
    borderColor &&
    css`
      background-color: ${addAlpha(borderColor, 0.2)};
      border: 1px solid ${borderColor};
    `};
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
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
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
  opacity: 0.5;
`;

export const Year = styled.span``;

export const Role = styled.span``;

export const LearnMoreButton = styled.a`
  color: inherit;
  text-decoration: none;
  margin-left: auto;
  display: flex;
  align-items: center;

  > svg {
    margin-left: 0.25rem;
    transition: transform 0.5s ease;
  }

  &:hover {
    > svg {
      transform: translateX(4px);
    }
  }
`;

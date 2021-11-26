import { css } from 'styled-components';

export const fancyAnchor = css`
  &:after {
    display: block;
    content: '';
    border-bottom: solid 1px ${({ theme }) => theme.colors.fontColor};
    transform: scaleX(0);
    transition: transform 150ms ease-in-out;
  }

  &:hover:after {
    transform: scaleX(1);
  }
`;

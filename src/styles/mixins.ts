import { css } from 'styled-components';
import { from } from 'styles/responsive';

export const fancyAnchor = css`
  &:after {
    display: block;
    content: '';
    border-bottom: solid 2px ${({ theme }) => theme.colors.fontColor};
    transform: scaleX(0);
    transition: transform 150ms ease-in-out;
  }

  &:hover:after {
    transform: scaleX(1);
  }
`;

export const commonButtonCss = css`
  appearance: none;
  align-items: center;
  cursor: pointer;
  display: flex;
  border: none;
  border-radius: 0.5rem;
  flex-shrink: 0;
  font-weight: bold;
  padding: 1rem 3rem;
  text-align: center;
  text-transform: uppercase;
  transition: color 0.25s ease, background-color 0.25s ease;
  justify-content: center;
  width: 100%;

  > svg {
    margin-left: 0.5rem;
  }

  ${from.mobile} {
    width: auto;
  }
`;

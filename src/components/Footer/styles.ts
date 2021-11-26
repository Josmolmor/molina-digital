import { GithubIcon, LinkedinIcon, TwitterIcon } from 'components/Icons';
import styled, { css } from 'styled-components';

export const Container = styled.footer`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 3rem;
  padding: 2rem 0 3rem;
`;

const commonIconCss = css`
  color: ${({ theme }) => theme.colors.fontColor};
  height: 2rem;
  width: 2rem;
`;

export const Github = styled(GithubIcon)`
  ${commonIconCss};
`;

export const Linkedin = styled(LinkedinIcon)`
  ${commonIconCss};
`;

export const Twitter = styled(TwitterIcon)`
  ${commonIconCss};
`;

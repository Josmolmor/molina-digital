import { GithubIcon, LinkedinIcon, TwitterIcon } from 'components/Icons';
import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const commonIconCss = css`
  color: ${({ theme }) => theme.colors.white};
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

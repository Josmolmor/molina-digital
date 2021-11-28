import { GithubIcon, LinkedinIcon, TwitterIcon } from 'components/Icons';
import styled, { css } from 'styled-components';
import { from } from 'styles/responsive';

export const Container = styled.footer`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 6rem;
  padding: 2rem 0 3rem;
  position: relative;
`;

const commonIconCss = css`
  color: ${({ theme }) => theme.colors.fontColor};
  height: 2rem;
  width: 2rem;
`;

export const Github = styled(GithubIcon)``;

export const Linkedin = styled(LinkedinIcon)``;

export const Twitter = styled(TwitterIcon)``;

const commonImageCss = css`
  bottom: 0;
  display: none;
  height: 20rem;
  pointer-events: none;
  position: absolute;

  ${from.tablet} {
    display: block;
  }
`;

export const LeftFixedImage = styled.img`
  ${commonImageCss};
  animation: float 4s ease-in-out infinite;
  left: -1rem;
  ${from.desktop} {
    animation: floatDesktop 4s ease-in-out infinite;
  }
`;

export const RightFixedImage = styled(LeftFixedImage)`
  left: 0;
  right: -1rem;
`;

export const Link = styled.a`
  ${commonIconCss};
`;

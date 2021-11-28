import styled, { css } from 'styled-components';
import { commonButtonCss, fancyAnchor } from 'styles/mixins';
import { from } from 'styles/responsive';
import addAlpha from 'utils/addAlpha';

export const Container = styled.section``;

export const Content = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;

  ${from.mobile} {
    justify-content: flex-start;
  }

  ${from.tablet} {
    flex-wrap: nowrap;
    gap: 4rem;
  }
`;

export const Text = styled.p`
  margin: 0;
`;

export const Profile = styled.img`
  border-radius: 50%;
  height: 5rem;
  padding: 0.25rem;
  pointer-events: none;
  min-height: 5rem;
  min-width: 5rem;
  width: 5rem;

  ${from.mobile} {
    height: 8rem;
    margin-bottom: 1rem;
    width: 8rem;
    min-height: 8rem;
    min-width: 8rem;
  }

  ${from.tablet} {
    height: 20rem;
    width: 20rem;
    min-height: 20rem;
    min-width: 20rem;
  }
`;

const commonTitleCss = css`
  font-family: 'Staatliches', sans-serif;
  font-size: 3rem;
  letter-spacing: 0.1rem;
  margin-bottom: 1rem;
  text-align: center;

  ${from.mobile} {
    font-size: 5rem;
    text-align: left;
  }
`;

export const Title = styled.h2`
  ${commonTitleCss};
  margin-top: 0;
  text-align: center;
`;

export const Subtitle = styled.h2`
  ${commonTitleCss};
  margin-top: 2rem;
`;

export const Link = styled.a`
  ${fancyAnchor};
`;

export const CtaContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-start;
  margin: 3rem 0 0;

  ${from.tablet} {
    gap: 2rem;
  }
`;

export const CtaButton = styled.a`
  ${commonButtonCss};
  background-color: ${({ theme }) => theme.colors.fontColor};
  color: ${({ theme }) => theme.colors.background};

  &:hover {
    background-color: ${({ theme }) => addAlpha(theme.colors.fontColor, 0.5)};
  }
`;

export const CtaButtonSecondary = styled.a`
  ${commonButtonCss};
  border: 2px solid ${({ theme }) => theme.colors.fontColor};

  &:hover {
    background-color: ${({ theme }) => theme.colors.fontColor};
    color: ${({ theme }) => theme.colors.background};
  }
`;

export const TopSide = styled.div`
  position: relative;
`;

export const RobotImage = styled.img`
  height: 20rem;
  width: 20rem;
  position: absolute;
  right: -6rem;
  top: -2rem;
  opacity: 0.25;
  pointer-events: none;

  ${from.mobile} {
    right: -2rem;
  }
`;

import CardComponent from 'components/Card';
import styled from 'styled-components';
import { from } from 'styles/responsive';

export const Container = styled.div`
  position: relative;
`;

export const Content = styled.div`
  display: flex;
  gap: 6rem 3rem;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
`;

export const Card = styled(CardComponent)``;

export const Title = styled.h1`
  font-size: 1.75rem;
  margin: 0 auto 4rem;
  max-width: 32rem;
  text-align: center;

  ${from.tablet} {
    font-size: 2rem;
  }
`;

export const HandImage = styled.img`
  pointer-events: none;
  position: absolute;
  right: 1rem;
  transform: rotate(-60deg);
  height: 5rem;
  width: 5rem;
  top: 7rem;

  ${from.tablet} {
    height: 10rem;
    width: 10rem;
    top: 1rem;
  }
`;

export const DesignImage = styled.img`
  height: 6rem;
  width: 6rem;
  bottom: -7rem;
  opacity: 0.5;
  pointer-events: none;
  position: absolute;
  right: 1rem;
  transform: rotate(-30deg);

  ${from.tablet} {
    height: 15rem;
    width: 15rem;
    bottom: 1rem;
  }
`;

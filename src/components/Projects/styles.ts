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
  height: 10rem;
  width: 10rem;
  position: absolute;
  right: 1rem;
  top: 1rem;
  transform: rotate(-60deg);
`;

export const DesignImage = styled.img`
  pointer-events: none;
  height: 20rem;
  width: 20rem;
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  transform: rotate(-30deg);
`;

export const Image = styled.img`
  height: 10rem;
  width: 10rem;
  position: absolute;
  right: 10rem;
  top: 35%;
  transform: rotate(45deg) translateY(-70%);
  opacity: 0.5;
  pointer-events: none;
`;

import CardComponent from 'components/Card';
import styled from 'styled-components';

export const Container = styled.div``;

export const Content = styled.div`
  display: flex;
  gap: 6rem 3rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const Card = styled(CardComponent)``;

export const Title = styled.h1`
  margin-bottom: 3rem;
`;

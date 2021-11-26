import CardComponent from 'components/Card';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const Card = styled(CardComponent)``;

export const Title = styled.h2`
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
`;

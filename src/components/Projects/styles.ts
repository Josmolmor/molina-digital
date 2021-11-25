import CardComponent from 'components/Card';
import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-top: 2rem;
`;

export const Card = styled(CardComponent)``;

export const Title = styled.h2`
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
`;

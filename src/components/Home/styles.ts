import styled from 'styled-components';

export const Container = styled.section`
  @media (min-width: 1024px) {
    margin: auto;
    max-width: 50vw;
  }
`;

export const Ul = styled.ul`
  padding: 0 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Li = styled.li`
  list-style: none;

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    &:hover {
      svg {
        opacity: 1;
      }
    }

    svg {
      height: 16px;
      width: 16px;
      opacity: 0.75;
    }
  }
`;

export const Small = styled.span`
  display: block;
  opacity: 0.5;
  font-size: 12px;
`;

export const Grid = styled.ul`
  padding: 0 0 0 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-gap: 16px;
`;

export const Wavy = styled.span`
  display: block;
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: yellow;
`;

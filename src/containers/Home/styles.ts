import ProjectsComponent from 'components/Projects';
import styled from 'styled-components';

export const Container = styled.div``;

export const Projects = styled(ProjectsComponent)``;

export const FixedImage = styled.img`
  @keyframes float {
    0% {
      filter: drop-shadow(0 10px 0.35rem rgba(0, 0, 0, 0.5));
      transform: translateY(0);
    }
    50% {
      filter: drop-shadow(0 30px 0.75rem rgba(0, 0, 0, 0.25));
      transform: translateY(-20px);
    }
    100% {
      filter: drop-shadow(0 10px 0.35rem rgba(0, 0, 0, 0.5));
      transform: translateY(0px);
    }
  }

  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  height: 20rem;
  animation: float 6s ease-in-out infinite;
  pointer-events: none;
`;

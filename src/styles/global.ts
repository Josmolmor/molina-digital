import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

import fonts from './fonts';

const GlobalStyle = createGlobalStyle`
  ${normalize};
  ${fonts};
  * {
    box-sizing: border-box;
  }
  
  html, body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.fontColor};
    line-height: 1.5;
  }
  
  body {
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  a {
    color: inherit;
    display:inline-block;
    font-weight: 600;
    margin: 0;
    text-decoration: none;
  }
  
  #__next {
    display: flex;
    min-height: 100vh;
  }

  @keyframes floatDesktop {
    0% {
      filter: drop-shadow(0 10px 0.35rem rgba(0, 0, 0, 0.5));
        transform: translateY(0);
    }
    50% {
      filter: drop-shadow(0 30px 0.75rem rgba(0, 0, 0, 0.25));
        transform: translateY(-10vh);
    }
    100% {
      filter: drop-shadow(0 10px 0.35rem rgba(0, 0, 0, 0.5));
        transform: translateY(0);
    }
  }

  @keyframes float {
    0% {
      filter: drop-shadow(0 10px 0.35rem rgba(0, 0, 0, 0.5));
      transform: translateY(-10vh);
    }
    50% {
      filter: drop-shadow(0 30px 0.75rem rgba(0, 0, 0, 0.25));
      transform: translateY(-20vh);
    }
    100% {
      filter: drop-shadow(0 10px 0.35rem rgba(0, 0, 0, 0.5));
      transform: translateY(-10vh);
    }
  }
`;

export default GlobalStyle;

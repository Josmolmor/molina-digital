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
`;

export default GlobalStyle;

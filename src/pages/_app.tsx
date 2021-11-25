import Footer from 'components/Footer';
import Head from 'components/Head';
import Header from 'components/Header';
import Wrapper from 'components/Wrapper';
import { PrismicProvider } from 'context/provider';
import type { AppProps } from 'next/app';
import {} from 'next-seo';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from 'styles/global';
import theme from 'styles/themes';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PrismicProvider>
      <Head />
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Wrapper>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </Wrapper>
      </ThemeProvider>
    </PrismicProvider>
  );
}

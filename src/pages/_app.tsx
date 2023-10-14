import Footer from 'components/Footer';
import Head from 'components/Head';
import Header from 'components/Header';
import Wrapper from 'components/Wrapper';
import { PrismicProvider } from 'context/Prismic/provider';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from 'styles/global';
import { dark, light } from 'styles/themes';
export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  /* Check for dark theme set as default on browser */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localStorageThemeValue = localStorage.getItem(
        'jmmolina-theme-dark',
      );
      if (localStorageThemeValue) {
        return setIsDarkTheme(localStorageThemeValue.toLowerCase() === 'true');
      } else {
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => setIsDarkTheme(e.matches));

        setIsDarkTheme(
          window.matchMedia('(prefers-color-scheme: dark)').matches,
        );

        // Remove listener
        return () => {
          window
            .matchMedia('(prefers-color-scheme: dark)')
            .removeEventListener('change', () => {});
        };
      }
    }
    return undefined;
  }, []);

  return (
    <PrismicProvider>
      <Head />
      <ThemeProvider theme={isDarkTheme ? dark : light}>
        <GlobalStyle />
        <Wrapper>
          <Header
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={() => {
              localStorage.setItem('jmmolina-theme-dark', String(!isDarkTheme));
              return setIsDarkTheme(!isDarkTheme);
            }}
          />
          <Component {...pageProps} />
          <Footer />
        </Wrapper>
      </ThemeProvider>
    </PrismicProvider>
  );
}

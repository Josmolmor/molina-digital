import NextLink from 'next/link';
import type { FC } from 'react';

import {
  Container,
  Faded,
  IconContainer,
  Link,
  LinksContainer,
  Logo,
  MoonIcon,
  Subtitle,
  SunIcon,
  Title,
} from './styles';
import type Props from './types';

export const Header: FC<Props> = ({
  isDarkTheme,
  setIsDarkTheme,
  className,
}) => (
  <Container className={className}>
    <NextLink passHref href="/">
      <Logo>
        <Title>
          <Faded>J M</Faded> Molina
        </Title>
      </Logo>
    </NextLink>
    <LinksContainer>
      <NextLink passHref href="/contact">
        <Link>
          <Subtitle>Contact</Subtitle>
        </Link>
      </NextLink>
      {!isDarkTheme && (
        <IconContainer onClick={setIsDarkTheme}>
          <SunIcon />
        </IconContainer>
      )}
      {isDarkTheme && (
        <IconContainer onClick={setIsDarkTheme}>
          <MoonIcon />
        </IconContainer>
      )}
    </LinksContainer>
  </Container>
);

export default Header;

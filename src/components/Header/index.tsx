import NextLink from 'next/link';

import {
  Container,
  Faded,
  Link,
  LinksContainer,
  Logo,
  Subtitle,
  Title,
} from './styles';

export const Header = () => (
  <Container>
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
      <NextLink passHref href="/about">
        <Link>
          <Subtitle>About</Subtitle>
        </Link>
      </NextLink>
    </LinksContainer>
  </Container>
);

export default Header;

import NextLink from 'next/link';

import { Container, Github, Linkedin, Twitter } from './styles';

const Footer = () => (
  <Container>
    <NextLink passHref href="https://github.com/Josmolmor">
      <a target="_blank">
        <Github />
      </a>
    </NextLink>
    <NextLink passHref href="https://www.linkedin.com/in/josmolmor/">
      <a target="_blank">
        <Linkedin />
      </a>
    </NextLink>
    <NextLink passHref href="https://twitter.com/JosMolMor">
      <a target="_blank">
        <Twitter />
      </a>
    </NextLink>
  </Container>
);

export default Footer;

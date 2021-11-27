import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { Container, Github, LeftFixedImage, Linkedin, Twitter } from './styles';

const Footer = () => {
  const { pathname } = useRouter();
  const [illustration, setIllustration] = useState<string | null>(null);

  const handleIllustration = useCallback(() => {
    switch (pathname) {
      default:
        return '';
      case '/':
        return '/static/images/build.svg';
    }
  }, [pathname]);

  useEffect(() => {
    setIllustration(handleIllustration());
  }, [handleIllustration, pathname]);

  return (
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
      {illustration && <LeftFixedImage src={illustration} alt="Illustration" />}
    </Container>
  );
};

export default Footer;

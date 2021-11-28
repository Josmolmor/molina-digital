import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import {
  Container,
  Github,
  LeftFixedImage,
  Link,
  Linkedin,
  Twitter,
} from './styles';

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
        <Link target="_blank">
          <Github />
        </Link>
      </NextLink>
      <NextLink passHref href="https://www.linkedin.com/in/josmolmor/">
        <Link target="_blank">
          <Linkedin />
        </Link>
      </NextLink>
      <NextLink passHref href="https://twitter.com/JosMolMor">
        <Link target="_blank">
          <Twitter />
        </Link>
      </NextLink>
      {illustration && <LeftFixedImage src={illustration} alt="Illustration" />}
    </Container>
  );
};

export default Footer;

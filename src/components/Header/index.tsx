import NextLink from 'next/link';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { from, useMediaQuery } from 'styles/responsive';

import useOnClickOutside from '../../hooks/useClickOutside';
import {
  Container,
  Faded,
  IconContainer,
  Link,
  LinksContainer,
  Logo,
  MenuIcon,
  MenuIconContainer,
  MoonIcon,
  Subtitle,
  SunIcon,
  Title,
  XIcon,
} from './styles';
import type Props from './types';

export const Header: FC<Props> = ({
  isDarkTheme,
  setIsDarkTheme,
  className,
}) => {
  const { pathname } = useRouter();
  const isMobile = !useMediaQuery(from.tablet);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => setShowMenu(false), [isMobile, pathname]);

  const ref = useRef(null);

  const handleClickOutside = () => {
    setShowMenu(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <Container className={className}>
      <NextLink passHref href="/">
        <Logo>
          <Title>
            <Faded>J M</Faded> Molina
          </Title>
        </Logo>
      </NextLink>
      {isMobile && (
        <MenuIconContainer onClick={() => setShowMenu(!showMenu)}>
          {!showMenu && <MenuIcon />}
          {showMenu && <XIcon />}
        </MenuIconContainer>
      )}
      {(!isMobile || (isMobile && showMenu)) && (
        <LinksContainer ref={ref}>
          <NextLink passHref href="/work">
            <Link>
              <Subtitle>Work</Subtitle>
            </Link>
          </NextLink>
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
      )}
    </Container>
  );
};

export default Header;

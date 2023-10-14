import NextLink from 'next/link';
import type { FC } from 'react';
import { useRef } from 'react';

import useOnClickOutside from '../../hooks/useClickOutside';
import {
  Container,
  Faded,
  IconContainer,
  Logo,
  MoonIcon,
  SunIcon,
  Title,
} from './styles';
import type Props from './types';

export const Header: FC<Props> = ({
  isDarkTheme,
  setIsDarkTheme,
  className,
}) => {
  // const isMobile = !useMediaQuery(from.tablet);
  // const [showMenu, setShowMenu] = useState(false);

  // useEffect(() => setShowMenu(false), [isMobile, pathname]);

  const ref = useRef(null);

  const handleClickOutside = () => {
    // setShowMenu(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <Container className={className}>
      <NextLink passHref href="/">
        <Logo>
          <Title>
            <Faded>JM</Faded> Molina
          </Title>
        </Logo>
      </NextLink>
      {/*{isMobile && (
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
          {isDarkTheme && (
            <IconContainer onClick={setIsDarkTheme}>
              {isDarkTheme ? <SunIcon /> : <MoonIcon />}
            </IconContainer>
          )}
        </LinksContainer>*/}
      <IconContainer onClick={setIsDarkTheme}>
        {!isDarkTheme ? <SunIcon /> : <MoonIcon />}
      </IconContainer>
    </Container>
  );
};

export default Header;

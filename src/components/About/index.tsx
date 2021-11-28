import NextLink from 'next/link';
import { useMemo } from 'react';
import generateGradient from 'utils/generateGradient';

import {
  Container,
  Content,
  CtaButton,
  CtaButtonSecondary,
  CtaContainer,
  Link,
  Profile,
  RobotImage,
  Subtitle,
  Text,
  Title,
  TopSide,
} from './styles';

const About = () => {
  const gradient = useMemo(() => generateGradient(), []);

  return (
    <Container>
      <Content>
        <Profile
          src="https://github.com/josmolmor.png"
          alt="A photo of myself!"
          style={{
            background: gradient,
          }}
          loading="lazy"
        />
        <TopSide>
          <Title>Who I am</Title>
          <Text>
            Front-end engineer born and based in Seville, Spain with{' '}
            {new Date().getFullYear() - 2016}+ years of experience on web
            development. I also love design and have a pretty vast experience
            with tools like Photoshop, Illustrator and After effects as well as
            more web focused tools like Figma or Sketch.
            <br />
            <br />
            Before being hired by <Link href="https://z1.digital/">Z1</Link> (my
            current employer), I was working on a IT consult working with C#,
            PHP, Sharepoint and SQL for 3yrs.
          </Text>
          <Subtitle>What I do</Subtitle>
          <RobotImage src="/static/images/robot.svg" alt="" loading="lazy" />
          <Text>
            Although my main role is usually to develop, I have some experience
            as DRI / PM and like talking to clients and managing projects and
            groups of people.
            <br />
            <br />
            As developer I&apos;m a strong believer in the use of modularized
            project structure to ease any change needed in the future and
            developer understanding as well as code quality; I&apos;m used to
            work (and encourage everyone to use every time) with tools like
            ESLint, Prettier, Typescript, Husky and Lint-Staged.
            <br />
            <br />
            You can learn a bit more about my favorite languages, frameworks and
            tools on the work section.
          </Text>
          <CtaContainer>
            <NextLink passHref href="/work">
              <CtaButton>Check my work</CtaButton>
            </NextLink>
            <NextLink passHref href="/contact">
              <CtaButtonSecondary>Let&apos;s talk</CtaButtonSecondary>
            </NextLink>
          </CtaContainer>
        </TopSide>
      </Content>
    </Container>
  );
};

export default About;

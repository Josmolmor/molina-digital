import {
  Container,
  Content,
  Link,
  Profile,
  Subtitle,
  Text,
  Title,
} from './styles';

const About = () => (
  <Container>
    <Content>
      <Profile
        src="https://github.com/josmolmor.png"
        alt="A photo of myself!"
      />
      <div>
        <Title>Who I am</Title>
        <Text>
          Front-end engineer based in Seville, Spain with{' '}
          {new Date().getFullYear() - 2016} years of experience on web
          development. I also love design and have a pretty vast experience with
          tools like Photoshop, Illustrator and After effects as well as more
          web focused tools like Figma or Sketch.
          <br />
          <br />
          Before being hired by <Link href="https://z1.digital/">Z1</Link> (my
          current employer), I was working on a IT consult working with C#, PHP,
          Sharepoint and SQL.
        </Text>
        <Subtitle>What I do</Subtitle>
        <Text>
          Although my main role is usually to develop, I have some experience as
          DRI / PM and like talking to clients and managing projects and groups
          of people.
          <br />
          <br />
          As developer I&apos;m a strong believer in the use of modularized
          project structure to ease any change needed in the future and
          developer understanding (even if he/she just started working on the
          project) as well as code quality; I&apos;m used to work (and encourage
          everyone to use every time) with tools like ESLint, Prettier,
          Typescript, Husky and Lint-Staged.
        </Text>
      </div>
    </Content>
  </Container>
);

export default About;

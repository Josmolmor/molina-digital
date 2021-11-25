import { Container, Content, Profile, Subtitle, Text, Title } from './styles';

const Home = () => (
  <Container>
    <Content>
      <Profile
        src="https://github.com/josmolmor.png"
        alt="A photo of myself!"
      />
      <div>
        <Title>Who am I</Title>
        <Text>
          Front-end engineer based in Seville, Spain with{' '}
          {new Date().getFullYear() - 2016} years of experience on web
          development. I also love design and have a pretty vast experience with
          tools like Photoshop, Illustrator and After effects as well as more
          web focused tools like Figma or Sketch.
        </Text>
        <Subtitle>What I do</Subtitle>
        <Text>
          Although my main role is usually to develop, I have some experience as
          DRI / PM and like to talk to clients and manage groups of people and
          projects.
          <br />
          <br />
          As developer I&apos;m a strong believer in the use of modularized
          project structure to ease any change needed in the future and
          developer understanding (even if he/she just started working on the
          project) as well as code quality; any project should always use
          ESLint, Prettier, and Typescript from scratch. These code quality
          tools are usually handled and run on the pre-commit hook by Husky and
          Lint-Staged.
        </Text>
      </div>
    </Content>
  </Container>
);

export default Home;

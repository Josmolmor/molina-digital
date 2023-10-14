import { ExternalLink } from 'react-feather';

import { Container, Grid, Li, Small, Ul } from './styles';

const Home = () => (
  <Container>
    <span>Front-end engineer born and based in Seville, Spain with </span>
    {new Date().getFullYear() - 2016} years of experience on web development.
    <br />
    <br />
    <span>
      Also in love with design with a pretty vast experience with tools like
      Photoshop, Illustrator and After effects as well as more web focused tools
      like Figma or Sketch.
    </span>
    <br />
    <br />
    <span>
      Currently working with the awesome{' '}
      <a
        href="https://www.icims.com/products/talent-cloud-platform/video-studio/"
        target="_blank"
        rel="noreferrer"
      >
        iCIMS Video Studio
      </a>{' '}
      team.
    </span>
    <br />
    <br />
    <span>Previous work:</span>
    <Ul>
      <Li>
        <a
          href="https://www.babelgroup.com/en"
          target="_blank"
          rel="noreferrer"
        >
          Babel <ExternalLink />
        </a>
        <Small>(2016-2020)</Small>
      </Li>
      <Li>
        <a href="https://z1.digital/" target="_blank" rel="noreferrer">
          Z1 <ExternalLink />
        </a>
        <Small>(2019-2022)</Small>
      </Li>
    </Ul>
    <br />
    <span>Tech Stack:</span>
    <Grid>
      <Li>React</Li>
      <Li>NextJS</Li>
      <Li>Vue</Li>
      <Li>Typescript</Li>
      <Li>WebPack</Li>
      <Li>Sass</Li>
      <Li>Jest</Li>
      <Li>Cypress</Li>
      <Li>MDX</Li>
      <Li>Strapi</Li>
      <Li>GraphQL</Li>
      <Li>Apollo</Li>
      <Li>NestJS</Li>
    </Grid>
  </Container>
);

export default Home;

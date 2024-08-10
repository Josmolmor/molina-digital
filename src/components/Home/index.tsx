import { ExternalLink } from 'react-feather';

import { Container, Grid, Li, Small, Ul } from './styles';

const Home = () => (
  <Container>
    <h1>Me</h1>
    <span>
      Software engineer born and based in Seville, Spain. Graduated on Computer
      Science from the University of Seville in 2016. Currently living with my
      wonderful girlfriend and my awesome black pomerania named Balú.
    </span>
    <h1>Engineering</h1>
    With {new Date().getFullYear() - 2016} years of experience on web
    development, I like to focus on up-to-date technologies while ensuring
    meticulous design and attention to detail.
    <br />
    <br />
    Focused primarily on front-end work due to its strong design component but
    also with experience working on back-end and full-stack projects.
    <h1>Management</h1>
    <span>
      During my time on Z1 I spent a decent amount of time co-managing the
      front-end development team, mentored junior developers, and handled
      performance evaluations and reviews while also doing my coding duties.
      <br />
      <br />
      While on iCIMS, I spent a year acting as Scrum Master where I helped the
      Product Manager during the grooming process ensuring smooth sprint
      planning and hosted Agile ceremonies like daily stand-ups, sprint reviews,
      and retrospectives.
    </span>
    <h1>Design</h1>
    <span>
      With a creative mind, I&apos;ve always been passionate about design and
      strive to integrate it into my daily work, both in visual design (UI) and
      in logical and functional aspects. I have extensive experience with
      industry-standard tools such as Photoshop, Illustrator, and After Effects,
      as well as web-focused tools like Figma and Sketch.
    </span>
    <h1>Experience</h1>
    <span>
      Started working as an intern on 2016 when I wasn&apos;t even done with my
      college degree and been happily coding since then.
      <br />
      <br />
      Currently working with the awesome{' '}
      <a
        href="https://www.icims.com/products/talent-cloud-platform/video-studio/"
        target="_blank"
        rel="noreferrer"
      >
        Video Studio
      </a>{' '}
      team (Feb 2022 - Present) under the{' '}
      <a href="https://www.icims.com/" target="_blank" rel="noreferrer">
        iCIMS
      </a>{' '}
      org.
    </span>
    <br />
    <br />
    <span>Previous work:</span>
    <Ul>
      <Li>
        <a href="https://z1.digital/" target="_blank" rel="noreferrer">
          Z1 <ExternalLink />
        </a>
        <Small>Jan 2019 - Feb 2022</Small>
      </Li>
      <Li>
        <a
          href="https://www.babelgroup.com/en"
          target="_blank"
          rel="noreferrer"
        >
          Babel <ExternalLink />
        </a>
        <Small>Mar 2016 - Jan 2019</Small>
      </Li>
    </Ul>
    <h1>Tech stack</h1>
    <Grid>
      {[
        'vue',
        'vite',
        'react',
        'nextjs',
        'angular',
        'typescript',
        'webpack',
        'sass',
        'jest',
        'vitest',
        'cypress',
        'circleci',
        'mabl',
        'browser extensions',
      ].map((string) => (
        <Li key={string}>{string}</Li>
      ))}
    </Grid>
  </Container>
);

export default Home;

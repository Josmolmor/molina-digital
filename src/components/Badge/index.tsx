import type { FC } from 'react';

import {
  ApolloLogo,
  Container,
  CypressLogo,
  GraphqlLogo,
  HtmlLogo,
  JavascriptLogo,
  JestLogo,
  MdxLogo,
  NestJsLogo,
  NextJsLogo,
  ReactLogo,
  SassLogo,
  StrapiLogo,
  TypescriptLogo,
  VueLogo,
  WebpackLogo,
  WordMark,
} from './styles';
import type Props from './types';

const Badge: FC<Props> = ({ title, color, children }) => {
  function handleContent() {
    switch (title.toLowerCase()) {
      default:
        return <></>;
      case 'react': {
        return <ReactLogo />;
      }
      case 'typescript':
        return <TypescriptLogo />;
      case 'nestjs':
        return <NestJsLogo />;
      case 'strapi':
        return <StrapiLogo />;
      case 'graphql':
        return <GraphqlLogo />;
      case 'apollo':
        return <ApolloLogo />;
      case 'liquid':
        return <WordMark>Liquid</WordMark>;
      case 'sass':
        return <SassLogo />;
      case 'javascript':
        return <JavascriptLogo />;
      case 'html':
        return <HtmlLogo />;
      case 'vue':
        return <VueLogo />;
      case 'webpack':
        return <WebpackLogo />;
      case 'mdx':
        return <MdxLogo />;
      case 'jest':
        return <JestLogo />;
      case 'cypress':
        return <CypressLogo />;
      case 'nextjs':
        return <NextJsLogo />;
    }
  }

  return (
    <Container title={title} $color={color}>
      {handleContent()}
      {children}
    </Container>
  );
};

export default Badge;

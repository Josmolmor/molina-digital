import type { FC } from 'react';

import {
  ApolloLogo,
  Container,
  GraphqlLogo,
  HtmlLogo,
  JavascriptLogo,
  NestJsLogo,
  ReactLogo,
  SassLogo,
  StrapiLogo,
  TypescriptLogo,
  WordMark,
} from './styles';
import type Props from './types';

const Badge: FC<Props> = ({ title, children }) => {
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
    }
  }

  return (
    <Container title={title}>
      {handleContent()}
      {children}
    </Container>
  );
};

export default Badge;

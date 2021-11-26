import {
  ApolloIcon,
  CypressIcon,
  GraphqlIcon,
  HtmlIcon,
  JavascriptIcon,
  JestIcon,
  MdxIcon,
  NestJsIcon,
  NextJsIcon,
  ReactIcon,
  SassIcon,
  StrapiIcon,
  TypescriptIcon,
  VueIcon,
  WebpackIcon,
} from 'components/Icons';
import styled, { css } from 'styled-components';
import addAlpha from 'utils/addAlpha';

export const Container = styled.div<{ $color?: string }>`
  background-color: ${({ theme }) => addAlpha(theme.colors.background, 0.75)};
  border-right: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;

  ${({ $color }) =>
    $color &&
    css`
      span, svg {
        color: ${$color}
      `};
`;

const commonSvgCss = css`
  height: 1.5rem;
  width: 1.5rem;
`;

export const NestJsLogo = styled(NestJsIcon)`
  ${commonSvgCss};
`;

export const ReactLogo = styled(ReactIcon)`
  ${commonSvgCss};
`;

export const TypescriptLogo = styled(TypescriptIcon)`
  ${commonSvgCss};
`;

export const StrapiLogo = styled(StrapiIcon)`
  ${commonSvgCss};
`;

export const GraphqlLogo = styled(GraphqlIcon)`
  ${commonSvgCss};
`;

export const ApolloLogo = styled(ApolloIcon)`
  ${commonSvgCss};
`;

export const SassLogo = styled(SassIcon)`
  ${commonSvgCss};
`;

export const JavascriptLogo = styled(JavascriptIcon)`
  ${commonSvgCss};
`;

export const HtmlLogo = styled(HtmlIcon)`
  ${commonSvgCss};
`;

export const VueLogo = styled(VueIcon)`
  ${commonSvgCss};
`;

export const WebpackLogo = styled(WebpackIcon)`
  ${commonSvgCss};
`;

export const MdxLogo = styled(MdxIcon)`
  ${commonSvgCss};
`;

export const JestLogo = styled(JestIcon)`
  ${commonSvgCss};
`;

export const CypressLogo = styled(CypressIcon)`
  ${commonSvgCss};
`;

export const NextJsLogo = styled(NextJsIcon)`
  ${commonSvgCss};
`;

export const WordMark = styled.span`
  color: ${({ theme }) => theme.colors.black};
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.weights.semiBold};
  pointer-events: none;
`;

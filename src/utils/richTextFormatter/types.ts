import type { PrismicRichText } from 'prismic-reactjs-custom/dist/es/RichText.model';
import type { ReactNode } from 'react';

export type HeadingObject = { [index: string]: ReactNode };

export type StyleTagSignature = (
  prismicText: PrismicRichText,
  styledComponent: ReactNode,
) => HeadingObject | never[];

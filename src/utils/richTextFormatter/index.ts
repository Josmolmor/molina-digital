import type { HeadingObject, StyleTagSignature } from './types';

/* Rich text formatter using styled components */
const styledTag: StyleTagSignature = (prismicText = [], styledComponent) => {
  if (prismicText && Array.isArray(prismicText) && prismicText.length > 0) {
    return prismicText.reduce((acc: HeadingObject, title) => {
      const newAcc = acc;
      newAcc[title.type] = styledComponent;
      return newAcc;
    }, {});
  }
  return [];
};

export default styledTag;

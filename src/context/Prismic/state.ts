import type { PrismicContextType } from 'context/Prismic/types';
import { createContext, useContext } from 'react';

export const prismicContextDefaultState: PrismicContextType = {
  projects: null,
  updateProjects: () => {},
};

export const PrismicContext = createContext<PrismicContextType>(
  prismicContextDefaultState,
);

export function usePrismic() {
  return useContext(PrismicContext);
}

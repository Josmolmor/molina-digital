import type { Result } from 'context/types';
import type { FC } from 'react';
import { useState } from 'react';

import { PrismicContext } from './state';

export const PrismicProvider: FC = ({ children }) => {
  const [result, setResults] = useState<Result | null>(null);

  return (
    <PrismicContext.Provider
      value={{
        projects: result,
        updateProjects: (docs: Result) => setResults(docs),
      }}
    >
      {children}
    </PrismicContext.Provider>
  );
};

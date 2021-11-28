import type { FC } from 'react';
import { useState } from 'react';

import { PrismicContext } from './state';
import type { Project, Result } from './types';

export const PrismicProvider: FC = ({ children }) => {
  const [result, setResults] = useState<Result<Project> | null>(null);

  return (
    <PrismicContext.Provider
      value={{
        projects: result,
        updateProjects: (docs: Result<Project>) => setResults(docs),
      }}
    >
      {children}
    </PrismicContext.Provider>
  );
};

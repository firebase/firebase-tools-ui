import { createContext, useContext } from 'react';

import { FirealertsTrigger } from '../models';

export const FirealertsContext = createContext<FirealertsTrigger[]>([]);

export const FirealertsProvider: React.FC<
  React.PropsWithChildren<{
    triggers: FirealertsTrigger[];
  }>
> = ({ children, triggers }) => {
  return (
    <FirealertsContext.Provider value={triggers}>
      {children}
    </FirealertsContext.Provider>
  );
};

export function useFirealerts() {
  return useContext(FirealertsContext);
}
import React, { createContext, useContext } from 'react';

const NamespaceContext = createContext('');

export const NamespaceProvider: React.FC<
  React.PropsWithChildren<{ namespace: string }>
> = ({ namespace, children }) => {
  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
};

export function useNamespace() {
  return useContext(NamespaceContext);
}

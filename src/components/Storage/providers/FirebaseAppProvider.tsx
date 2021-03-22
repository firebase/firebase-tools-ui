import '@firebase/storage';

import React, { useEffect, useMemo } from 'react';
import { FirebaseAppProvider } from 'reactfire';

import { getStorageApp } from '../../../firebase';
import { useStorageConfig } from '../api/useStorageConfig';

function useStorageApp() {
  const { host, port } = useStorageConfig();
  const app = useMemo(() => getStorageApp(host, port.toString()), [host, port]);

  useEffect(() => {
    return () => {
      app.delete();
    };
  }, [app]);

  return app;
}

export const StorageFirebaseAppProvider: React.FC = ({ children }) => {
  const app = useStorageApp();

  return (
    <FirebaseAppProvider firebaseApp={app}>{children}</FirebaseAppProvider>
  );
};

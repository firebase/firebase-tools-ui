import { _FirebaseApp } from '@firebase/app-types/private';
import { FirebaseAuthInternal } from '@firebase/auth-interop-types';
import { Component, ComponentType } from '@firebase/component';
import * as firebase from 'firebase/app';
import React from 'react';
import { useUnmount } from 'react-use';
import { FirebaseAppProvider } from 'reactfire';

interface Props {
  config: any;
  name: string;
  projectId: string;
}

export const FirebaseEmulatedAppProvider: React.FC<Props> = ({
  children,
  config,
  name,
  projectId,
}) => {
  // const baseUrl = `http://${config.hostAndPort}/v1/projects/${projectId}/databases/${databaseId}`;
  // const baseEmulatorUrl = `http://${config.hostAndPort}/emulator/v1/projects/${projectId}/databases/${databaseId}`;
  const app = firebase.initializeApp(
    { ...config, projectId },
    `${name} component::${JSON.stringify(config)}::${Math.random()}`
  );

  useUnmount(() => app.delete());

  applyAdminAuth(app);

  return (
    <FirebaseAppProvider firebaseApp={app}>{children}</FirebaseAppProvider>
  );
};

function applyAdminAuth(app: firebase.app.App): void {
  const accessToken = 'owner'; // Accepted as admin by emulators.
  const mockAuthComponent = new Component(
    'auth-internal',
    () =>
      ({
        getToken: async () => ({ accessToken: accessToken }),
        getUid: () => null,
        addAuthTokenListener: listener => {
          // Call listener once immediately with predefined
          // accessToken.
          listener(accessToken);
        },
        removeAuthTokenListener: () => {},
      } as FirebaseAuthInternal),
    'PRIVATE' as ComponentType
  );

  ((app as unknown) as _FirebaseApp)._addOrOverwriteComponent(
    mockAuthComponent
  );
}

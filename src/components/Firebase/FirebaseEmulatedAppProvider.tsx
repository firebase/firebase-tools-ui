import { _FirebaseApp } from '@firebase/app-types/private';
import { FirebaseAuthInternal } from '@firebase/auth-interop-types';
import { Component, ComponentType } from '@firebase/component';
import * as firebase from 'firebase/app';
import { useEffect } from 'react';

import { useProjectId } from '../../store/config/selectors';

export function useEmulatedFirebaseApp(name: string, config: any) {
  const projectId = useProjectId();
  const app = firebase.initializeApp(
    { ...config, projectId },
    `${name} component::${JSON.stringify(config)}::${Math.random()}`
  );

  useEffect(() => {
    return () => {
      app.delete();
    };
  }, [app]);

  applyAdminAuth(app);

  return app;
}

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

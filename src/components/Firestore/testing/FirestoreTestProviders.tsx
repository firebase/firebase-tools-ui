import * as firebaseTesting from '@firebase/testing';
import { render, waitForElement } from '@testing-library/react';
import * as firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseAppProvider, preloadFirestore, useFirestore } from 'reactfire';

import configureStore from '../../../configureStore';
import { fetchSuccess } from '../../../store/config/actions';

interface RenderOptions {
  path?: string;
}

export const renderWithFirestore = async (
  children: (
    firestore: firebase.firestore.Firestore
  ) => Promise<React.ReactElement>,
  options: RenderOptions = {}
) => {
  const component = render(
    <FirestoreTestProviders path={options.path}>
      <AsyncFirestore>{children}</AsyncFirestore>
    </FirestoreTestProviders>
  );

  await waitForElement(() => component.findByTestId('firestore-foo'));

  return component;
};

export const FirestoreTestProviders: React.FC<RenderOptions> = React.memo(
  ({ children, path = '' }) => {
    const projectId = `${process.env.GCLOUD_PROJECT}-${Date.now()}`;
    const hostAndPort =
      process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FIREBASE_FIRESTORE_EMULATOR_ADDRESS;
    if (!projectId || !hostAndPort) {
      throw new Error('FirestoreTestProviders requires a running Emulator');
    }
    const [host, port] = hostAndPort.split(':');

    const store = configureStore();
    store.dispatch(
      fetchSuccess({
        projectId,
        firestore: {
          hostAndPort,
          host,
          port: Number(port),
        },
      })
    );

    const testingApp = firebaseTesting.initializeTestApp({
      projectId,
    });

    useEffect(() => {
      return () => {
        testingApp.delete();
      };
    }, []);

    return (
      <Provider store={store}>
        <FirebaseAppProvider firebaseApp={testingApp}>
          <MemoryRouter initialEntries={[path]}>
            <React.Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
              {children}
            </React.Suspense>
          </MemoryRouter>
        </FirebaseAppProvider>
      </Provider>
    );
  }
);

const AsyncFirestore: React.FC<{
  children: (
    firestore: firebase.firestore.Firestore
  ) => Promise<React.ReactElement>;
}> = React.memo(({ children }) => {
  const firestore = useFirestore();
  const [childrenFoo, setChildrenFoo] = useState<React.ReactElement | null>(
    null
  );

  useEffect(() => {
    children(firestore).then(c => setChildrenFoo(c));
  }, [children, firestore, setChildrenFoo]);

  return childrenFoo ? (
    <div data-testid="firestore-foo">{childrenFoo}</div>
  ) : null;
});

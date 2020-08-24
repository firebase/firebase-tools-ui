import * as firebaseTesting from '@firebase/testing';
import * as firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseAppProvider, preloadFirestore, useFirestore } from 'reactfire';

import configureStore from '../../../configureStore';
import { fetchSuccess } from '../../../store/config/actions';

/**
 * @jest-environment node
 */

interface Props extends MemoryRouterProps {
  data?: { [key: string]: firebase.firestore.DocumentData };
}

export const FirestoreProviders: React.FC<Props> = ({
  data = {},
  children,
  ...props
}) => {
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

  const app = firebaseTesting.initializeTestApp({
    projectId,
  });

  useEffect(() => {
    return () => {
      app.delete();
    };
  }, []);

  return (
    <Provider store={store}>
      <FirebaseAppProvider firebaseApp={app}>
        <MemoryRouter {...props}>
          <React.Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
            <FirebaseSeed data={data}>{children}</FirebaseSeed>
          </React.Suspense>
        </MemoryRouter>
      </FirebaseAppProvider>
    </Provider>
  );
};

const FirebaseSeed: React.FC<{ data: firebase.firestore.DocumentData }> = ({
  data,
  children,
}) => {
  const [seeding, setSeeding] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    const seedPromise = Promise.all(
      Object.entries(data).map(([key, value]) => firestore.doc(key).set(value))
    );
    seedPromise.then(() => {
      setSeeding(false);
    });
  }, []);

  return seeding ? null : <>{children}</>;
};

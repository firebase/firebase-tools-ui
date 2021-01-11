/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { render, waitFor } from '@testing-library/react';
import firebase from 'firebase';
import React, { Suspense, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { useFirestore } from 'reactfire';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import { FirestoreEmulatedApiProvider } from '../FirestoreEmulatedApiProvider';

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
      <AsyncFirestore r={children}></AsyncFirestore>
    </FirestoreTestProviders>
  );

  await waitFor(() => component.getByTestId(ASYNC_FIRESTORE_WRAPPER_TEST_ID), {
    // Some test setup can take longer than default 1000ms (esp. cold starts).
    timeout: 5000,
  });

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
    const store = configureStore<Pick<AppState, 'config'>>()({
      config: {
        loading: false,
        result: {
          data: {
            projectId,
            firestore: { hostAndPort, host, port: Number(port) },
          },
        },
      },
    });

    return (
      <Provider store={store}>
        <FirestoreEmulatedApiProvider disableDevTools>
          <MemoryRouter initialEntries={[path]}>
            <Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
              {children}
            </Suspense>
          </MemoryRouter>
        </FirestoreEmulatedApiProvider>
      </Provider>
    );
  }
);

const ASYNC_FIRESTORE_WRAPPER_TEST_ID = 'AsyncFirestore-wrapper';

const AsyncFirestore: React.FC<{
  r: (firestore: firebase.firestore.Firestore) => Promise<React.ReactElement>;
}> = React.memo(({ r }) => {
  const firestore = useFirestore();
  const [
    firestoreChildren,
    setFirestoreChildren,
  ] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    r(firestore).then((c) => setFirestoreChildren(c));
  }, [r, firestore, setFirestoreChildren]);

  return firestoreChildren ? (
    <div data-testid={ASYNC_FIRESTORE_WRAPPER_TEST_ID}>{firestoreChildren}</div>
  ) : null;
});

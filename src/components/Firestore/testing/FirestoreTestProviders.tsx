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

import { render } from '@testing-library/react';
import firebase from 'firebase';
import React, { Suspense, useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useFirestore } from 'reactfire';

import { AppState } from '../../../store';
import { makeDeferred } from '../../../test_utils';
import { TestEmulatorConfigProvider } from '../../common/EmulatorConfigProvider';
import { FirestoreEmulatedApiProvider } from '../FirestoreEmulatedApiProvider';

interface RenderOptions {
  path?: string;
  state?: Partial<AppState>;
}

export const renderWithFirestore = async (
  children: (
    firestore: firebase.firestore.Firestore
  ) => Promise<React.ReactElement>,
  { path, state }: RenderOptions = {}
) => {
  const errorDeferred = makeDeferred();
  const component = render(
    <FirestoreTestProviders path={path} state={state}>
      <AsyncFirestore
        r={children}
        onError={(e) => errorDeferred.reject(e)}
      ></AsyncFirestore>
    </FirestoreTestProviders>
  );

  await Promise.race([
    errorDeferred.promise,
    component.findByTestId(
      ASYNC_FIRESTORE_WRAPPER_TEST_ID,
      {},
      {
        // Some test setup can take longer than default 1000ms (esp. cold starts).
        timeout: 5000,
      }
    ),
  ]);

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

    return (
      <TestEmulatorConfigProvider
        config={{
          projectId,
          firestore: { host, port: Number(port), hostAndPort },
        }}
      >
        <FirestoreEmulatedApiProvider disableDevTools>
          <MemoryRouter initialEntries={[path]}>
            <Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
              {children}
            </Suspense>
          </MemoryRouter>
        </FirestoreEmulatedApiProvider>
      </TestEmulatorConfigProvider>
    );
  }
);

const ASYNC_FIRESTORE_WRAPPER_TEST_ID = 'AsyncFirestore-wrapper';

const AsyncFirestore: React.FC<{
  r: (firestore: firebase.firestore.Firestore) => Promise<React.ReactElement>;
  onError: (e: Error) => void;
}> = React.memo(({ r, onError }) => {
  const firestore = useFirestore();
  const [
    firestoreChildren,
    setFirestoreChildren,
  ] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    r(firestore)
      .then((c) => setFirestoreChildren(c))
      .catch(onError);
  }, [r, firestore, setFirestoreChildren]);

  return firestoreChildren ? (
    <div data-testid={ASYNC_FIRESTORE_WRAPPER_TEST_ID}>{firestoreChildren}</div>
  ) : null;
});

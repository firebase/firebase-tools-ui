/**
 * Copyright 2021 Google LLC
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

import { FirebaseApp } from 'firebase/app';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import React, { useCallback } from 'react';
import {
  FirebaseAppProvider,
  StorageProvider,
  useFirebaseApp,
} from 'reactfire';

import { useEmulatedFirebaseApp } from '../../../firebase';
import { useEmulatorConfig } from '../../common/EmulatorConfigProvider';

const FIREBASE_APP_OPTIONS = {};

export const StorageFirebaseAppProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { host, port } = useEmulatorConfig('storage');
  const app = useEmulatedFirebaseApp(
    'storage',
    FIREBASE_APP_OPTIONS,
    useCallback(
      (app: FirebaseApp) => {
        connectStorageEmulator(getStorage(app), host, port, {
          mockUserToken: 'owner',
        });
      },
      [host, port]
    )
  );

  if (!app) {
    return null;
  }

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <StorageComponent>{children}</StorageComponent>
    </FirebaseAppProvider>
  );
};

const StorageComponent: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const app = useFirebaseApp(); // a parent component contains a `FirebaseAppProvider`
  const storage = getStorage(app);
  return <StorageProvider sdk={storage}>{children}</StorageProvider>;
};

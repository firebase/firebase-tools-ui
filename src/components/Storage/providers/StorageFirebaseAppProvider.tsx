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
import {
  FirebaseStorage,
  connectStorageEmulator,
  getStorage,
} from 'firebase/storage';
import React, { useCallback, useState } from 'react';
import { FirebaseAppProvider, StorageProvider } from 'reactfire';

import { useEmulatedFirebaseApp } from '../../../firebase';
import { useEmulatorConfig } from '../../common/EmulatorConfigProvider';

const FIREBASE_APP_OPTIONS = {
  storageBucket: 'foo.appspot.com',
};

export const StorageFirebaseAppProvider: React.FC<
  React.PropsWithChildren<{ bucket?: string }>
> = ({ bucket, children }) => {
  const { host, port } = useEmulatorConfig('storage');
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const app = useEmulatedFirebaseApp(
    'storage',
    FIREBASE_APP_OPTIONS,
    useCallback(
      (app: FirebaseApp) => {
        const storage = bucket
          ? getStorage(app, `gs://other.appspot.com`)
          : getStorage(app);
        connectStorageEmulator(storage, host, port, {
          mockUserToken: 'owner',
        });
        setStorage(storage);
      },
      [host, port]
    )
  );

  if (!app || !storage) {
    return null;
  }

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <StorageComponent storage={storage}>{children}</StorageComponent>
    </FirebaseAppProvider>
  );
};

const StorageComponent: React.FC<
  React.PropsWithChildren<{ storage: FirebaseStorage }>
> = ({ storage, children }) => {
  return <StorageProvider sdk={storage}>{children}</StorageProvider>;
};

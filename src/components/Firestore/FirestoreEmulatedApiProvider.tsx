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

import firebase from 'firebase';
import React, { Suspense, useEffect, useState } from 'react';
import {
  FirebaseAppProvider,
  preloadFirestore,
  useFirebaseApp,
  useFirestore,
} from 'reactfire';
import { mutate } from 'swr';

import { useEmulatedFirebaseApp } from '../../firebase';
import { useFirestoreConfig, useProjectId } from '../../store/config/selectors';
import { Spinner } from '../common/Spinner';
import { useFetcher, useRequest } from '../common/useRequest';
import { MissingDocument } from './models';

interface WindowWithFirestore extends Window {
  firestore?: firebase.firestore.Firestore;
}

/**
 * Provide a local-FirebaseApp with a FirestoreSDK connected to
 * the Emulator Hub.
 */
export const FirestoreEmulatedApiProvider: React.FC<{
  disableDevTools?: boolean;
}> = React.memo(({ children, disableDevTools }) => {
  const config = useFirestoreConfig();
  const app = useEmulatedFirebaseApp('firestore', config);

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <Suspense
        fallback={<Spinner message="Loading Firestore SDK" span={12} />}
      >
        <FirestoreEmulatorSettings>
          {children}
          {disableDevTools || <FirestoreDevTools />}
        </FirestoreEmulatorSettings>
      </Suspense>
    </FirebaseAppProvider>
  );
});

// Connect FirestoreSDK to Emulator Hub
const FirestoreEmulatorSettings: React.FC = React.memo(({ children }) => {
  const [connected, setConnected] = useState(false);
  const firebaseApp = useFirebaseApp();
  // TODO: update config to always have a firestore-config obj
  const config = useFirestoreConfig()!;

  useEffect(() => {
    preloadFirestore({
      firebaseApp,
      setup: firestore => firestore().useEmulator(config.host, config.port),
    }).then(() => setConnected(true));
  }, [firebaseApp, config]);

  return connected ? <>{children}</> : null;
});

const FirestoreDevTools: React.FC = React.memo(() => {
  const firestore = useFirestore();

  useEffect(() => {
    const windowWithFirestore = window as WindowWithFirestore;
    windowWithFirestore.firestore = firestore;
    console.log(`🔥 Firestore is available at window.firestore.

    Try:
    firestore.doc('hello/world').set({hello: 'world!'});
    firestore.doc('hello/world').get().then( snap => console.log(snap.data()) );`);

    return () => {
      delete windowWithFirestore.firestore;
    };
  }, [firestore]);

  return null;
});

function useFirestoreRestApi() {
  // TODO: update config to always have a firestore-config obj
  const config = useFirestoreConfig()!;
  const projectId = useProjectId();
  const databaseId = '(default)';

  return {
    baseUrl: `http://${config.hostAndPort}/v1/projects/${projectId}/databases/${databaseId}`,
    baseEmulatorUrl: `http://${config.hostAndPort}/emulator/v1/projects/${projectId}/databases/${databaseId}`,
  };
}

export function useRootCollections() {
  const { baseUrl } = useFirestoreRestApi();
  const firestore = useFirestore();
  const url = `${baseUrl}/documents:listCollectionIds`;

  const { data } = useRequest<{ collectionIds: string[] }>(
    url,
    {
      method: 'POST',
    },
    {
      refreshInterval: 10_000,
    }
  );

  const collectionIds = data?.collectionIds || [];
  return collectionIds.map(id => firestore.collection(id));
}

export function useSubCollections(
  docRef: firebase.firestore.DocumentReference
) {
  const { baseUrl } = useFirestoreRestApi();
  const encodedPath = encodePath(docRef.path);
  const url = `${baseUrl}/documents/${encodedPath}:listCollectionIds`;

  const { data } = useRequest<{ collectionIds: string[] }>(
    url,
    {
      method: 'POST',
    },
    {
      refreshInterval: 10_000,
    }
  );

  const collectionIds = data?.collectionIds || [];
  return collectionIds.map(id => docRef.collection(id));
}

const DOCUMENT_PATH_RE = /projects\/(?<project>.*)\/databases\/(?<database>.*)\/documents\/(?<path>.*)/;

export function useMissingDocuments(
  collection: firebase.firestore.CollectionReference
): MissingDocument[] {
  const { baseUrl } = useFirestoreRestApi();
  const encodedPath = encodePath(collection.path);
  const url = `${baseUrl}/documents/${encodedPath}?mask.fieldPaths=_none_&pageSize=300&showMissing=true`;

  const { data } = useRequest<{
    documents: { name: string; createTime?: string }[];
  }>(
    url,
    {
      method: 'GET',
    },
    {
      refreshInterval: 10_000,
    }
  );

  return (
    data?.documents
      ?.filter(d => !d.createTime)
      .map(d => {
        const [, , , path] = DOCUMENT_PATH_RE.exec(d.name);
        return { path };
      }) || []
  );
}

export function useEjector() {
  const { baseEmulatorUrl } = useFirestoreRestApi();
  const url = `${baseEmulatorUrl}/documents`;

  const fetcher = useFetcher({
    method: 'DELETE',
  });

  return async () => {
    mutate('*');
    return await fetcher(url);
  };
}

function encodePath(path: string): string {
  return path
    .split('/')
    .map(uri => encodeURIComponent(uri))
    .join('/');
}

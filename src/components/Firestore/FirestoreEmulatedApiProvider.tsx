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

import { FirebaseApp } from 'firebase/app';
import {
  CollectionReference,
  DocumentReference,
  collection,
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';
import React, { useCallback } from 'react';
import {
  FirebaseAppProvider,
  FirestoreProvider,
  useFirebaseApp,
  useFirestore,
} from 'reactfire';
import { mutate } from 'swr';

import { useEmulatedFirebaseApp } from '../../firebase';
import { useConfig, useEmulatorConfig } from '../common/EmulatorConfigProvider';
import { useFetcher, useRequest } from '../common/useRequest';
import { MissingDocument } from './models';
import { useLocation } from 'react-router-dom';

const FIRESTORE_OPTIONS = {};

/**
 * Provide a local-FirebaseApp with a FirestoreSDK connected to
 * the Emulator Hub.
 */
export const FirestoreEmulatedApiProvider: React.FC<
  React.PropsWithChildren<{}>
> = React.memo(({ children }) => {
  const config = useEmulatorConfig('firestore');
  const app = useEmulatedFirebaseApp(
    'firestore',
    FIRESTORE_OPTIONS,
    useCallback(
      (app: FirebaseApp) => {
        const firestore = getFirestore(app);
        connectFirestoreEmulator(firestore, config.host, config.port, {
          mockUserToken: 'owner',
        });
      },
      [config]
    )
  );
  if (!app) {
    return null;
  }

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <FirestoreComponent>{children}</FirestoreComponent>
    </FirebaseAppProvider>
  );
});

const FirestoreComponent: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const app = useFirebaseApp();

  const firestore = getFirestore(app, useDatabaseId());
  console.log("emulatedApiProvider, firestore DB is:  " + JSON.stringify(firestore))
  return <FirestoreProvider sdk={firestore}>{children}</FirestoreProvider>;
};

function useFirestoreRestApi() {
  const config = useEmulatorConfig('firestore');
  const { projectId } = useConfig();

  return {
    baseUrl: `//${config.hostAndPort}/v1/projects/${projectId}/databases/${useDatabaseId()}`,
    baseEmulatorUrl: `//${config.hostAndPort}/emulator/v1/projects/${projectId}/databases/${useDatabaseId()}`,
  };
}

export function useDatabaseId(): string {
  var databaseId = useLocation().pathname.split("/")[2];
  if (databaseId === "default") {
    databaseId = "(default)";
  }
  return databaseId;
}

export function useRootCollections() {
  const { baseUrl } = useFirestoreRestApi();
  const firestore = useFirestore(); // FIXME1 this firestore is incorrect
  console.log("inside useRootCollections, Firestore is " + JSON.stringify(firestore))
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
  return collectionIds.map((id) => collection(firestore, id));
}

export function useSubCollections(docRef: DocumentReference) {
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
  return collectionIds.map((id) => collection(docRef, id));
}

const DOCUMENT_PATH_RE =
  /projects\/(?<project>.*)\/databases\/(?<database>.*)\/documents\/(?<path>.*)/;

export function useMissingDocuments(
  collection: CollectionReference
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
      ?.filter((d) => !d.createTime)
      .map((d) => {
        const match = DOCUMENT_PATH_RE.exec(d.name);
        if (!match) {
          throw new Error(
            `Document path "${d.name}" returned by API does not match regex.`
          );
        }
        const [, , , path] = match;
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

export function useRecursiveDelete() {
  const { baseEmulatorUrl } = useFirestoreRestApi();
  const fetcher = useFetcher({
    method: 'DELETE',
  });

  return async (ref: CollectionReference | DocumentReference) => {
    mutate('*');
    const encodedPath = encodePath(ref.path);
    const url = `${baseEmulatorUrl}/documents/${encodedPath}`;
    return await fetcher(url);
  };
}

function encodePath(path: string): string {
  return path
    .split('/')
    .map((uri) => encodeURIComponent(uri))
    .join('/');
}

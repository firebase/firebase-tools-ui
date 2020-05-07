/**
 * Copyright 2019 Google LLC
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

import useFetch from 'fetch-suspense';
import { firestore } from 'firebase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirestore } from 'reactfire';

import { FirestoreConfig } from '../../store/config';

interface FirestoreRestApiProps {
  projectId: string;
  databaseId: string;
  config: FirestoreConfig;
}

const ApiContext = createContext<FirestoreRestApiProps | null>(null);
const DocumentContext = createContext<string | null>(null);

export const FirestoreRestApi: React.FC<FirestoreRestApiProps> = ({
  children,
  ...rest
}) => {
  const firestore = useFirestore();
  firestore.settings({
    host: rest.config.hostAndPort,
    ssl: false,
  });
  return <ApiContext.Provider value={rest}>{children}</ApiContext.Provider>;
};

export const DocumentCtx: React.FC<{ path: string }> = ({ path, children }) => {
  return (
    <DocumentContext.Provider value={path}>{children}</DocumentContext.Provider>
  );
};

function useFirestoreRestApi() {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('You are missing a <FirestoreRestApi> provider.');
  }
  return api;
}

function useDocumentContext() {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('You are missing a <FirestoreRestApi> provider.');
  }
  return api;
}

export function useRootCollections() {
  const api = useFirestoreRestApi();

  const response = useFetch(
    `http://${api.config.hostAndPort}/v1/projects/${api.projectId}/databases/${api.databaseId}/documents:listCollectionIds`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json',
      },
    }
  );
  return response;
}

export function useCollectionsNew(documentRef?: firestore.DocumentReference) {
  const api = useFirestoreRestApi();
  const firestore = useFirestore();

  const [collections, setCollections] = useState<
    firestore.CollectionReference[]
  >([]);

  const baseUrl = `http://${api.config.hostAndPort}/v1/projects/${api.projectId}/databases/${api.databaseId}`;

  const { collectionIds = [] } = useFetch(
    `${baseUrl}/${
      documentRef
        ? `documents/${documentRef.path}:listCollectionIds`
        : 'documents:listCollectionIds'
    }`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json',
      },
    },
    {
      lifespan: 0,
    }
  ) as { collectionIds: string[] };

  useEffect(() => {
    if (documentRef) {
      setCollections(collectionIds.map(id => documentRef.collection(id)));
    } else {
      setCollections(collectionIds.map(id => firestore.collection(id)));
    }
  }, [documentRef, setCollections]);

  return collections;
}

import { firestore } from 'firebase/app';
import React, { Suspense, useEffect } from 'react';
import { FirebaseAppProvider, useFirestore } from 'reactfire';
import useSwr from 'swr';

import { useEmulatedFirebaseApp } from '../../firebase';
import { useFirestoreConfig, useProjectId } from '../../store/config/selectors';

interface WindowWithFirestore extends Window {
  firestore?: firebase.firestore.Firestore;
}

/**
 * Provide a local-FirebaseApp with a FirestoreSDK connected to
 * the Emulator Hub.
 */
export const FirestoreEmulatedApiProvider: React.FC = React.memo(props => {
  const config = useFirestoreConfig();
  const app = useEmulatedFirebaseApp('firestore', config);

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <Suspense fallback={<div>Loading Firestore SDK</div>}>
        <FirestoreEmulatorSettings {...props} />
        <FirestoreDevTools />
      </Suspense>
    </FirebaseAppProvider>
  );
});

// Connect FirestoreSDK to Emulator Hub
const FirestoreEmulatorSettings: React.FC = React.memo(({ children }) => {
  const firestore = useFirestore();
  const config = useFirestoreConfig();

  firestore.settings({
    host: config.hostAndPort,
    ssl: false,
  });

  return <>{children}</>;
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
  const config = useFirestoreConfig();
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
  const endpoint = `${baseUrl}/documents:listCollectionIds`;

  const fetcher = (url: string) =>
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json',
      },
    }).then(r => r.json());

  const { data } = useSwr<{ collectionIds: string[] }>(endpoint, fetcher, {
    refreshInterval: 10000,
    suspense: true,
  });

  const collectionIds = data?.collectionIds || [];
  return collectionIds.map(id => firestore.collection(id));
}

export function useSubCollections(docRef: firestore.DocumentReference) {
  const { baseUrl } = useFirestoreRestApi();
  const encodedPath = docRef.path; // TODO: Encode each segment
  const endpoint = `${baseUrl}/documents/${encodedPath}:listCollectionIds`;

  const fetcher = (url: string) =>
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json',
      },
    }).then(r => r.json());

  const { data } = useSwr<{ collectionIds: string[] }>(endpoint, fetcher, {
    refreshInterval: 10000,
    suspense: true,
  });

  const collectionIds = data?.collectionIds || [];
  return collectionIds.map(id => docRef.collection(id));
}

export function useEjector() {
  const { baseEmulatorUrl } = useFirestoreRestApi();
  const endpoint = `${baseEmulatorUrl}/documents`;

  return async () => {
    await fetch(endpoint, {
      method: 'DELETE',
      body: JSON.stringify({}),
      headers: {
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json',
      },
    });
  };
}

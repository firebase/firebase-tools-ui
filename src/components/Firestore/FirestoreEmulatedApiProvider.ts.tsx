import { firestore } from 'firebase/app';
import React, { Suspense } from 'react';
import { useFirestore } from 'reactfire';

import { FirebaseEmulatedAppProvider } from '../Firebase/FirebaseEmulatedAppProvider';

interface Props {
  config: any;
  projectId: string;
}

export const FirestoreEmulatedApiProvider: React.FC<Props> = ({
  children,
  config,
  projectId,
}) => {
  return (
    <Suspense fallback={<div>Loading Firestore SDK</div>}>
      <FirebaseEmulatedAppProvider
        config={config}
        name="Firestore"
        projectId={projectId}
      >
        <FirestoreSettings config={config}>{children}</FirestoreSettings>
      </FirebaseEmulatedAppProvider>
    </Suspense>
  );
};

const FirestoreSettings: React.FC<{ config: any }> = ({ children, config }) => {
  const firestore = useFirestore();
  firestore.settings({
    host: config.hostAndPort, // TODO get config
    ssl: false,
  });

  return <>{children}</>;
};

export function useRootCollections() {
  const firestore = useFirestore();
  // request collectionIds
  const collectionsIds = ['forks'];
  return collectionsIds.map(id => firestore.collection(id));
}

export function useSubCollections(docRef: firestore.DocumentReference) {
  const encodedPath = docRef.path; // TODO: Encode each segment
  // requestCollectionIds
  const collectionIds = ['b'];
  return collectionIds.map(id => docRef.collection(id));
}

// export function useNuke... maybe a reducer?

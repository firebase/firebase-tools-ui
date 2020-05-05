import { firestore } from 'firebase';

import { FirestoreApi } from '../models';

export function fakeDocumentReference({
  id = '',
  path = '',
  collectionDoc = () => {},
} = {}): firestore.DocumentReference {
  return ({
    id,
    path,
    collection: (collectionPath: string) =>
      fakeCollectionReference({
        id: collectionPath,
        path: `${path}/${collectionPath}`,
        doc: collectionDoc,
      }),
    update: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
  } as unknown) as firestore.DocumentReference;
}

export function fakeDocumentSnapshot({
  id = '',
  data = undefined as firestore.DocumentData | undefined,
  ref = {} as firestore.DocumentReference,
} = {}): firestore.DocumentSnapshot {
  return ({
    ref,
    id,
    data: (options?: firestore.SnapshotOptions) => data,
  } as unknown) as firestore.DocumentSnapshot;
}

export type FakeCollectionReference = firestore.CollectionReference & {
  setSnapshot: (snapshot: firestore.DocumentSnapshot) => void;
};

export function fakeCollectionReference({
  id = '',
  doc = () => {},
  path = '',
  where = jest.fn(),
  orderBy = jest.fn(),
} = {}): FakeCollectionReference {
  let thisObserver = (snapshot: firestore.DocumentSnapshot) => {};

  return ({
    id,
    doc,
    path,
    onSnapshot: (observer: any) => {
      thisObserver = observer;
      return () => {};
    },
    setSnapshot: (snapshot: firestore.DocumentSnapshot) =>
      thisObserver(snapshot),
    where,
    orderBy,
  } as unknown) as FakeCollectionReference;
}

export type FakeFirestoreApi = FirestoreApi & {
  setCollections: (collections: firestore.CollectionReference[]) => void;
};

export function fakeFirestoreApi({
  projectId = '',
  databaseId = '',
} = {}): FakeFirestoreApi {
  let resolveCollections: (
    collections: firestore.CollectionReference[]
  ) => void = () => [];

  const collectionsPromise = new Promise(
    (resolve: (collections: firestore.CollectionReference[]) => void) => {
      resolveCollections = resolve;
    }
  );

  return {
    projectId,
    databaseId,
    database: ({
      collection: (id: string) => fakeCollectionReference({ id }),
    } as unknown) as firestore.Firestore,
    delete: async () => {},
    getCollections: () => collectionsPromise,
    setCollections: (collections: firestore.CollectionReference[]) => {
      resolveCollections(collections);
    },
  };
}

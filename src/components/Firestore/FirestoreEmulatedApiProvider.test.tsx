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

import {
  act,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import {
  CollectionReference,
  DocumentReference,
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';
import React from 'react';
import { useFirestoreDocData } from 'reactfire';

import {
  useEjector,
  useMissingDocuments,
  useRecursiveDelete,
  useRootCollections,
  useSubCollections,
} from './FirestoreEmulatedApiProvider';
import { renderWithFirestore } from './testing/FirestoreTestProviders';

it('should get root-collections', async () => {
  const TestResults = () => {
    const collections = useRootCollections();
    return (
      <div data-testid="collections">{collections.map((c) => c.id).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async (firestore) => {
      await setDoc(doc(firestore, 'things/a'), { a: 1 });
      await setDoc(doc(firestore, 'others/a'), { a: 1 });
      return <TestResults />;
    }
  );

  await waitFor(() => getByText(/others/));

  expect(getByTestId(/collections/).textContent).toBe('others,things');
});

it('should get sub-collections', async () => {
  const TestResults = ({ docRef }: { docRef: DocumentReference }) => {
    const collections = useSubCollections(docRef);
    return (
      <div data-testid="collections">{collections.map((c) => c.id).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async (firestore) => {
      const docRef = doc(firestore, 'top/doc');
      await setDoc(doc(collection(docRef, 'things'), 'a'), { a: 1 });
      await setDoc(doc(collection(docRef, 'others'), 'a'), { a: 1 });
      return <TestResults docRef={docRef} />;
    }
  );

  await waitFor(() => getByText(/others/));

  expect(getByTestId(/collections/).textContent).toBe('others,things');
});

it('should get sub-collections with special characters inside URI', async () => {
  const TestResults = ({ docRef }: { docRef: DocumentReference }) => {
    const collections = useSubCollections(docRef);
    return (
      <div data-testid="collections">{collections.map((c) => c.id).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async (firestore) => {
      const docRef = doc(firestore, 'top/doc _!@#$_');
      await setDoc(doc(collection(docRef, 'things'), 'a'), { a: 1 });
      await setDoc(doc(collection(docRef, 'others'), 'a'), { a: 1 });
      return <TestResults docRef={docRef} />;
    }
  );

  await waitFor(() => getByText(/others/));

  expect(getByTestId(/collections/).textContent).toBe('others,things');
});

it('should get missing-documents', async () => {
  const TestResults: React.FC<
    React.PropsWithChildren<{
      collection: CollectionReference;
    }>
  > = ({ collection }) => {
    const documents = useMissingDocuments(collection);
    return (
      <div data-testid="documents">{documents.map((d) => d.path).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async (firestore) => {
      await setDoc(doc(firestore, 'foo/bar'), { a: 1 });
      await setDoc(doc(firestore, 'foo/bar/deep/egg'), { a: 1 });
      await setDoc(doc(firestore, 'foo/hidden/deep/egg'), { a: 1 });
      return <TestResults collection={collection(firestore, 'foo')} />;
    }
  );

  await waitFor(() => getByText(/hidden/));

  expect(getByTestId(/documents/).textContent).toBe('foo/hidden');
});

it('should clear the database', async () => {
  const TestResults = ({ docRef }: { docRef: DocumentReference }) => {
    const { data } = useFirestoreDocData(docRef);
    const eject = useEjector();

    return (
      <>
        <div data-testid="data">{JSON.stringify(data)}</div>
        <button onClick={() => eject()}>Clear</button>
      </>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async (firestore) => {
      const docRef = doc(firestore, 'top/doc');
      await setDoc(docRef, { a: 1 });
      return <TestResults docRef={docRef} />;
    }
  );

  await waitFor(() => getByText(/"a":1/));

  act(() => {
    getByText(/Clear/).click();
  });

  await waitForElementToBeRemoved(() => getByText(/"a":1/));

  expect(getByTestId(/data/).textContent).not.toContain('"a":1');
});

it('should recursively delete under path', async () => {
  const TestResults = ({
    docRef,
    nestedRef,
  }: {
    docRef: DocumentReference;
    nestedRef: DocumentReference;
  }) => {
    const { data } = useFirestoreDocData(docRef);
    const nested = useFirestoreDocData(nestedRef);
    const recursiveDelete = useRecursiveDelete();

    return (
      <>
        <div data-testid="data">{JSON.stringify(data)}</div>
        <div data-testid="nestedData">{JSON.stringify(nested.data)}</div>
        <button onClick={() => recursiveDelete(docRef)}>Delete</button>
      </>
    );
  };

  const { getByText, getByTestId, findByText } = await renderWithFirestore(
    async (firestore) => {
      const docRef = doc(firestore, 'top/doc');
      await setDoc(docRef, { a: 1 });
      const nestedRef = doc(collection(docRef, 'nested'), 'nestedDoc');
      await setDoc(nestedRef, { b: 2 });
      return <TestResults docRef={docRef} nestedRef={nestedRef} />;
    }
  );

  await findByText(/"a":1/);
  await findByText(/"b":2/);

  act(() => {
    getByText(/Delete/).click();
  });

  await waitForElementToBeRemoved(() => getByText(/"b":2/));

  expect(getByTestId(/data/).textContent).not.toContain('"a":1');
  expect(getByTestId(/nestedData/).textContent).not.toContain('"b":2');
});

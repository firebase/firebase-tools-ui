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
  waitForElement,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import firebase from 'firebase';
import React from 'react';
import { useFirestoreDocData } from 'reactfire';

import {
  useEjector,
  useMissingDocuments,
  useRootCollections,
  useSubCollections,
} from './FirestoreEmulatedApiProvider';
import { renderWithFirestore } from './testing/FirestoreTestProviders';

it('should get root-collections', async () => {
  const TestResults = () => {
    const collections = useRootCollections();
    return (
      <div data-testid="collections">{collections.map(c => c.id).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async firestore => {
      await firestore.doc('things/a').set({ a: 1 });
      await firestore.doc('others/a').set({ a: 1 });
      return <TestResults />;
    }
  );

  await waitForElement(() => getByText(/others/));

  expect(getByTestId(/collections/).textContent).toBe('others,things');
});

it('should get sub-collections', async () => {
  const TestResults = ({
    docRef,
  }: {
    docRef: firebase.firestore.DocumentReference;
  }) => {
    const collections = useSubCollections(docRef);
    return (
      <div data-testid="collections">{collections.map(c => c.id).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async firestore => {
      const docRef = firestore.doc('top/doc');
      await docRef
        .collection('things')
        .doc('a')
        .set({ a: 1 });
      await docRef
        .collection('others')
        .doc('a')
        .set({ a: 1 });
      return <TestResults docRef={docRef} />;
    }
  );

  await waitForElement(() => getByText(/others/));

  expect(getByTestId(/collections/).textContent).toBe('others,things');
});

it('should get sub-collections with special characters inside URI', async () => {
  const TestResults = ({ docRef }: { docRef: firestore.DocumentReference }) => {
    const collections = useSubCollections(docRef);
    return (
      <div data-testid="collections">{collections.map(c => c.id).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async firestore => {
      const docRef = firestore.doc('top/doc _!@#$_');
      await docRef
        .collection('things')
        .doc('a')
        .set({ a: 1 });
      await docRef
        .collection('others')
        .doc('a')
        .set({ a: 1 });
      return <TestResults docRef={docRef} />;
    }
  );

  await waitForElement(() => getByText(/others/));

  expect(getByTestId(/collections/).textContent).toBe('others,things');
});

it('should get missing-documents', async () => {
  const TestResults: React.FC<{
    collection: firebase.firestore.CollectionReference;
  }> = ({ collection }) => {
    const documents = useMissingDocuments(collection);
    return (
      <div data-testid="documents">{documents.map(d => d.path).join()}</div>
    );
  };

  const { getByText, getByTestId } = await renderWithFirestore(
    async firestore => {
      await firestore.doc('foo/bar').set({ a: 1 });
      await firestore.doc('foo/bar/deep/egg').set({ a: 1 });
      await firestore.doc('foo/hidden/deep/egg').set({ a: 1 });
      return <TestResults collection={firestore.collection('foo')} />;
    }
  );

  await waitForElement(() => getByText(/hidden/));

  expect(getByTestId(/documents/).textContent).toBe('foo/hidden');
});

it('should clear the database', async () => {
  const TestResults = ({
    docRef,
  }: {
    docRef: firebase.firestore.DocumentReference;
  }) => {
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
    async firestore => {
      const docRef = firestore.doc('top/doc');
      await docRef.set({ a: 1 });
      return <TestResults docRef={docRef} />;
    }
  );

  await waitForElement(() => getByText(/"a":1/));

  act(() => {
    getByText(/Clear/).click();
  });

  await waitForElementToBeRemoved(() => getByText(/"a":1/));

  expect(getByTestId(/data/).textContent).not.toContain('"a":1');
});

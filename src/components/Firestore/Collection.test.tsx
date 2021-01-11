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

import { Portal } from '@rmwc/base';
import {
  act,
  queryAllByText,
  waitForElement,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import React from 'react';
import { Route } from 'react-router-dom';

import Collection, {
  CollectionPresentation,
  withCollectionState,
} from './Collection';
import { useCollectionFilter } from './store';
import { renderWithFirestore } from './testing/FirestoreTestProviders';

jest.mock('./store');

describe('CollectionPanel', () => {
  it('shows the collection name', async () => {
    const { getByText } = await renderWithFirestore(async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('cool-doc-1').set({ a: 1 });
      const collectionSnapshot = await collectionRef.get();
      const docs = collectionSnapshot.docs;

      return (
        <CollectionPresentation
          collection={collectionRef}
          collectionFilter={undefined}
          addDocument={async () => {}}
          docs={docs}
          missingDocs={[]}
          url={'/foo'}
        />
      );
    });

    expect(getByText(/my-stuff/)).not.toBeNull();
  });

  it('shows filter when filter button is clicked', async () => {
    const { getByText } = await renderWithFirestore(async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('cool-doc-1').set({ a: 1 });
      const collectionSnapshot = await collectionRef.get();
      const docs = collectionSnapshot.docs;

      return (
        <CollectionPresentation
          collection={collectionRef}
          collectionFilter={undefined}
          addDocument={async () => {}}
          docs={docs}
          missingDocs={[]}
          url={'/foo'}
        />
      );
    });

    await act(async () => {
      getByText('filter_list').click();
    });

    expect(getByText(/Filter by field/)).not.toBeNull();
  });
});

it('filters documents for single-value filters', async () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    operator: '==',
    value: 'bar',
  });

  const { getByText, queryByText } = await renderWithFirestore(
    async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('doc-with').set({ foo: 'bar' });
      await collectionRef.doc('doc-without').set({ foo: 'not-bar' });

      return <Collection collection={collectionRef} />;
    }
  );

  await waitForElement(() => getByText(/doc-with/));

  expect(getByText(/doc-with/)).not.toBeNull();
  expect(queryByText(/doc-without/)).toBeNull();
});

it('filters documents for single-value not operator filters', async () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    operator: '!=',
    value: 'bar',
  });

  const { getByText, queryByText } = await renderWithFirestore(
    async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('doc-with').set({ foo: 'not-bar' });
      await collectionRef.doc('doc-without').set({ foo: 'bar' });

      return <Collection collection={collectionRef} />;
    }
  );

  await waitForElement(() => getByText(/doc-with/));

  expect(getByText(/doc-with/)).not.toBeNull();
  expect(queryByText(/doc-without/)).toBeNull();
});

it('filters documents for multi-value filters', async () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    operator: 'in',
    values: ['eggs', 'spam'],
  });

  const { getByText, queryByText } = await renderWithFirestore(
    async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('doc-with').set({ foo: 'eggs' });
      await collectionRef.doc('doc-without').set({ foo: 'not-eggs' });

      return <Collection collection={collectionRef} />;
    }
  );

  await waitForElement(() => getByText(/doc-with/));

  expect(getByText(/doc-with/)).not.toBeNull();
  expect(queryByText(/doc-without/)).toBeNull();
});

it('filters documents for multi-value not operator filters', async () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    operator: 'not-in',
    values: ['eggs', 'spam'],
  });

  const { getByText, queryByText } = await renderWithFirestore(
    async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('doc-with').set({ foo: 'not-eggs' });
      await collectionRef.doc('doc-without').set({ foo: 'eggs' });

      return <Collection collection={collectionRef} />;
    }
  );

  await waitForElement(() => getByText(/doc-with/));

  expect(getByText(/doc-with/)).not.toBeNull();
  expect(queryByText(/doc-without/)).toBeNull();
});

it('sorts documents when filtered', async () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    sort: 'asc',
  });

  const { queryAllByText, getByText, queryByText } = await renderWithFirestore(
    async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('doc-z').set({ foo: 'z' });
      await collectionRef.doc('doc-a').set({ foo: 'a' });
      await collectionRef.doc('doc-b').set({ foo: 'b' });

      return <Collection collection={collectionRef} />;
    }
  );

  await waitForElement(() => getByText(/doc-a/));

  expect(
    queryAllByText(/doc-a|doc-b|doc-z/).map((e) => e.textContent)
  ).toEqual(['doc-a', 'doc-b', 'doc-z']);
});

it('shows the missing documents', async () => {
  const { getByText } = await renderWithFirestore(
    async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('hidden/deep/cool-doc-1').set({ a: 1 });

      return (
        <>
          <Collection collection={collectionRef} />
          <Portal />
        </>
      );
    },
    {
      path: '/hidden',
    }
  );

  await waitForElement(() => getByText(/hidden/));

  expect(getByText(/hidden/)).not.toBeNull();
});

it('shows the selected sub-document', async () => {
  const { queryAllByText, getByText } = await renderWithFirestore(
    async (firestore) => {
      const collectionRef = firestore.collection('my-stuff');
      await collectionRef.doc('cool-doc-1').set({ a: 1 });

      return (
        <>
          <Collection collection={collectionRef} />
          <Portal />
        </>
      );
    },
    {
      path: '//cool-doc-1',
    }
  );

  const expectedDocIds = 2; // One in CollectionList, one for doc panel header.
  await waitForElement(
    () => queryAllByText(/cool-doc-1/).length >= expectedDocIds
  );

  expect(getByText(/my-stuff/)).not.toBeNull();
  expect(queryAllByText(/cool-doc-1/).length).toBe(expectedDocIds);
});

describe('withCollectionState', () => {
  let performAddDocument: (id?: string) => Promise<void>;
  const MyCollection = withCollectionState(({ addDocument }) => {
    performAddDocument = (id = 'new-document-id') =>
      addDocument({ id, data: {} });
    return <div data-testid="withCollectionState" />;
  });

  it('redirects to a newly created document', async () => {
    const { getByTestId, getByText } = await renderWithFirestore(
      async (firestore) => {
        const collectionRef = firestore.collection('my-stuff');

        return (
          <>
            <Route path="/my-stuff">
              <MyCollection collection={collectionRef} />
            </Route>
            <Route path="/my-stuff/new-document-id">_redirected_to_foo_</Route>
          </>
        );
      },
      {
        path: '/my-stuff',
      }
    );

    await waitForElement(() => getByTestId('withCollectionState'));

    await act(performAddDocument);

    expect(getByText(/_redirected_to_foo_/)).not.toBeNull();
  });

  it('redirects to a newly created document when a child is active', async () => {
    const { getByTestId, getByText } = await renderWithFirestore(
      async (firestore) => {
        const collectionRef = firestore.collection('my-stuff');

        return (
          <>
            <Route path="/my-stuff">
              <MyCollection collection={collectionRef} />
            </Route>
            <Route path="/my-stuff/new-document-id">_redirected_to_foo_</Route>
          </>
        );
      },
      {
        path: '/my-stuff/my-doc/sub-coll',
      }
    );

    await waitForElement(() => getByTestId('withCollectionState'));

    await act(performAddDocument);

    expect(getByText(/_redirected_to_foo_/)).not.toBeNull();
  });

  it('redirects to a newly created document when a child is active and the document id has special characters', async () => {
    const { getByTestId, getByText } = await renderWithFirestore(
      async (firestore) => {
        const collectionRef = firestore.collection('my-stuff');

        return (
          <>
            <Route path="/my-stuff">
              <MyCollection collection={collectionRef} />
            </Route>
            <Route path="/my-stuff/new-document-id-%40%23%24">
              _redirected_to_foo_
            </Route>
          </>
        );
      },
      {
        path: '/my-stuff/my-doc/sub-coll',
      }
    );

    await waitForElement(() => getByTestId('withCollectionState'));

    await act(() => performAddDocument('new-document-id-@#$'));

    expect(getByText(/_redirected_to_foo_/)).not.toBeNull();
  });

  // TODO: This test tracks the ideal behavior of the issue #442:
  //          Error on the Firestore viewer when trying to decode URI containing the character '%'.
  it.skip('redirects to a newly created document when a child is active and the document id has the special character %', async () => {
    const { getByTestId, getByText } = await renderWithFirestore(
      async (firestore) => {
        const collectionRef = firestore.collection('my-stuff');

        return (
          <>
            <Route path="/my-stuff">
              <MyCollection collection={collectionRef} />
            </Route>
            <Route path="/my-stuff/new-document-id-%40%23%24%25">
              _redirected_to_foo_
            </Route>
          </>
        );
      },
      {
        path: '/my-stuff/my-doc/sub-coll',
      }
    );

    await waitForElement(() => getByTestId('withCollectionState'));

    await act(() => performAddDocument('new-document-id-@#$%'));

    expect(getByText(/_redirected_to_foo_/)).not.toBeNull();
  });
});

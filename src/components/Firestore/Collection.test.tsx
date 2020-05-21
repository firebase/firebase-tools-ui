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
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { MemoryRouter, Route } from 'react-router-dom';

import { delay } from '../../test_utils';
import { ApiProvider } from './ApiContext';
import Collection, { CollectionPresentation } from './Collection';
import { useCollectionFilter } from './store';
import {
  fakeCollectionReference,
  fakeDocumentReference,
  fakeDocumentSnapshot,
  fakeFirestoreApi,
} from './testing/models';

jest.mock('react-firebase-hooks/firestore');
jest.mock('./store');

describe('CollectionPanel', () => {
  it('shows the list of documents in the collection', () => {
    const collectionReference = fakeCollectionReference({ id: 'my-stuff' });
    const { getByText } = render(
      <MemoryRouter>
        <CollectionPresentation
          collection={collectionReference}
          collectionFilter={undefined}
          addDocument={async () => {}}
          docs={[{ ref: fakeDocumentSnapshot({ id: 'cool-doc-1' }) } as any]}
          url={'/foo'}
        />
      </MemoryRouter>
    );

    expect(getByText(/my-stuff/)).not.toBeNull();
    expect(getByText(/cool-doc-1/)).not.toBeNull();
  });

  it('shows filter when filter button is clicked', async () => {
    const collectionReference = fakeCollectionReference({ id: 'my-stuff' });
    const { getByText } = render(
      <MemoryRouter>
        <CollectionPresentation
          collection={collectionReference}
          collectionFilter={undefined}
          addDocument={async () => {}}
          docs={[{ ref: fakeDocumentSnapshot({ id: 'cool-doc-1' }) } as any]}
          url={'/foo'}
        />
      </MemoryRouter>
    );

    await act(async () => {
      getByText('filter_list').click();
      await delay(200);
    });

    expect(getByText(/Filter by field/)).not.toBeNull();
  });
});

it('filters documents for single-value filters', () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    operator: '==',
    value: 'bar',
  });
  useCollection.mockReturnValue([]);
  const whereSpy = jest.fn();

  render(
    <MemoryRouter>
      <Collection
        collection={fakeCollectionReference({
          where: whereSpy,
        })}
      />
    </MemoryRouter>
  );

  expect(whereSpy).toHaveBeenCalledWith('foo', '==', 'bar');
});

it('filters documents for multi-value filters', () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    operator: 'in',
    values: ['eggs', 'spam'],
  });
  useCollection.mockReturnValue([]);
  const whereSpy = jest.fn();

  render(
    <MemoryRouter>
      <Collection
        collection={fakeCollectionReference({
          where: whereSpy,
        })}
      />
    </MemoryRouter>
  );

  expect(whereSpy).toHaveBeenCalledWith('foo', 'in', ['eggs', 'spam']);
});

it('sorts documents when filtered', () => {
  useCollectionFilter.mockReturnValue({
    field: 'foo',
    sort: 'asc',
  });
  useCollection.mockReturnValue([]);
  const orderBySpy = jest.fn();

  render(
    <MemoryRouter>
      <Collection
        collection={fakeCollectionReference({
          orderBy: orderBySpy,
        })}
      />
    </MemoryRouter>
  );

  expect(orderBySpy).toHaveBeenCalledWith('foo', 'asc');
});

it('shows the selected sub-document', () => {
  const subDocRef = fakeDocumentReference({ id: 'cool-doc-1' });

  useDocumentData.mockReturnValue([]);
  useCollection.mockReturnValue([
    {
      docs: [{ ref: subDocRef }],
    },
  ]);

  const collectionReference = fakeCollectionReference({
    id: 'my-stuff',
    doc: jest.fn(),
  });
  collectionReference.doc.mockReturnValue(subDocRef);

  const { getByText, queryAllByText } = render(
    <MemoryRouter initialEntries={['//cool-doc-1']}>
      <Portal />
      <ApiProvider value={fakeFirestoreApi()}>
        <Collection collection={collectionReference} api={fakeFirestoreApi()} />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByText(/my-stuff/)).not.toBeNull();
  expect(collectionReference.doc).toHaveBeenCalledWith('cool-doc-1');
  expect(queryAllByText(/cool-doc-1/).length).toBe(2);
});

it('redirects to a newly created document', async () => {
  useCollection.mockReturnValue([{ id: 'my-stuff', docs: [] }]);
  useDocumentData.mockReturnValue([{}]);

  const collectionReference = fakeCollectionReference({
    id: 'my-stuff',
    doc: () => fakeDocumentReference(),
  });
  const { getByLabelText, getByText } = render(
    <ApiProvider value={fakeFirestoreApi()}>
      <Portal />
      <MemoryRouter>
        <Collection collection={collectionReference} />
        <Route path="//new-document-id">_redirected_to_foo_</Route>
      </MemoryRouter>
    </ApiProvider>
  );

  act(() => collectionReference.setSnapshot({ id: 'my-stuff', docs: [] }));

  act(() => getByText('Add document').click());

  await act(async () => {
    fireEvent.change(getByLabelText('Document ID'), {
      target: { value: 'new-document-id' },
    });
  });

  await act(async () => getByText('Save').click());

  expect(getByText(/_redirected_to_foo_/)).not.toBeNull();
});

it('redirects to a newly created document when a child is active', async () => {
  const nestedStuff = fakeDocumentSnapshot({
    id: 'nested-stuff',
    ref: fakeDocumentReference({
      id: 'nested-stuff',
      path: 'myColl/my-stuff/nested-stuff',
    }),
  });
  useDocumentData.mockReturnValue([{}]);
  useCollection.mockReturnValue([
    {
      id: 'my-stuff',
      docs: [nestedStuff],
    },
  ]);

  const collectionReference = fakeCollectionReference({
    id: 'my-stuff',
    doc: () => fakeDocumentReference(),
  });
  const { getByLabelText, getByText } = render(
    <ApiProvider value={fakeFirestoreApi()}>
      <Portal />
      <MemoryRouter>
        <Collection collection={collectionReference} />
        <Route path="//new-document-id">_redirected_to_foo_</Route>
      </MemoryRouter>
    </ApiProvider>
  );

  act(() => getByText('nested-stuff').click());

  act(() => getByText('Add document').click());

  await act(async () => {
    fireEvent.change(getByLabelText('Document ID'), {
      target: { value: 'new-document-id' },
    });
  });

  await act(async () => getByText('Save').click());

  expect(getByText(/_redirected_to_foo_/)).not.toBeNull();
});

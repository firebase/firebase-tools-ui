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

import React from 'react';
import { wait, act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DatabaseApi from './api';

import {
  fakeFirestoreApi,
  fakeCollectionReference,
  fakeDocumentSnapshot,
  fakeDocumentReference,
} from './testing/models';
import CollectionList from './CollectionList';

jest.mock('./api');

it('shows the list of collections', async () => {
  const fakeApi = new DatabaseApi();
  fakeApi.getCollections.mockResolvedValueOnce([
    fakeCollectionReference({ id: 'coll-1' }),
    fakeCollectionReference({ id: 'coll-2' }),
  ]);

  const { getByText, queryByText } = render(
    <MemoryRouter>
      <CollectionList api={fakeApi} />
    </MemoryRouter>
  );

  expect(getByText(/Loading collections/)).not.toBeNull();

  await wait();

  expect(queryByText(/Loading collections/)).toBeNull();
  expect(getByText(/coll-1/)).not.toBeNull();
  expect(getByText(/coll-2/)).not.toBeNull();
});

it('requests root-collections with no docRef', async () => {
  const fakeApi = new DatabaseApi();

  const { getByText, queryByText } = render(
    <MemoryRouter>
      <CollectionList api={fakeApi} />
    </MemoryRouter>
  );

  await wait();

  expect(fakeApi.getCollections).toHaveBeenCalledWith(undefined);
});

it('requests sub-collections with docRef', async () => {
  const fakeApi = new DatabaseApi();
  const fakeDocRef = fakeDocumentReference();

  const { getByText, queryByText } = render(
    <MemoryRouter>
      <CollectionList api={fakeApi} reference={fakeDocRef} />
    </MemoryRouter>
  );

  await wait();

  expect(fakeApi.getCollections).toHaveBeenCalledWith(fakeDocRef);
});

it('shows the selected top-level collection', () => {
  const { getByText, queryAllByText } = render(
    <MemoryRouter initialEntries={['//cool-coll-1']}>
      <CollectionList api={fakeFirestoreApi()} />
    </MemoryRouter>
  );

  expect(getByText(/cool-coll-1/)).not.toBeNull();
});

it('shows the selected document-owned collection', () => {
  const { getByText, queryAllByText } = render(
    <MemoryRouter initialEntries={['//cool-coll-1']}>
      <CollectionList
        api={fakeFirestoreApi()}
        reference={fakeDocumentReference()}
      />
    </MemoryRouter>
  );

  expect(getByText(/cool-coll-1/)).not.toBeNull();
});

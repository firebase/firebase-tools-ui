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

import { act, render, wait } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { delay, makeDeferred } from '../../test_utils';
import DatabaseApi from './api';
import { ApiProvider } from './ApiContext';
import CollectionList from './CollectionList';
import {
  FakeCollectionReference,
  fakeCollectionReference,
  fakeDocumentReference,
  fakeDocumentSnapshot,
  fakeFirestoreApi,
} from './testing/models';

jest.mock('./api');

it('shows the list of collections', async () => {
  const fakeApi = new DatabaseApi();
  const getCollections = makeDeferred<FakeCollectionReference[]>();
  fakeApi.getCollections.mockReturnValueOnce(getCollections.promise);

  const { getByText } = await render(
    <MemoryRouter>
      <ApiProvider value={fakeApi}>
        <CollectionList />
      </ApiProvider>
    </MemoryRouter>
  );

  await act(() =>
    getCollections.resolve([
      fakeCollectionReference({ id: 'coll-1' }),
      fakeCollectionReference({ id: 'coll-2' }),
    ])
  );
  expect(getByText(/coll-1/)).not.toBeNull();
  expect(getByText(/coll-2/)).not.toBeNull();
});

it('requests root-collections with no docRef', async () => {
  const fakeApi = new DatabaseApi();

  render(
    <MemoryRouter>
      <ApiProvider value={fakeApi}>
        <CollectionList />
      </ApiProvider>
    </MemoryRouter>
  );

  await act(() => delay(100)); // Give it some time to call getCollections.

  expect(fakeApi.getCollections).toHaveBeenCalledWith(undefined);
});

it('requests sub-collections with docRef', async () => {
  const fakeApi = new DatabaseApi();
  const fakeDocRef = fakeDocumentReference();

  render(
    <MemoryRouter>
      <ApiProvider value={fakeApi}>
        <CollectionList reference={fakeDocRef} />
      </ApiProvider>
    </MemoryRouter>
  );

  await act(() => delay(100)); // Give it some time to call getCollections.

  expect(fakeApi.getCollections).toHaveBeenCalledWith(fakeDocRef);
});

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
import { act, render } from '@testing-library/react';
import React from 'react';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { MemoryRouter } from 'react-router-dom';

import { ApiProvider } from './ApiContext';
import Collection from './Collection';
import {
  fakeCollectionReference,
  fakeDocumentReference,
  fakeDocumentSnapshot,
  fakeFirestoreApi,
} from './testing/models';

jest.mock('react-firebase-hooks/firestore');

it('shows the list of documents in the collection', () => {
  useCollection.mockReturnValue([
    {
      docs: [{ ref: fakeDocumentSnapshot({ id: 'cool-doc-1' }) }],
    },
  ]);

  const collectionReference = fakeCollectionReference({ id: 'my-stuff' });
  const { getByText, queryByText } = render(
    <MemoryRouter>
      <Portal />
      <Collection collection={collectionReference} />
    </MemoryRouter>
  );

  act(() =>
    collectionReference.setSnapshot({
      docs: [
        fakeDocumentSnapshot({
          ref: fakeDocumentReference({ id: 'cool-doc-1' }),
        }),
      ],
    })
  );

  expect(getByText(/my-stuff/)).not.toBeNull();
  expect(queryByText(/Loading documents/)).toBeNull();
  expect(getByText(/cool-doc-1/)).not.toBeNull();
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

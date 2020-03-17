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
import { act, render, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';

import {
  fakeFirestoreApi,
  fakeDocumentReference,
  fakeDocumentSnapshot,
} from './testing/models';

import { ApiProvider } from './ApiContext';

import { Document, Root } from './Document';

import { DocumentStateContext } from './Field/DocumentStore';

jest.mock('react-firebase-hooks/firestore');

it('shows the root-id', () => {
  useDocumentData.mockReturnValueOnce([]);

  const { getByText } = render(
    <MemoryRouter>
      <ApiProvider value={fakeFirestoreApi()}>
        <Root />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByText(/Root/)).not.toBeNull();
});

it('shows the document-id', () => {
  const { getByText } = render(
    <MemoryRouter>
      <ApiProvider value={fakeFirestoreApi()}>
        <Document reference={fakeDocumentReference({ id: 'my-stuff' })} />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByText(/my-stuff/)).not.toBeNull();
});

it('shows the root collection-list', () => {
  const { getByTestId } = render(
    <MemoryRouter>
      <ApiProvider value={fakeFirestoreApi()}>
        <Root />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByTestId('collection-list')).not.toBeNull();
});

it('shows the document collection-list', () => {
  useDocumentData.mockReturnValueOnce([]);

  const { getByTestId } = render(
    <MemoryRouter>
      <ApiProvider value={fakeFirestoreApi()}>
        <Document reference={fakeDocumentReference()} />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByTestId('collection-list')).not.toBeNull();
});

it('shows the selected root-collection', () => {
  useDocumentData.mockReturnValueOnce([]);
  useCollection.mockReturnValueOnce([]);

  const { getByText, queryAllByText } = render(
    <MemoryRouter initialEntries={['//cool-coll-1']}>
      <ApiProvider value={fakeFirestoreApi()}>
        <Root />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByText(/cool-coll-1/)).not.toBeNull();
});

it('shows the selected document-collection', () => {
  useDocumentData.mockReturnValueOnce([]);
  useCollection.mockReturnValueOnce([]);

  const { getByText, queryAllByText } = render(
    <MemoryRouter initialEntries={['//cool-coll-1']}>
      <ApiProvider value={fakeFirestoreApi()}>
        <Document reference={fakeDocumentReference()} />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByText(/cool-coll-1/)).not.toBeNull();
});

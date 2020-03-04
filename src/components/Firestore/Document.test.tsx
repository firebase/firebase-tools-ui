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

import {
  fakeFirestoreApi,
  fakeDocumentReference,
  fakeDocumentSnapshot,
} from './testing/models';

import { ApiProvider } from './ApiContext';

import Document from './Document';

it('shows the selected document-id', async () => {
  const { getByText } = render(
    <MemoryRouter>
      <ApiProvider value={fakeFirestoreApi()}>
        <Document
          reference={fakeDocumentReference({ id: 'my-stuff' })}
          snapshot={fakeDocumentSnapshot()}
        />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByText(/my-stuff/)).not.toBeNull();
  await wait();
});

it('shows the selected document fields', async () => {
  const { getByText } = render(
    <MemoryRouter>
      <ApiProvider value={fakeFirestoreApi()}>
        <Document
          reference={fakeDocumentReference()}
          snapshot={fakeDocumentSnapshot({ data: { foo: 'bar' } })}
        />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByText(/foo/)).not.toBeNull();
  expect(getByText(/bar/)).not.toBeNull();

  await wait();
});

it('renders a collection list', async () => {
  const { getByTestId } = render(
    <MemoryRouter>
      <ApiProvider value={fakeFirestoreApi()}>
        <Document
          reference={fakeDocumentReference()}
          snapshot={fakeDocumentSnapshot()}
        />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(getByTestId('collection-list')).not.toBeNull();

  await wait();
});

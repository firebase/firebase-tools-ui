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

import { fakeCollectionReference } from './testing/models';
import { Firestore } from './index';
import DatabaseApi from './api';
import { confirm } from '../DialogQueue';

jest.mock('./api');
jest.mock('../DialogQueue');

it('shows the loading state when connecting to Firestore', () => {
  const { getByText, queryByText } = render(
    <MemoryRouter>
      <Firestore config={undefined} projectId={undefined} />
    </MemoryRouter>
  );

  expect(getByText(/Connecting to Firestore/)).not.toBeNull();
});

it('shows the top-level collections', async () => {
  DatabaseApi.prototype.getCollections.mockResolvedValue([
    fakeCollectionReference({ id: 'cool-coll' }),
  ]);
  const { getByText, queryByText } = render(
    <MemoryRouter>
      <Firestore config={{}} projectId={'foo'} />
    </MemoryRouter>
  );

  await wait();

  expect(queryByText(/Connecting to Firestore/)).toBeNull();
  expect(getByText(/cool-coll/)).not.toBeNull();
});

it('triggers clearing all data', async () => {
  confirm.mockResolvedValueOnce(true);
  const nukeSpy = jest.fn();

  DatabaseApi.mockImplementationOnce(() => ({
    getCollections: jest.fn(),
    delete: jest.fn(),
    nukeDocuments: nukeSpy,
  }));

  const { getByText } = render(
    <MemoryRouter>
      <Firestore config={{}} projectId={'foo'} />
    </MemoryRouter>
  );

  act(() => getByText('clear all data').click());

  await wait();

  expect(nukeSpy).toHaveBeenCalled();
});

it('does not trigger clearing all data if dialog is not confirmed', async () => {
  confirm.mockResolvedValueOnce(false);
  const nukeSpy = jest.fn();

  DatabaseApi.mockImplementationOnce(() => ({
    getCollections: jest.fn(),
    delete: jest.fn(),
    nukeDocuments: nukeSpy,
  }));

  const { getByText } = render(
    <MemoryRouter>
      <Firestore config={{}} projectId={'foo'} />
    </MemoryRouter>
  );

  act(() => getByText('clear all data').click());

  await wait();

  expect(nukeSpy).not.toHaveBeenCalled();
});

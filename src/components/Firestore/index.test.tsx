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
import { MemoryRouter, Route } from 'react-router-dom';

import { FirestoreConfig } from '../../store/config';
import { confirm } from '../common/DialogQueue';
import DatabaseApi from './api';
import { Firestore, FirestoreRoute } from './index';
import { fakeCollectionReference } from './testing/models';

jest.mock('./api');
jest.mock('../common/DialogQueue');

const sampleConfig: FirestoreConfig = {
  host: 'localhost',
  port: 8080,
  hostAndPort: 'localhost:8080',
};

describe('FirestoreRoute', () => {
  it('renders loading when projectId is not ready', () => {
    const { getByText } = render(
      <FirestoreRoute
        projectIdResult={undefined}
        configResult={{ data: sampleConfig }}
      />
    );
    expect(getByText('Loading...')).not.toBeNull();
  });

  it('renders loading when config is not ready', () => {
    const { getByText } = render(
      <FirestoreRoute
        projectIdResult={{ data: 'foo' }}
        configResult={undefined}
      />
    );
    expect(getByText('Loading...')).not.toBeNull();
  });

  it('renders error when loading config fails', () => {
    const { getByText } = render(
      <FirestoreRoute
        projectIdResult={{ data: 'foo' }}
        configResult={{ error: { message: 'Oh, snap!' } }}
      />
    );
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('renders "emulator is off" when config is not present', () => {
    const { getByText } = render(
      <FirestoreRoute
        projectIdResult={{ data: 'foo' }}
        configResult={{ data: undefined /* emulator absent */ }}
      />
    );
    expect(getByText(/not running/)).not.toBeNull();
  });
});

describe('Firestore', () => {
  it('shows the top-level collections', async () => {
    DatabaseApi.prototype.getCollections.mockResolvedValue([
      fakeCollectionReference({ id: 'cool-coll' }),
    ]);
    const { getByText, queryByText } = render(
      <MemoryRouter>
        <Firestore config={sampleConfig} projectId={'foo'} />
      </MemoryRouter>
    );

    await wait();

    expect(queryByText(/Connecting to Firestore/)).toBeNull();
    expect(getByText(/cool-coll/)).not.toBeNull();
  });

  it('triggers clearing all data', async () => {
    confirm.mockResolvedValueOnce(true);
    let nukeResolve;
    const nukeSpy = jest
      .fn()
      .mockImplementation(
        () => new Promise(resolve => (nukeResolve = resolve))
      );

    DatabaseApi.mockImplementationOnce(() => ({
      getCollections: jest.fn(),
      delete: jest.fn(),
      nukeDocuments: nukeSpy,
    }));

    const { getByTestId, getByText, queryByTestId } = render(
      <MemoryRouter>
        <Firestore config={sampleConfig} projectId={'foo'} />
        <Route
          path="/firestore"
          exact
          render={() => <div data-testid="ROOT"></div>}
        />
      </MemoryRouter>
    );

    act(() => getByText('Clear all data').click());

    await wait();

    expect(nukeSpy).toHaveBeenCalled();
    expect(getByTestId('firestore-loading')).not.toBeNull();

    nukeResolve();
    await wait();

    expect(queryByTestId('firestore-loading')).toBeNull();
    expect(getByTestId('ROOT')).not.toBeNull();
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
        <Firestore config={sampleConfig} projectId={'foo'} />
      </MemoryRouter>
    );

    act(() => getByText('Clear all data').click());

    await wait();

    expect(nukeSpy).not.toHaveBeenCalled();
  });
});

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

// import 'firebase/firestore';

import * as firebaseTesting from '@firebase/testing';
import {
  act,
  render,
  wait,
  waitForElement,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import firebase from 'firebase';
import React from 'react';
import { Route } from 'react-router-dom';
import { FirebaseAppProvider, preloadFirestore, useFirestore } from 'reactfire';

import { FirestoreConfig } from '../../store/config';
import { makeDeferred } from '../../test_utils';
import { confirm } from '../common/DialogQueue';
import * as emulatedApi from './FirestoreEmulatedApiProvider';
import { Firestore, FirestoreRoute } from './index';
import { FirestoreProviders } from './testing/FirestoreProviders';
import { fakeCollectionReference } from './testing/models';

jest.mock('../common/DialogQueue');

// jest.mock('reactfire', () => ({
//   ...jest.requireActual('reactfire'),
//   // useFirestore: () => ({}),
// }));

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
    expect(getByText('Firestore Emulator Loading...')).not.toBeNull();
  });

  it('renders loading when config is not ready', () => {
    const { getByText } = render(
      <FirestoreRoute
        projectIdResult={{ data: 'foo' }}
        configResult={undefined}
      />
    );
    expect(getByText('Firestore Emulator Loading...')).not.toBeNull();
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
  // beforeEach(async () => {
  //   await firebaseTesting.clearFirestoreData({
  //     projectId: process.env.GCLOUD_PROJECT!,
  //   });
  // });
  // afterEach(async () => {
  //   await firebaseTesting.clearFirestoreData({
  //     projectId: process.env.GCLOUD_PROJECT!,
  //   });
  // });

  it('does stuff', async () => {
    jest.setTimeout(10000); // 10 second
    const seedData = {
      'cool-coll-one/cool-doc': { a: 1 },
    };

    const { getByText, queryByText } = render(
      <FirestoreProviders data={seedData}>
        <Firestore />
      </FirestoreProviders>
    );

    await waitForElement(() => getByText(/cool-coll-one/), { timeout: 10000 });

    expect(queryByText(/Connecting to Firestore/)).toBeNull();
    expect(getByText(/cool-coll-one/)).not.toBeNull();
    expect(queryByText(/cool-coll-two/)).toBeNull();
  });

  it('does stuff independently', async () => {
    jest.setTimeout(10000); // 10 second
    const seedData = {
      'cool-coll-two/cool-doc': { a: 1 },
    };

    const { getByText, queryByText } = render(
      <FirestoreProviders data={seedData}>
        <Firestore />
      </FirestoreProviders>
    );

    await waitForElement(() => getByText(/cool-coll-two/), { timeout: 10000 });

    expect(queryByText(/Connecting to Firestore/)).toBeNull();
    expect(queryByText(/cool-coll-one/)).toBeNull();
    expect(getByText(/cool-coll-two/)).not.toBeNull();
  });

  it('shows the top-level collections', async () => {
    const mockData = {
      'cool-coll/bar': { a: 1 },
    };

    const { getByText, queryByText } = render(
      <FirestoreProviders data={mockData}>
        <Firestore />
      </FirestoreProviders>
    );

    await waitForElement(() => getByText(/cool-coll/));

    expect(queryByText(/Connecting to Firestore/)).toBeNull();
    expect(getByText(/cool-coll/)).not.toBeNull();
  });

  it('shows a collection-shell if at the root', async () => {
    const { getByTestId } = render(
      <FirestoreProviders initialEntries={['/firestore']}>
        <Firestore />
      </FirestoreProviders>
    );

    await waitForElement(() => getByTestId(/collection-shell/));

    expect(getByTestId(/collection-shell/)).not.toBeNull();
    expect(getByTestId(/document-shell/)).not.toBeNull();
  });

  it('shows a document-shell if 1-level deep', async () => {
    const { getByTestId, queryByTestId } = render(
      <FirestoreProviders initialEntries={['/firestore/coll']}>
        <Firestore />
      </FirestoreProviders>
    );

    await waitForElement(() => getByTestId(/document-shell/));

    expect(queryByTestId(/collection-shell/)).toBeNull();
    expect(getByTestId(/document-shell/)).not.toBeNull();
  });

  it('shows no shells if 2-levels deep', async () => {
    const { getByTestId, queryByTestId } = render(
      <FirestoreProviders initialEntries={['/firestore/coll/doc']}>
        <Firestore />
      </FirestoreProviders>
    );

    await waitForElementToBeRemoved(() => getByTestId('fallback'));

    expect(queryByTestId(/collection-shell/)).toBeNull();
    expect(queryByTestId(/document-shell/)).toBeNull();
  });

  it('triggers clearing all data', async () => {
    const nuke = makeDeferred<void>();
    const nukeSpy = jest.fn().mockReturnValueOnce(nuke.promise);
    jest.spyOn(emulatedApi, 'useEjector').mockReturnValue(nukeSpy);
    confirm.mockResolvedValueOnce(true);

    const { getByTestId, getByText, queryByTestId } = render(
      <FirestoreProviders>
        <Firestore />
        <Route
          path="/firestore"
          exact
          render={() => <div data-testid="ROOT"></div>}
        />
      </FirestoreProviders>
    );
    act(() => getByText('Clear all data').click());
    await wait(() => expect(nukeSpy).toHaveBeenCalled());
    expect(getByTestId('firestore-loading')).not.toBeNull();
    await act(() => nuke.resolve());
    expect(queryByTestId('firestore-loading')).toBeNull();
    expect(getByTestId('ROOT')).not.toBeNull();
  });

  it('does not trigger clearing all data if dialog is not confirmed', async () => {
    const nukeSpy = jest.fn();
    jest.spyOn(emulatedApi, 'useEjector').mockReturnValue(nukeSpy);

    const confirmDeferred = makeDeferred<boolean>();
    confirm.mockReturnValueOnce(confirmDeferred.promise);

    const { getByText } = render(
      <FirestoreProviders>
        <Firestore />
      </FirestoreProviders>
    );
    act(() => getByText('Clear all data').click());
    // Simulate the case where user clicked on Cancel in the confirm dialog.
    await act(() => confirmDeferred.resolve(false));
    expect(nukeSpy).not.toHaveBeenCalled();
  });
});

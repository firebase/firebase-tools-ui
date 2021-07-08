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

import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Route } from 'react-router-dom';

import { delay, makeDeferred } from '../../test_utils';
import { isTabActive } from '../../test_utils';
import { confirm } from '../common/DialogQueue';
import { TestEmulatorConfigProvider } from '../common/EmulatorConfigProvider';
import * as emulatedApi from './FirestoreEmulatedApiProvider';
import { Firestore, FirestoreRoute } from './index';
import { renderWithFirestore } from './testing/FirestoreTestProviders';

jest.mock('../common/DialogQueue');
jest.mock('./Requests', () => () => null);

describe('FirestoreRoute', () => {
  it('renders loading when config is not ready', () => {
    const { getByText } = render(
      <TestEmulatorConfigProvider config={undefined}>
        <FirestoreRoute />
      </TestEmulatorConfigProvider>
    );
    expect(getByText('Firestore Emulator Loading...')).not.toBeNull();
  });

  it('renders error when emulators are disabled', () => {
    const { getByText } = render(
      <TestEmulatorConfigProvider config={null}>
        <FirestoreRoute />
      </TestEmulatorConfigProvider>
    );
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('renders "emulator is off" when config is not present', () => {
    const { getByText } = render(
      <TestEmulatorConfigProvider
        config={{ projectId: 'example' /* no firestore */ }}
      >
        <FirestoreRoute />
      </TestEmulatorConfigProvider>
    );
    expect(getByText(/not running/)).not.toBeNull();
  });
});

describe('Firestore sub-tabs navigation', () => {
  it('selects the Data tab when /firestore/data', async () => {
    const { getByText } = await renderWithFirestore(async () => <Firestore />, {
      path: '/firestore/data',
    });

    await act(() => delay(600)); // Wait for tab indicator async DOM updates.

    expect(isTabActive(getByText('Data'))).toBe(true);
    expect(isTabActive(getByText('Requests'))).toBe(false);
  });

  it('selects the Requests tab when /firestore/requests', async () => {
    const { getByText } = await renderWithFirestore(async () => <Firestore />, {
      path: '/firestore/requests',
    });

    await act(() => delay(300)); // Wait for tab indicator async DOM updates.

    expect(isTabActive(getByText('Data'))).toBe(false);
    expect(isTabActive(getByText('Requests'))).toBe(true);
  });

  it('selects the Requests tab when /firestore/requests/:id', async () => {
    const { getByText } = await renderWithFirestore(async () => <Firestore />, {
      path: '/firestore/requests/uniqueRequestId',
    });

    await act(() => delay(300)); // Wait for tab indicator async DOM updates.

    expect(isTabActive(getByText('Data'))).toBe(false);
    expect(isTabActive(getByText('Requests'))).toBe(true);
  });

  it('Redirects to /firestore/data and selects the Data tab when /firestore', async () => {
    const { getByText } = await renderWithFirestore(async () => <Firestore />, {
      path: '/firestore',
    });

    await act(() => delay(600)); // Wait for tab indicator async DOM updates.

    expect(isTabActive(getByText('Data'))).toBe(true);
    expect(isTabActive(getByText('Requests'))).toBe(false);
  });

  describe('Show Firestore collections and documents', () => {
    it('shows the top-level collections', async () => {
      const {
        getAllByText,
        getAllByTestId,
        queryByText,
        findByTestId,
      } = await renderWithFirestore(
        async (firestore) => {
          const collectionRef = firestore.collection('cool-coll');
          await collectionRef.doc('bar').set({ a: 1 });

          return <Firestore />;
        },
        { path: '/firestore/data' }
      );

      await findByTestId('collection-list');

      expect(queryByText(/Connecting to Firestore/)).toBeNull();
      expect(getAllByTestId('collection-list').length).toEqual(1);
      expect(getAllByText(/cool-coll/)).not.toBeNull();
    });

    it('shows a collection-shell if at the root', async () => {
      const { getByTestId, findByTestId } = await renderWithFirestore(
        async () => <Firestore />,
        {
          path: '/firestore/data',
        }
      );

      expect(await findByTestId(/collection-shell/)).not.toBeNull();
      expect(getByTestId(/document-shell/)).not.toBeNull();
    });

    it('shows a document-shell if 1-level deep', async () => {
      const { findByTestId, queryByTestId } = await renderWithFirestore(
        async () => <Firestore />,
        {
          path: '/firestore/data/coll',
        }
      );

      expect(await findByTestId(/document-shell/)).not.toBeNull();
      expect(queryByTestId(/collection-shell/)).toBeNull();
    });

    it('shows no shells if 2-levels deep', async () => {
      const { queryByTestId, findByText } = await renderWithFirestore(
        async (firestore) => {
          const collectionRef = firestore.collection('coll');
          await collectionRef.doc('doc').set({ a: 1 });
          return <Firestore />;
        },
        {
          path: '/firestore/data/coll/doc',
        }
      );

      await findByText(/doc/);

      expect(queryByTestId(/collection-shell/)).toBeNull();
      expect(queryByTestId(/document-shell/)).toBeNull();
    });
  });

  describe('Clear all data', () => {
    it('triggers clearing all data', async () => {
      const nuke = makeDeferred<void>();
      const nukeSpy = jest.fn().mockReturnValueOnce(nuke.promise);
      jest.spyOn(emulatedApi, 'useEjector').mockReturnValue(nukeSpy);
      confirm.mockResolvedValueOnce(true);

      const {
        getByTestId,
        getByText,
        queryByTestId,
      } = await renderWithFirestore(
        async () => (
          <>
            <Firestore />
            <Route
              path="/firestore/data"
              exact
              render={() => <div data-testid="ROOT"></div>}
            />
          </>
        ),
        {
          path: '/firestore/data',
        }
      );
      act(() => getByText('Clear all data').click());
      await waitFor(() => expect(nukeSpy).toHaveBeenCalled());
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

      const { getByText } = await renderWithFirestore(
        async () => <Firestore />,
        {
          path: '/firestore/data',
        }
      );
      act(() => getByText('Clear all data').click());
      // Simulate the case where user clicked on Cancel in the confirm dialog.
      await act(() => confirmDeferred.resolve(false));
      expect(nukeSpy).not.toHaveBeenCalled();
    });
  });
});

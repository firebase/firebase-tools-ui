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

import { act, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Route, Router } from 'react-router-dom';

import { delay } from '../../test_utils';
import { FIRESTORE_DATA_URL, useAutoSelect } from './useAutoSelect';

interface TestData {
  id: string;
}
const Test: React.FC<{ list: TestData[] | null }> = ({ list }) => {
  const redirect = useAutoSelect(list);
  return <>{redirect}</>;
};

const WITH_CHILDREN = [{ id: 'first' }, { id: 'last' }];
const WITH_CHILDREN_ENCODED = [{ id: 'first@#$' }, { id: 'last@#$' }];
const EMPTY: Array<{ id: string }> = [];

// TODO: Find some other way to test hooks (e.g. using
// react-hooks-testing-library) that does not need artificial delays on init.
describe('useAutoSelect', () => {
  describe(`at ${FIRESTORE_DATA_URL}`, () => {
    it('does not redirect if the list is null', async () => {
      const history = createMemoryHistory({
        initialEntries: [FIRESTORE_DATA_URL],
      });
      render(
        <Router history={history}>
          <Route path={FIRESTORE_DATA_URL}>
            <Test list={null} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(FIRESTORE_DATA_URL);
    });

    it('does not redirect if there is nothing to select', async () => {
      const history = createMemoryHistory({
        initialEntries: [FIRESTORE_DATA_URL],
      });
      render(
        <Router history={history}>
          <Route path={FIRESTORE_DATA_URL}>
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(FIRESTORE_DATA_URL);
    });

    it('does not redirect if there is something selected', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/x`],
      });
      render(
        <Router history={history}>
          <Route path={FIRESTORE_DATA_URL}>
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(`${FIRESTORE_DATA_URL}/x`);
    });

    it('redirects to the first child', async () => {
      const history = createMemoryHistory({
        initialEntries: [FIRESTORE_DATA_URL],
      });
      render(
        <Router history={history}>
          <Route path={FIRESTORE_DATA_URL}>
            <Test list={WITH_CHILDREN} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(`${FIRESTORE_DATA_URL}/first`);
    });

    it('redirects to the first child with encoded special characters', async () => {
      const history = createMemoryHistory({
        initialEntries: [FIRESTORE_DATA_URL],
      });
      render(
        <Router history={history}>
          <Route path={FIRESTORE_DATA_URL}>
            <Test list={WITH_CHILDREN_ENCODED} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(
        `${FIRESTORE_DATA_URL}/first%40%23%24`
      );
    });
  }); // at FIRESTORE_DATA_URL

  describe(`at ${FIRESTORE_DATA_URL}/:collectionId`, () => {
    it('does not redirect if the list is null', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users`}>
            <Test list={null} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(`${FIRESTORE_DATA_URL}/users`);
    });

    it('does not redirect if there is nothing to select', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users`}>
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(`${FIRESTORE_DATA_URL}/users`);
    });

    it('does not redirect if there is something selected', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users/x`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users`}>
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(`${FIRESTORE_DATA_URL}/users/x`);
    });

    it('redirects to the first child', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users`}>
            <Test list={WITH_CHILDREN} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(
        `${FIRESTORE_DATA_URL}/users/first`
      );
    });

    it('redirects to the first child with encoded special characters', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users`}>
            <Test list={WITH_CHILDREN_ENCODED} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(
        `${FIRESTORE_DATA_URL}/users/first%40%23%24`
      );
    });
  }); // at FIRESTORE_DATA_URL/:collectionId

  describe(`elsewhere below ${FIRESTORE_DATA_URL}/a/b/x`, () => {
    it('does not redirect if the list is null', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users/alice/friends`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users/alice/friends`}>
            <Test list={null} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(
        `${FIRESTORE_DATA_URL}/users/alice/friends`
      );
    });

    it('does not redirect if there is nothing to select', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users/alice/friends`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users/alice/friends`}>
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(
        `${FIRESTORE_DATA_URL}/users/alice/friends`
      );
    });

    it('does not redirect if there is something selected', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users/alice/friends/x`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users/alice/friends`}>
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(
        `${FIRESTORE_DATA_URL}/users/alice/friends/x`
      );
    });

    it('does not redirect when there is nothing selected', async () => {
      const history = createMemoryHistory({
        initialEntries: [`${FIRESTORE_DATA_URL}/users/alice/friends`],
      });
      render(
        <Router history={history}>
          <Route path={`${FIRESTORE_DATA_URL}/users/alice/friends`}>
            <Test list={WITH_CHILDREN} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe(
        `${FIRESTORE_DATA_URL}/users/alice/friends`
      );
    });
  }); // elsewhere below FIRESTORE_DATA_URL/a/b/x

  describe('other routes', () => {
    it('does not redirect at /', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/'],
      });
      render(
        <Router history={history}>
          <Route path="/">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe('/');
    });
    it('does not redirect at /x', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/x'],
      });
      render(
        <Router history={history}>
          <Route path="/x">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe('/x');
    });
    it('does not redirect at /x/y', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/x/y'],
      });
      render(
        <Router history={history}>
          <Route path="/x/y">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe('/x/y');
    });
    it('does not redirect at /x/y/z', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/x/y/z'],
      });
      render(
        <Router history={history}>
          <Route path="/x/y/z">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      await act(() => delay(100));
      expect(history.location.pathname).toBe('/x/y/z');
    });
  }); // other routes
});

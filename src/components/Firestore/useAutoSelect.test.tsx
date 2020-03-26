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

import { render, wait } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Route, Router } from 'react-router-dom';

import { useAutoSelect } from './useAutoSelect';

interface TestData {
  id: string;
}
const Test: React.FC<{ list: TestData[] | null }> = ({ list }) => {
  const redirect = useAutoSelect(list);
  return <>{redirect}</>;
};

const WITH_CHILDREN = [{ id: 'first' }, { id: 'last' }];
const EMPTY: Array<{ id: string }> = [];

describe('useAutoSelect', () => {
  describe('at the root', () => {
    it('does not redirect if the list is null', () => {
      const history = createMemoryHistory({ initialEntries: ['/firestore'] });
      render(
        <Router history={history}>
          <Route path="/firestore">
            <Test list={null} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore');
    });

    it('does not redirect if there is nothing to select', () => {
      const history = createMemoryHistory({ initialEntries: ['/firestore'] });
      render(
        <Router history={history}>
          <Route path="/firestore">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore');
    });

    it('does not redirect if there is something selected', () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/x'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore/x');
    });

    it('redirects to the first child', async () => {
      const history = createMemoryHistory({ initialEntries: ['/firestore'] });
      render(
        <Router history={history}>
          <Route path="/firestore">
            <Test list={WITH_CHILDREN} />
          </Route>
        </Router>
      );
      await wait();
      expect(history.location.pathname).toBe('/firestore/first');
    });
  }); // at the root

  describe('at the first collection level', () => {
    it('does not redirect if the list is null', () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users">
            <Test list={null} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore/users');
    });

    it('does not redirect if there is nothing to select', () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore/users');
    });

    it('does not redirect if there is something selected', () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users/x'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore/users/x');
    });

    it('redirects to the first child', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users">
            <Test list={WITH_CHILDREN} />
          </Route>
        </Router>
      );
      await wait();
      expect(history.location.pathname).toBe('/firestore/users/first');
    });
  }); // at the first collection level

  describe('elsewhere', () => {
    it('does not redirect if the list is null', () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users/alice/friends'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users/alice/friends">
            <Test list={null} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore/users/alice/friends');
    });

    it('does not redirect if there is nothing to select', () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users/alice/friends'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users/alice/friends">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe('/firestore/users/alice/friends');
    });

    it('does not redirect if there is something selected', () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users/alice/friends/x'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users/alice/friends">
            <Test list={EMPTY} />
          </Route>
        </Router>
      );
      expect(history.location.pathname).toBe(
        '/firestore/users/alice/friends/x'
      );
    });

    it('does not redirect when there is nothing selected', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/firestore/users/alice/friends'],
      });
      render(
        <Router history={history}>
          <Route path="/firestore/users/alice/friends">
            <Test list={WITH_CHILDREN} />
          </Route>
        </Router>
      );
      await wait();
      expect(history.location.pathname).toBe('/firestore/users/alice/friends');
    });
  }); // elsewhere
});

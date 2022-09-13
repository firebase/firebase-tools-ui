/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      /www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ref } from 'firebase/database';
import React from 'react';
import { Route } from 'react-router-dom';

import { renderWithDatabase } from '../testing/DatabaseTestProviders';
import { NodeLink } from './NodeLink';

it('renders a link with the key name', async () => {
  const { getByText } = await renderWithDatabase(
    (db) => Promise.resolve(<NodeLink dbRef={ref(db, 'a/b/c/my_key')} />),
    { namespace: 'test', path: 'a/b' }
  );

  expect(getByText('my_key')).not.toBeNull();
});

describe('linking within the current <Route>', () => {
  it('replaces :path param, keeps other route params', async () => {
    const { getByText } = await renderWithDatabase(
      (db) =>
        Promise.resolve(
          <Route path="/database/:namespace/data/:path*">
            <NodeLink dbRef={ref(db, 'a/b/c/my_key')} />
          </Route>
        ),
      { namespace: 'my-instance', path: 'database/my-instance/data/x/y' }
    );

    expect(getByText('my_key').getAttribute('href')).toEqual(
      '/database/my-instance/data/a/b/c/my_key'
    );
  });

  it('appends ref path to routes that dont declare :path', async () => {
    const { getByText } = await renderWithDatabase(
      async (db) => (
        <Route path="/database/:namespace/data">
          <NodeLink dbRef={ref(db, 'a/b/c/my_key')} />
        </Route>
      ),
      { namespace: 'my-instance', path: '/database/my-instance/data' }
    );

    expect(getByText('my_key').getAttribute('href')).toEqual(
      '/database/my-instance/data/a/b/c/my_key'
    );
  });

  it('appends ref path to root routes', async () => {
    const { getByText } = await renderWithDatabase(
      async (db) => (
        <Route path="/database/:namespace/data/:path*">
          <NodeLink dbRef={ref(db, 'a/b/c/my_key')} />
        </Route>
      ),
      { namespace: 'my-instance', path: '/database/my-instance/data' }
    );

    expect(getByText('my_key').getAttribute('href')).toEqual(
      '/database/my-instance/data/a/b/c/my_key'
    );
  });
});

it('renders the url for root refs', async () => {
  const { getByText } = await renderWithDatabase(async (db) => (
    <NodeLink dbRef={ref(db)} />
  ));

  expect(getByText(/localhost/)).not.toBeNull();
});

it('links root nodes to the route root: /database/:id/data/', async () => {
  const { getByText } = await renderWithDatabase(
    async (db) => (
      <Route path="/database/:namespace/data/:path*">
        <NodeLink dbRef={ref(db)} />
      </Route>
    ),
    { namespace: 'test', path: '/database/test/data/foo/bar/baz' }
  );

  expect(getByText(/localhost/).getAttribute('href')).toEqual(
    '/database/test/data/'
  );
});

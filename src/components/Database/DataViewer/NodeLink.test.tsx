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

import { render } from '@testing-library/react';
import { ref } from 'firebase/database';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import { renderWithDatabase } from '../testing/DatabaseTestProviders';
import { NodeLink } from './NodeLink';

// const ROOT_REF = fakeReference({ key: null, parent: null });
// const REF = fakeReference({
//   parent: ROOT_REF,
//   key: 'my_key',
//   path: 'a/b/c/my_key',
//   data: 'my_value',
// });

// beforeEach(() => {
//   (REF.toString as jest.Mock).mockReturnValue(
//     'http://localhost:9000/a/b/c/my_key'
//   );
//   (ROOT_REF.toString as jest.Mock).mockReturnValue('http://localhost:9000/');
// });

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
      { namespace: 'my-instance', path: 'x/y' }
    );

    expect(getByText('my_key').getAttribute('href')).toEqual(
      '/database/my-instance/data/a/b/c/my_key'
    );
  });

  it('appends ref path to routes that dont declare :path', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/nopath/x/y/z']}>
        <Route path="/nopath">
          <NodeLink dbRef={REF} />
        </Route>
      </MemoryRouter>
    );

    expect(getByText('my_key').getAttribute('href')).toEqual(
      '/nopath/a/b/c/my_key'
    );
  });

  it('appends ref path to root routes', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/x/y/z']}>
        <Route path="/">
          <NodeLink dbRef={REF} />
        </Route>
      </MemoryRouter>
    );

    expect(getByText('my_key').getAttribute('href')).toEqual('/a/b/c/my_key');
  });

  it('resolves a href even when not inside a route', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/x/y/z']}>
        <NodeLink dbRef={REF} />
      </MemoryRouter>
    );

    expect(getByText('my_key').getAttribute('href')).toEqual('/a/b/c/my_key');
  });
});

it('renders the url for root refs', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/database/test/data/a/b']}>
      <NodeLink dbRef={ROOT_REF} />
    </MemoryRouter>
  );

  expect(getByText(ROOT_REF.toString())).not.toBeNull();
});

it('links root nodes to the route root: /database/:id/data/', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/database/test/data/a/b']}>
      <Route path="/database/:instance/data/:path*">
        <NodeLink dbRef={ROOT_REF} />
      </Route>
    </MemoryRouter>
  );

  expect(getByText(ROOT_REF.toString()).getAttribute('href')).toEqual(
    '/database/test/data/'
  );
});

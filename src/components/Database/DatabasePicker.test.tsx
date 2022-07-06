/**
 * Copyright 2020 Google LLC
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

import { DatabasePicker } from './DatabasePicker';
import { renderWithDatabase } from './testing/DatabaseTestProviders';

it('renders primary database name and link', async () => {
  const { getByText } = await renderWithDatabase(() =>
    Promise.resolve(
      <DatabasePicker
        primary="foo"
        navigation={(db) => `/nav/${db}`}
        databases={['foo']}
      />
    )
  );
  expect(getByText('foo')).not.toBeNull();
});

it('renders current database name even if it is not in list', async () => {
  const { getByText } = await renderWithDatabase(
    () =>
      Promise.resolve(
        <DatabasePicker
          primary="foo"
          navigation={(db) => `/nav/${db}`}
          databases={['foo']}
        />
      ),
    { namespace: 'random', path: 'fooooo' }
  );
  expect(getByText(/^random/)).not.toBeNull();
});

it('renders extra databases with link', async () => {
  const { getByTestId } = await renderWithDatabase(() =>
    Promise.resolve(
      <DatabasePicker
        primary="foo"
        navigation={(db) => `/nav/${db}`}
        databases={['foo', 'bar', 'baz']}
      />
    )
  );

  expect((getByTestId('nav-foo') as HTMLAnchorElement).href).toContain(
    '/nav/foo'
  );
  expect((getByTestId('nav-bar') as HTMLAnchorElement).href).toContain(
    '/nav/bar'
  );
  expect((getByTestId('nav-baz') as HTMLAnchorElement).href).toContain(
    '/nav/baz'
  );
});

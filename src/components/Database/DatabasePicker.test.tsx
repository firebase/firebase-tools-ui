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

import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { DatabasePicker } from './DatabasePicker';

it('renders primary database name and link', () => {
  const { getByText } = render(
    <MemoryRouter>
      <DatabasePicker
        primary="foo"
        current="foo"
        navigation={db => `/nav/${db}`}
        databases={['foo']}
      />
    </MemoryRouter>
  );
  expect(getByText('foo')).not.toBeNull();
});

it('renders current database name even if it is not in list', () => {
  const { getByText } = render(
    <MemoryRouter>
      <DatabasePicker
        primary="foo"
        current="random"
        navigation={db => `/nav/${db}`}
        databases={['foo']}
      />
    </MemoryRouter>
  );
  expect(getByText('random')).not.toBeNull();
});

it('renders extra databases with link', () => {
  const { getByTestId } = render(
    <MemoryRouter>
      <DatabasePicker
        primary="foo"
        current="bar"
        navigation={db => `/nav/${db}`}
        databases={['foo', 'bar', 'baz']}
      />
    </MemoryRouter>
  );

  expect(getByTestId('nav-foo').href).toContain('/nav/foo');
  expect(getByTestId('nav-bar').href).toContain('/nav/bar');
  expect(getByTestId('nav-baz').href).toContain('/nav/baz');
});

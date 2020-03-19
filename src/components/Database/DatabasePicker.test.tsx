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

import { DatabasePicker } from './DatabasePicker';

it('renders primary database name and link', () => {
  const { getByTestId } = render(
    <DatabasePicker
      primary="foo"
      current="foo"
      navigation={db => <div data-testid={`nav-${db}`} />}
      databases={['foo']}
    />
  );
  expect(getByTestId('nav-foo')).not.toBeNull();
});

it('renders current database name even if it is not in list', () => {
  const { getByTestId } = render(
    <DatabasePicker
      primary="foo"
      current="random"
      navigation={db => <div data-testid={`nav-${db}`} />}
      databases={['foo']}
    />
  );
  expect(getByTestId('nav-random')).not.toBeNull();
});

it('renders extra databases with link', () => {
  const { getByTestId } = render(
    <DatabasePicker
      primary="foo"
      current="bar"
      navigation={db => <div data-testid={`nav-${db}`} />}
      databases={['foo', 'bar', 'baz']}
    />
  );
  expect(getByTestId('nav-foo')).not.toBeNull();
  expect(getByTestId('nav-bar')).not.toBeNull();
  expect(getByTestId('nav-baz')).not.toBeNull();
});

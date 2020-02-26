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
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppBar } from './index';

function isTabActive(labelEl) {
  const tabEl = labelEl.closest('.mdc-tab');
  return tabEl.className.includes('mdc-tab--active');
}

it('selects the matching nav-tab', () => {
  const history = {
    location: {
      pathname: '/database/foo/bar',
    },
  };

  const { getByText } = render(
    <MemoryRouter>
      <AppBar history={history} />
    </MemoryRouter>,
  );

  expect(isTabActive(getByText('rtdb'))).toBe(true);
  expect(isTabActive(getByText('overview'))).toBe(false);
});

it('selects the _overview_ tab if there is no route match', () => {
  const history = {
    location: {
      pathname: '/unknown/location',
    },
  };

  const { getByText } = render(
    <MemoryRouter>
      <AppBar history={history} />
    </MemoryRouter>,
  );

  expect(isTabActive(getByText('overview'))).toBe(true);
  expect(isTabActive(getByText('rtdb'))).toBe(false);
});

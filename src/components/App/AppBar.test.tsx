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
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

import { delay } from '../../test_utils';
import { AppBar } from './AppBar';

function isTabActive(labelEl: HTMLElement) {
  const tabEl = labelEl.closest('.mdc-tab')!;
  return tabEl.classList.contains('mdc-tab--active');
}

it('selects the matching nav-tab', async () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/bar']}>
      <AppBar
        routes={[
          {
            label: 'foo',
            path: '/foo',
            showInNav: true,
            component: React.Fragment,
            exact: false,
          },
          {
            label: 'bar',
            path: '/bar',
            showInNav: true,
            component: React.Fragment,
            exact: false,
          },
        ]}
      />
    </MemoryRouter>
  );

  await act(() => delay(300)); // Wait for tab indicator async DOM updates.

  expect(isTabActive(getByText('foo'))).toBe(false);
  expect(isTabActive(getByText('bar'))).toBe(true);
});

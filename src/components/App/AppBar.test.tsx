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

import { act, render, wait } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

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

  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait(); // dont ask. Due to TabScroller doing stuff on requestAnimationFrame

  expect(isTabActive(getByText('foo'))).toBe(false);
  expect(isTabActive(getByText('bar'))).toBe(true);
});

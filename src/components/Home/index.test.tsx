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
import { Home } from './index';
import { MemoryRouter } from 'react-router';

it('renders fetching placeholder when fetching config', () => {
  const config = { fetching: true };
  const { getByText } = render(
    <MemoryRouter>
      <Home config={config} />
    </MemoryRouter>
  );
  expect(getByText(/Fetching/)).not.toBeNull();
});

it('renders an overview when config is loaded', () => {
  const config = { fetching: false, config: { projectId: 'example' } };
  const { getByText } = render(
    <MemoryRouter>
      <Home config={config} />
    </MemoryRouter>
  );
  expect(getByText(/Emulator Overview/)).not.toBeNull();
});

it('shows port for emulator that are loaded', () => {
  const config = {
    fetching: false,
    config: {
      projectId: 'example',
      database: {
        host: 'localhost',
        port: 9000,
        hostAndPort: 'localhost:9000',
      },
    },
  };
  const { getByText } = render(
    <MemoryRouter>
      <Home config={config} />
    </MemoryRouter>
  );
  expect(getByText(/9000/)).not.toBeNull();
});

it('renders error message when errored', () => {
  const config = {
    fetching: false,
    error: { message: '420 Enhance Your Calm' },
  };
  const { getByText } = render(
    <MemoryRouter>
      <Home config={config} />
    </MemoryRouter>
  );
  expect(getByText('420 Enhance Your Calm')).not.toBeNull();
});

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
import { MemoryRouter } from 'react-router';

import { DatabaseConfig } from '../../store/config';
import { Database } from './Database';

const sampleConfig: DatabaseConfig = {
  host: 'localhost',
  port: 9000,
  hostAndPort: 'localhost:9000',
};

// Skipping because we don't actually have good tests for RTDB.
// TODO: Add some testing with mock database connection and real test cases.
it.skip('renders database content', () => {
  const { getByText } = render(
    <MemoryRouter>
      <Database namespace="example" config={sampleConfig} />
    </MemoryRouter>
  );
  expect(getByText('Loading')).not.toBeNull();
});

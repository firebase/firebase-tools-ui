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

import { Config } from '../../store/config';
import { TestEmulatorConfigProvider } from '../common/EmulatorConfigProvider';
import { AppDisconnected } from './AppDisconnected';

const disconnectedText = /All emulators for this project have stopped running/;

it('shows nothing when config is loading', () => {
  const { queryByText } = render(
    <TestEmulatorConfigProvider config={undefined}>
      <AppDisconnected />
    </TestEmulatorConfigProvider>
  );
  expect(queryByText(disconnectedText)).toBe(null);
});

it('shows nothing when config is successfully loaded', () => {
  const sampleConfig: Config = { projectId: 'example' };
  const { queryByText } = render(
    <TestEmulatorConfigProvider config={sampleConfig}>
      <AppDisconnected />
    </TestEmulatorConfigProvider>
  );
  expect(queryByText(disconnectedText)).toBe(null);
});

it('shows alert about disconnected when config is null', () => {
  const { getByText } = render(
    <TestEmulatorConfigProvider config={null}>
      <AppDisconnected />
    </TestEmulatorConfigProvider>
  );
  expect(getByText(disconnectedText)).not.toBe(null);
});

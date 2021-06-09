/**
 * Copyright 2019 Google LLC
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

import { RMWCProvider } from '@rmwc/provider';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { AuthConfig } from '../../store/config';
import { TestEmulatorConfigProvider } from '../common/EmulatorConfigProvider';
import { AuthRoute } from './index';
import { getMockAuthStore } from './test_utils';

const host = 'localhost';
const port = 5002;
const sampleConfig: AuthConfig = {
  host,
  port,
  hostAndPort: `${host}:${port}`,
};

describe('AuthRoute', () => {
  it('renders loading when config is not ready', () => {
    const { getByText } = render(
      <TestEmulatorConfigProvider config={undefined}>
        <Provider store={getMockAuthStore()}>
          <AuthRoute />
        </Provider>
      </TestEmulatorConfigProvider>
    );
    expect(getByText('Auth Emulator Loading...')).not.toBeNull();
  });

  it('renders error when loading config fails', () => {
    const { getByText } = render(
      <TestEmulatorConfigProvider config={null}>
        <Provider store={getMockAuthStore()}>
          <AuthRoute />
        </Provider>
      </TestEmulatorConfigProvider>
    );
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('renders error when auth emulator is not running', () => {
    const { getByText } = render(
      <TestEmulatorConfigProvider
        config={{ projectId: 'example' /* no auth */ }}
      >
        <Provider store={getMockAuthStore()}>
          <AuthRoute />
        </Provider>
      </TestEmulatorConfigProvider>
    );
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('displays auth', async () => {
    const store = getMockAuthStore();

    const { getByText } = render(
      <Provider store={store}>
        {/* Ripples cause "not wrapped in act()" warning. */}
        <RMWCProvider ripple={false}>
          <TestEmulatorConfigProvider
            config={{
              projectId: 'example',
              auth: sampleConfig,
            }}
          >
            <AuthRoute />
          </TestEmulatorConfigProvider>
        </RMWCProvider>
      </Provider>
    );
    expect(getByText(/No users for this project yet/)).not.toBeNull();
  });
});

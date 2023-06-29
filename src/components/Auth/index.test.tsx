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
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

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
    const history = createMemoryHistory({ initialEntries: ['/auth'] });

    const { getByText } = render(
      <TestEmulatorConfigProvider config={undefined}>
        <Provider store={getMockAuthStore()}>
          <Router history={history}>
            <AuthRoute />
          </Router>
        </Provider>
      </TestEmulatorConfigProvider>
    );
    expect(getByText('Auth Emulator Loading...')).not.toBeNull();
  });

  it('renders error when loading config fails', () => {
    const history = createMemoryHistory({ initialEntries: ['/auth'] });

    const { getByText } = render(
      <TestEmulatorConfigProvider config={null}>
        <Provider store={getMockAuthStore()}>
          <Router history={history}>
            <AuthRoute />
          </Router>
        </Provider>
      </TestEmulatorConfigProvider>
    );
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('renders error when auth emulator is not running', () => {
    const history = createMemoryHistory({ initialEntries: ['/auth'] });

    const { getByText } = render(
      <TestEmulatorConfigProvider
        config={{ projectId: 'example' /* no auth */ }}
      >
        <Provider store={getMockAuthStore()}>
          <Router history={history}>
            <AuthRoute />
          </Router>
        </Provider>
      </TestEmulatorConfigProvider>
    );
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('displays auth', async () => {
    const history = createMemoryHistory({ initialEntries: ['/auth'] });

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
            <Router history={history}>
              <AuthRoute />
            </Router>
          </TestEmulatorConfigProvider>
        </RMWCProvider>
      </Provider>
    );
    expect(getByText(/No users for this project yet/)).not.toBeNull();
  });
});

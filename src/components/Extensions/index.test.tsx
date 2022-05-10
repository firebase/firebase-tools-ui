/**
 * Copyright 2022 Google LLC
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
import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { Config } from '../../store/config/types';
import { TestEmulatorConfigProvider } from '../common/EmulatorConfigProvider';
import {
  BACKEND_EXTENSION,
  EXTENSION_SPEC,
  EXTENSION_VERSION,
} from './testing/utils';
import { Backend, ExtensionLink, ExtensionsRoute, RedirectToList } from '.';

const TestWrapper: React.FC<
  React.PropsWithChildren<{
    emulatorConfig?: Config | null;
    instanceId?: string;
  }>
> = ({ children, emulatorConfig, instanceId }) => (
  <MemoryRouter
    initialEntries={[`/extensions${instanceId ? `/${instanceId}` : ''}`]}
  >
    <TestEmulatorConfigProvider config={emulatorConfig}>
      {children}
    </TestEmulatorConfigProvider>
  </MemoryRouter>
);

describe('ExtensionsRoute', () => {
  function mockBackends(backends: Backend[] = []) {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve({ backends }),
    } as Response);
  }

  it('renders loading when config is not ready', () => {
    const { getByText } = render(<ExtensionsRoute />, { wrapper: TestWrapper });
    expect(getByText('Extensions Emulator Loading...')).not.toBeNull();
  });

  it('renders error when loading config fails', () => {
    const { getByText } = render(<ExtensionsRoute />, {
      wrapper: (props) => <TestWrapper {...props} emulatorConfig={null} />,
    });
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('renders error when auth emulator is not running', () => {
    const { getByText } = render(<ExtensionsRoute />, {
      wrapper: (props) => (
        <TestWrapper
          {...props}
          emulatorConfig={{ projectId: 'example' /* no extensions */ }}
        />
      ),
    });
    expect(getByText(/not running/)).not.toBeNull();
  });

  it('renders list of extensions when no instance-id is provided', async () => {
    mockBackends([
      { env: {} },
      {
        env: {},
        extensionInstanceId: 'foo-bar-published',
        extension: BACKEND_EXTENSION,
        extensionVersion: EXTENSION_VERSION,
      },
      {
        env: {},
        extensionInstanceId: 'foo-bar-local',
        extensionSpec: EXTENSION_SPEC,
      },
    ]);

    const { findByText } = render(<ExtensionsRoute />, {
      wrapper: (props) => (
        <TestWrapper
          {...props}
          emulatorConfig={{
            projectId: 'example',
            extensions: {
              hostAndPort: 'foo',
              host: 'foo',
              port: 1234,
            },
          }}
        />
      ),
    });
    expect(await findByText(/Good Tool/)).not.toBeNull();
    expect(await findByText(/Pirojok-the-tool/)).not.toBeNull();
  });

  it('renders details of extension with a given instance-id', async () => {
    mockBackends([
      { env: {} },
      {
        env: {},
        extensionInstanceId: 'foo-bar-published',
        extension: BACKEND_EXTENSION,
        extensionVersion: EXTENSION_VERSION,
      },
      {
        env: {},
        extensionInstanceId: 'foo-bar-local',
        extensionSpec: EXTENSION_SPEC,
      },
    ]);

    const { findByText } = render(<ExtensionsRoute />, {
      wrapper: (props) => (
        <TestWrapper
          {...props}
          emulatorConfig={{
            projectId: 'example',
            extensions: {
              hostAndPort: 'foo',
              host: 'foo',
              port: 1234,
            },
          }}
          instanceId="foo-bar-published"
        />
      ),
    });
    expect(await findByText('awesome-inc/good-tool@0.0.1')).not.toBeNull();
  });
});

describe('ExtensionsLink', () => {
  it('redirects to details page', async () => {
    const TestCurrentPathname: React.FC<
      React.PropsWithChildren<unknown>
    > = () => {
      const location = useLocation();

      return <>{location.pathname}</>;
    };

    const { getByText } = render(
      <MemoryRouter>
        <ExtensionLink instanceId="foo-bar">click me</ExtensionLink>
        <TestCurrentPathname />
      </MemoryRouter>
    );

    getByText('click me').click();

    expect(getByText(/foo/)).not.toBeNull();
  });
});

describe('ExtensionsRedirect', () => {
  it('redirects to list page', () => {
    const wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
      children,
    }) => {
      return (
        <MemoryRouter>
          <RedirectToList />
          {children}
        </MemoryRouter>
      );
    };

    const { result } = renderHook(() => useLocation(), { wrapper });
    expect(result.current.pathname).toBe('/extensions');
  });
});

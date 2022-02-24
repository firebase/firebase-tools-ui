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

import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { TestEmulatorConfigProvider } from '../common/EmulatorConfigProvider';
import { Backend, useExtensionBackends } from './api';
import { EXTENSION, EXTENSION_SPEC, EXTENSION_VERSION } from './testing/utils';

describe('API', () => {
  function setup({ mockBackends = [] as Backend[] } = {}) {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve({ backends: mockBackends }),
    } as Response);

    const wrapper: React.FC = ({ children }) => (
      <TestEmulatorConfigProvider
        config={{
          projectId: 'example',
          functions: {
            hostAndPort: 'google.com:1234',
            host: 'google.com',
            port: 1234,
          },
        }}
      >
        {children}
      </TestEmulatorConfigProvider>
    );

    return { wrapper };
  }

  it('filters out backends that are neither published-extensions or local-extensions', async () => {
    const wrapper = setup({
      mockBackends: [
        { env: {} },
        {
          env: {},
          extensionInstanceId: 'foo-bar',
          extension: EXTENSION,
          extensionVersion: EXTENSION_VERSION,
        },
        {
          env: {},
          extensionInstanceId: 'foo-bar',
          extensionSpec: EXTENSION_SPEC,
        },
      ],
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useExtensionBackends(),
      wrapper
    );

    await waitForNextUpdate();

    expect(result.current.length).toBe(2);
  });
});

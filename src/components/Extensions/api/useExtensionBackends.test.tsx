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

import { renderHook } from '@testing-library/react-hooks';
import React, { Suspense } from 'react';

import { mockExtensionBackends } from '../testing/mockExtensionBackend';
import { TestExtensionsProvider } from '../testing/TestExtensionsProvider';
import { BACKEND_LIST } from '../testing/utils';
import { useExtensionBackends } from './useExtensionBackends';

describe('useExtensionBackends', () => {
  it('returns the list of extension backends', async () => {
    mockExtensionBackends(BACKEND_LIST);
    const wrapper: React.FC = ({ children }) => {
      return (
        <TestExtensionsProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </TestExtensionsProvider>
      );
    };

    const { result, waitForNextUpdate } = renderHook(
      () => useExtensionBackends(),
      {
        wrapper,
      }
    );

    await waitForNextUpdate();
    expect(result.current).toEqual([BACKEND_LIST[0], BACKEND_LIST[1]]);
  });
});

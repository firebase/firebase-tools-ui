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

import { EXTENSION, EXTENSION_SPEC, EXTENSION_VERSION } from '../testing/utils';
import {
  ExtensionBackend,
  ExtensionsProvider,
  useExtensions,
} from './useExtensions';

describe('useExtensions', () => {
  it('returns the list of extension backends', () => {
    const want: ExtensionBackend[] = [
      {
        env: {},
        extensionInstanceId: 'foo-published',
        extension: EXTENSION,
        extensionVersion: EXTENSION_VERSION,
      },
      {
        env: {},
        extensionInstanceId: 'foo-local',
        extensionSpec: EXTENSION_SPEC,
      },
    ];

    const wrapper: React.FC = ({ children }) => (
      <ExtensionsProvider extensionBackends={want}>
        {children}
      </ExtensionsProvider>
    );

    const { result } = renderHook(() => useExtensions(), { wrapper });
    expect(result.current).toEqual(want);
  });
});

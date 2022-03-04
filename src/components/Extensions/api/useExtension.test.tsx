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

import { Extension } from '../models';
import { EXTENSION, EXTENSION_SPEC, EXTENSION_VERSION } from '../testing/utils';
import { convertBackendToExtension } from './internal/useExtensionData';
import { InstanceIdProvider, useExtension } from './useExtension';
import { ExtensionsProvider } from './useExtensions';

describe('useExtension', () => {
  it('returns the unique extension backend with instance-id', () => {
    const want: Extension = convertBackendToExtension({
      env: {},
      extensionInstanceId: 'foo-published',
      extension: EXTENSION,
      extensionVersion: EXTENSION_VERSION,
    });
    const other: Extension = convertBackendToExtension({
      env: {},
      extensionInstanceId: 'foo-local',
      extensionSpec: EXTENSION_SPEC,
    });

    const wrapper: React.FC = ({ children }) => (
      <ExtensionsProvider extensions={[want, other]}>
        <InstanceIdProvider instanceId="foo-published">
          {children}
        </InstanceIdProvider>
      </ExtensionsProvider>
    );

    const { result } = renderHook(() => useExtension(), { wrapper });
    expect(result.current).toEqual(want);
  });
});

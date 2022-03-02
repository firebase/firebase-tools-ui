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

import React, { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { Config } from '../../../store/config/types';
import { TestEmulatorConfigProvider } from '../../common/EmulatorConfigProvider';
import { convertBackendsToRawSpecs } from '../api/useExtensionRowSpec';
import {
  ExtensionBackend,
  ExtensionsProvider,
  ExtensionsSpecProvider,
} from '../api/useExtensions';

export const TestExtensionsProvider: React.FC<{
  instanceId?: string;
  extensions?: ExtensionBackend[];
}> = ({ children, instanceId, extensions = [] }) => {
  const pagePath = `/extensions${instanceId ? `/${instanceId}` : ''}`;
  const emulatorConfig: Config = {
    projectId: 'example',
    extensions: {
      hostAndPort: 'google.com:1234',
      host: 'google.com',
      port: 1234,
    },
  };

  return (
    <MemoryRouter initialEntries={[pagePath]}>
      <TestEmulatorConfigProvider config={emulatorConfig}>
        <ExtensionsProvider extensionBackends={extensions}>
          <ExtensionsSpecProvider
            extensionRowSpecs={convertBackendsToRawSpecs(extensions)}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </ExtensionsSpecProvider>
        </ExtensionsProvider>
      </TestEmulatorConfigProvider>
    </MemoryRouter>
  );
};

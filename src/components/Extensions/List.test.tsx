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

import { isExtensionBackend } from './api/internal/useExtensionBackends';
import { ExtensionsList } from './List';
import { TestExtensionsProvider } from './testing/TestExtensionsProvider';
import { BACKEND_LIST } from './testing/utils';

describe('ExtensionsList', () => {
  it('renders list of extensions', () => {
    const { getByText } = render(
      <TestExtensionsProvider
        extensions={BACKEND_LIST.filter(isExtensionBackend)}
      >
        <ExtensionsList />
      </TestExtensionsProvider>
    );

    expect(getByText('Good Tool')).not.toBeNull();
    expect(getByText('Pirojok-the-tool')).not.toBeNull();
  });
});

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

import { Extension } from '../models';
import { TestExtensionsProvider } from '../testing/TestExtensionsProvider';
import { DetailsHeader } from './DetailsHeader';

describe('ExtensionDetailsHeader', () => {
  it('renders header of extension', () => {
    const displayName = 'Pirojok-the-extension';
    const extension: Extension = { id: 'pirojok', displayName } as Extension;

    const { getByText } = render(
      <TestExtensionsProvider extensions={[]}>
        <DetailsHeader extension={extension} />
      </TestExtensionsProvider>
    );
    expect(getByText('Pirojok-the-extension')).not.toBeNull();
  });
});

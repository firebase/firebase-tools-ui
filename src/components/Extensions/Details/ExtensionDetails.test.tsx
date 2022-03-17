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

import { TestExtensionsProvider } from '../testing/TestExtensionsProvider';
import { EXTENSION } from '../testing/utils';
import { ExtensionDetails } from './ExtensionDetails';

describe('ExtensionDetails', () => {
  it('renders details of extension', () => {
    const { getByText, getAllByRole } = render(
      <TestExtensionsProvider
        extensions={[EXTENSION]}
        instanceId={EXTENSION.id}
      >
        <ExtensionDetails />
      </TestExtensionsProvider>
    );

    expect(getByText(EXTENSION.ref!)).not.toBeNull();
    expect(getByText(/Markdown/)).not.toBeNull();
    expect(getAllByRole('tab').length).toBe(4);
  });
});

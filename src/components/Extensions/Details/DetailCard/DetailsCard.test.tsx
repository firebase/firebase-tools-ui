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

import { Extension } from '../../models';
import { TestExtensionsProvider } from '../../testing/TestExtensionsProvider';
import { EXTENSION, EXTENSION_ID } from '../../testing/utils';
import { DetailsCard } from './DetailsCard';

function setup(extension: Extension) {
  return render(
    <TestExtensionsProvider extensions={[EXTENSION]} instanceId={EXTENSION_ID}>
      <DetailsCard extension={extension} />
    </TestExtensionsProvider>
  );
}

describe('DetailsCard', () => {
  it('displays 2 tabs if there is only basic info', () => {
    const displayName = 'Pirojok-the-extension';
    const extension: Extension = { id: 'pirojok', displayName } as Extension;

    const { getAllByRole, getByText } = setup(extension);

    expect(getAllByRole('tab').length).toBe(2);
    expect(getByText('Source code')).not.toBeNull();
  });

  it('displays 4 tabs if all info is present', () => {
    const { getAllByRole, getByText } = setup(EXTENSION);

    expect(getAllByRole('tab').length).toBe(4);
    expect(getByText('Source code')).not.toBeNull();
  });
});

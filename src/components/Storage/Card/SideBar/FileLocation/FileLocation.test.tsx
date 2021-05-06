/**
 * Copyright 2021 Google LLC
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

import { act, fireEvent } from '@testing-library/react';

import { mockTokens } from '../../../testing/mockTokens';
import { renderWithStorage } from '../../../testing/renderWithStorage';
import { FileLocation } from './FileLocation';

describe('FileLocation', () => {
  const name = 'pirojok.jpg';
  const token = 'token-a';

  async function setup() {
    mockTokens([token, 'token-b']);
    return await renderWithStorage(<FileLocation fullPath={name} />);
  }

  it('displays the data', async () => {
    const { getByText, defaultBucket } = await setup();
    // Open
    await act(async () => {
      await fireEvent.click(getByText('File location'));
    });

    // File path is there
    expect(getByText(`gs://${defaultBucket}/${name}`)).toBeDefined();
  });
});

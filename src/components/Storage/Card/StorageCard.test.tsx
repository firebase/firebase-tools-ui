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
import React from 'react';

import { mockTokens } from '../testing/mockTokens';
import { renderWithStorage } from '../testing/renderWithStorage';
import { StorageCard } from './StorageCard';

describe('StorageCard', () => {
  const fileName = 'pirojok.txt';
  beforeEach(() => mockTokens());

  it('displays regular header by default', async () => {
    const {
      getByText,
      getByLabelText,
      defaultBucket,
    } = await renderWithStorage(<StorageCard />);

    expect(getByText(`gs://${defaultBucket}`)).toBeDefined();
    expect(getByLabelText('Copy')).toBeDefined();
  });

  it('displays action header once a file was selected', async () => {
    const { getByText, getByLabelText, uploadFile } = await renderWithStorage(
      <StorageCard />
    );

    await uploadFile(fileName);

    await act(async () => {
      await fireEvent.click(getByLabelText(fileName));
    });

    // Action header
    expect(getByText('1 item(s)')).toBeDefined();
  });

  it('displays the sidebar when clicking on a file', async () => {
    const { getByText, getByRole, uploadFile } = await renderWithStorage(
      <StorageCard />
    );

    await uploadFile(fileName);

    await act(async () => {
      await fireEvent.click(getByText(fileName));
    });

    expect(getByRole('complementary')).toBeDefined();
  });
});

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

import { act, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithStorage } from '../../testing/renderWithStorage';
import { confirmDeleteAllFiles } from './confirmDeleteAllFiles';
import { DeleteAllButton } from './DeleteAllButton';

jest.mock('./confirmDeleteAllFiles.tsx');

describe('DeleteAllButton', () => {
  it('deletes all files', async () => {
    const { getByText, uploadFile, waitForNFiles } = await renderWithStorage(
      <DeleteAllButton />
    );

    confirmDeleteAllFiles.mockReturnValueOnce(Promise.resolve(true));

    await uploadFile('lol.txt');

    const button = getByText('Delete all files');
    await waitFor(() => expect(button.parentElement.disabled).not.toBe(true), {
      timeout: true,
    });

    await act(async () => {
      await fireEvent.click(button);
    });

    expect(await waitForNFiles(0)).toBe(true);
  });
});

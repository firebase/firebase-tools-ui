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

import { waitAlertDialogToOpen } from '../../../../../../../test_utils';
import { renderWithStorage } from '../../../../../testing/renderWithStorage';
import { CreateFolder } from './CreateFolder';

describe('CreateFolder', () => {
  it('opens folder', async () => {
    const {
      getByLabelText,
      getByText,
      waitForNFiles,
    } = await renderWithStorage(<CreateFolder />);
    const newFolder = getByLabelText('Create new folder');
    await act(async () => {
      await fireEvent.click(newFolder);
    });

    await waitAlertDialogToOpen();

    await act(async () => {
      await fireEvent.click(getByText('Create'));
    });

    expect(waitForNFiles(1)).toBe(true);
  });
});

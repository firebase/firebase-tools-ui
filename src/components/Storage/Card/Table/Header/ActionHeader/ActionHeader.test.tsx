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

import { fireEvent } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { UseMultiselectResult } from '../../../../common/useMultiselect';
import { renderWithStorage } from '../../../../testing/renderWithStorage';
import { ActionHeader } from './ActionHeader';

describe('ActionHeader', () => {
  it('allows to delete files', async () => {
    const selected = new Set(['lol.jpg']);

    const clearAll = jest.fn();
    const selection = ({
      selected,
      clearAll,
    } as unknown) as UseMultiselectResult;

    const {
      uploadFile,
      waitForNFiles,
      waitForFilesToBeUploaded,
      getByText,
    } = await renderWithStorage(<ActionHeader selection={selection} />);

    await uploadFile('lol.jpg');
    await waitForFilesToBeUploaded(1);

    await act(async () => {
      await fireEvent.click(getByText('Delete'));
    });

    expect(await waitForNFiles(0)).toBe(true);
    // Clears selection
    expect(clearAll).toHaveBeenCalled();
  });
});

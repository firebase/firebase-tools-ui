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

import { mockTokens } from '../../testing/mockTokens';
import { renderWithStorage } from '../../testing/renderWithStorage';
import { StorageFile } from '../../types';
import { SideBar } from './SideBar';

describe('SideBar', () => {
  async function setup() {
    const file = { name: 'pirojok', fullPath: 'lol.txt' } as StorageFile;
    const close = jest.fn();

    mockTokens();

    const storageFiles = await renderWithStorage(
      <SideBar file={file} closeSidebar={close} />
    );

    return {
      file,
      close,
      ...storageFiles,
    };
  }

  it('displays header by default', async () => {
    const { close, getByLabelText } = await setup();

    expect(close).not.toHaveBeenCalled();

    await act(async () => {
      await fireEvent.click(getByLabelText('Close'));
    });

    expect(close).toHaveBeenCalled();
  });
});

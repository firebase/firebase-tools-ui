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

import React from 'react';

import { renderWithStorage } from '../../../testing/renderWithStorage';
import { StorageFile } from '../../../types';
import { StoragePreviewUnwrapped } from './StoragePreview';
import * as usePreviewUrl from './usePreviewUrl';

describe('StoragePreview', () => {
  const file = {} as StorageFile;
  it('Renders image', async () => {
    jest.spyOn(usePreviewUrl, 'usePreviewUrl').mockReturnValueOnce('LOL');
    const { getByAltText } = await renderWithStorage(
      <StoragePreviewUnwrapped file={file} />
    );
    expect(getByAltText('Preview')).toBeDefined();
  });

  it('does not render the image if preview URL is not present', async () => {
    jest.spyOn(usePreviewUrl, 'usePreviewUrl').mockReturnValueOnce(undefined);
    const { queryByAltText } = await renderWithStorage(
      <StoragePreviewUnwrapped file={file} />
    );
    expect(queryByAltText('Preview')).toBeNull();
  });
});

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
import { act } from 'react-dom/test-utils';

import { wrapWithForm } from '../../../../test_utils';
import { AddAuthUserPayload } from '../../types';
import { ImageUrlInput } from './ImageUrlInput';

describe('ImageUrlInput', () => {
  function setup(defaultValues: Partial<AddAuthUserPayload>) {
    const mockImage = { src: '', onload: undefined, onerror: undefined };
    const MockImageConstructor = (function () {
      return mockImage;
    } as unknown) as new () => HTMLImageElement;

    const methods = wrapWithForm(
      ImageUrlInput,
      { defaultValues },
      { ImageConstructor: MockImageConstructor }
    );

    return { ...methods, mockImage };
  }

  describe('image validation', () => {
    it('displays an error if image failed to load', async () => {
      const { getByText, mockImage, triggerValidation } = setup({
        photoUrl: 'lol.png',
      });

      act(() => {
        mockImage.onerror && (mockImage.onerror! as Function)();
      });

      await triggerValidation();
      getByText('Error loading image');
    });

    it('displays an image if image loaded', async () => {
      const { getByAltText, mockImage, triggerValidation } = setup({
        photoUrl: 'lol.png',
      });

      act(() => {
        mockImage.onload && (mockImage.onload! as Function)();
      });

      await triggerValidation();
      getByAltText('Profile preview');
    });

    it('displays loading spinner', async () => {
      const { getByTestId, triggerValidation } = setup({ photoUrl: 'lol.png' });
      await triggerValidation();
      getByTestId('spinner');
    });

    it('displays nothing if there is no image', async () => {
      const {
        queryByTestId,
        queryByText,
        queryByAltText,
        triggerValidation,
      } = setup({ photoUrl: '' });
      await triggerValidation();
      expect(queryByTestId('spinner')).toBeNull();
      expect(queryByAltText('Profile preview')).toBeNull();
      expect(queryByText('Error loading image')).toBeNull();
    });
  });
});

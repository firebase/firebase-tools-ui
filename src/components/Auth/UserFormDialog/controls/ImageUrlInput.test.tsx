import React from 'react';
import { act } from 'react-dom/test-utils';

import { wrapWithForm } from '../../../../test_utils';
import { AddAuthUserPayload } from '../../types';
import { ImageUrlInput } from './ImageUrlInput';

describe('ImageUrlInput', () => {
  function setup(defaultValues: Partial<AddAuthUserPayload>) {
    const mockImage = { src: '', onload: undefined, onerror: undefined };
    const MockImageConstructor = (function() {
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

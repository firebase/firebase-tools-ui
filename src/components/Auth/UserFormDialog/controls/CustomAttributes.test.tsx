import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { CustomAttributes } from './CustomAttributes';

describe('CustomAttributes', () => {
  function setup(customAttributes: string) {
    const defaultValues = {
      customAttributes: '{}',
    };

    return wrapWithForm(CustomAttributes, { defaultValues });
  }

  it('displays no errors for an empty object', async () => {
    const { triggerValidation, queryByRole } = setup('{}');
    await triggerValidation();
    expect(queryByRole('alert')).toBe(null);
  });
  it('displays an error for invalid JSON', async () => {
    const { triggerValidation, queryByRole } = setup('pirojok');
    await triggerValidation();
    expect(queryByRole('alert')).not.toBe(null);
  });
});

import { fireEvent } from '@testing-library/react';
import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { AddAuthUserPayload } from '../../types';
import { PhoneControl } from './PhoneControl';

describe('PhoneControl', () => {
  function setup(defaultValues?: Partial<AddAuthUserPayload>) {
    return wrapWithForm(PhoneControl, { defaultValues });
  }

  it('maps to the appropriate form value', async () => {
    const { getByPlaceholderText, triggerValidation, submit } = setup();
    const phone = '+1 777 77777777';

    fireEvent.change(getByPlaceholderText('Enter phone number'), {
      target: { value: phone },
    });

    await triggerValidation();
    expect(submit).toHaveBeenCalledWith(
      {
        phone,
      },
      jasmine.any(Object)
    );
  });
});

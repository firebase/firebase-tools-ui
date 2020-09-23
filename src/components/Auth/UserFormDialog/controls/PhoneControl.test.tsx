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
    const phoneNumber = '+1 689-689-6896';

    const input = getByPlaceholderText('Enter phone number');
    fireEvent.change(input, {
      target: { value: phoneNumber },
    });

    fireEvent.blur(input);
    await triggerValidation();
    expect(submit).toHaveBeenCalledWith(
      {
        phoneNumber,
      },
      jasmine.any(Object)
    );
  });

  it('displays an error if leading plus is missing', async () => {
    const {
      getByPlaceholderText,
      getByText,
      triggerValidation,
      submit,
    } = setup();
    // Leading "+" missing.
    const phoneNumber = '1 689-689-6896';

    const input = getByPlaceholderText('Enter phone number');
    fireEvent.change(input, {
      target: { value: phoneNumber },
    });

    fireEvent.blur(input);

    await triggerValidation();
    getByText(/Phone number must start/);
    expect(submit).not.toHaveBeenCalled();
  });
});

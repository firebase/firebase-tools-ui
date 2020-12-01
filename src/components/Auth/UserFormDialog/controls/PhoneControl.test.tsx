import { fireEvent } from '@testing-library/react';
import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { PhoneControl, PhoneControlProps } from './PhoneControl';

describe('PhoneControl', () => {
  const dupePhoneNumber = '+123';

  function setup(props?: PhoneControlProps) {
    return wrapWithForm(
      PhoneControl,
      {},
      props || { allPhoneNumbers: new Set<string>() }
    );
  }

  it('maps to the appropriate form value', async () => {
    const { getByPlaceholderText, triggerValidation, submit } = setup();
    const phoneNumber = '+1 555-555-0100';

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

  it('displays an error for a duplicate value', async () => {
    const {
      getByPlaceholderText,
      getByText,
      triggerValidation,
      submit,
    } = setup({ allPhoneNumbers: new Set([dupePhoneNumber]) });
    const input = getByPlaceholderText('Enter phone number');
    fireEvent.change(input, {
      target: { value: dupePhoneNumber },
    });

    fireEvent.blur(input);

    await triggerValidation();
    getByText(/User with this phone/);
    expect(submit).not.toHaveBeenCalled();
  });

  it('does not display an error for edited email', async () => {
    const {
      getByPlaceholderText,
      queryByText,
      triggerValidation,
      submit,
    } = setup({
      editedUserPhoneNumber: dupePhoneNumber,
      allPhoneNumbers: new Set([dupePhoneNumber]),
    });

    const input = getByPlaceholderText('Enter phone number');
    fireEvent.change(input, {
      target: { value: dupePhoneNumber },
    });

    fireEvent.blur(input);

    await triggerValidation();
    expect(queryByText(/User with this phone/)).toBeNull();
    expect(submit).toHaveBeenCalled();
  });

  it('displays an error if leading plus is missing', async () => {
    const {
      getByPlaceholderText,
      getByText,
      triggerValidation,
      submit,
    } = setup();
    // Leading "+" missing.
    const phoneNumber = '1 555-555-0100';

    const input = getByPlaceholderText('Enter phone number');
    fireEvent.change(input, {
      target: { value: phoneNumber },
    });

    fireEvent.blur(input);

    await triggerValidation();
    getByText(/Phone number must be in international format/);
    expect(submit).not.toHaveBeenCalled();
  });
});

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
      expect.any(Object)
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

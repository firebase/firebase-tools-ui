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
import { FormContextValues } from 'react-hook-form';
import { Provider } from 'react-redux';

import { wrapWithForm } from '../../../../test_utils';
import { createFakeUser, getMockAuthStore } from '../../test_utils';
import { AddAuthUserPayload, AuthFormUser, AuthState } from '../../types';
import Email from './Email';
import Password from './Password';

describe('EmailPassword', () => {
  const validEmail = 'pir@j.k';

  function setup(
    defaultValues: Partial<AddAuthUserPayload>,
    state?: Partial<AuthState>
  ) {
    const store = getMockAuthStore(state);

    return wrapWithForm(
      (props: FormContextValues<AuthFormUser>) => (
        <Provider store={store}>
          <Email {...props} />
          <Password {...props} />
        </Provider>
      ),
      { defaultValues },
      {}
    );
  }

  describe('requiring both values or none', () => {
    const emailRequiredErrorText =
      'Email is required for password authentication';

    it('is valid when both empty', () => {
      const { queryByText } = setup({ email: '', password: '' });
      expect(queryByText(emailRequiredErrorText)).toBeNull();
    });

    it('is valid when both present', () => {
      const { queryByText } = setup({ email: validEmail, password: 'pelmeni' });
      expect(queryByText(emailRequiredErrorText)).toBeNull();
    });

    it('is invalid if just password is present', () => {
      const { getByText } = setup({ email: '', password: 'pelmeni' });
      expect(getByText(emailRequiredErrorText)).not.toBeNull();
    });
  });

  describe('email validation', () => {
    const errorText = 'Invalid email';

    it('valid for valid email', () => {
      const { queryByText } = setup({ email: validEmail, password: 'pelmeni' });
      expect(queryByText(errorText)).toBeNull();
    });

    it('invalid for invalid email', async () => {
      const { queryByText, triggerValidation } = setup({
        email: 'pirojok',
        password: 'lol',
      });
      await triggerValidation();
      expect(queryByText(errorText)).not.toBeNull();
    });

    it('invalid for duplicate email', async () => {
      const { getByText, triggerValidation, getByLabelText } = setup(
        {
          email: '',
          password: 'lollol',
        },
        {
          users: {
            loading: false,
            result: {
              data: [createFakeUser({ email: validEmail })],
            },
          },
        }
      );
      const emailInput = getByLabelText('Email (optional)');
      fireEvent.change(emailInput, {
        target: { value: validEmail },
      });

      await triggerValidation();
      expect(getByText('User with this email already exists')).not.toBeNull();
    });

    it('valid for email that is being edited', async () => {
      const { queryByText, triggerValidation } = setup(
        {
          email: validEmail,
          password: 'lollol',
        },
        {
          users: {
            loading: false,
            result: {
              data: [createFakeUser({ email: validEmail })],
            },
          },
        }
      );
      await triggerValidation();
      expect(queryByText('User with this email already exists')).toBeNull();
    });
  });

  describe('password validation', () => {
    const errorText = /Password should be at least/;

    it('valid for password longer than 6 characters', () => {
      const { queryByText } = setup({
        email: validEmail,
        password: 'suchlong',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('invalid for invalid password', async () => {
      const { queryByText, triggerValidation } = setup({
        email: validEmail,
        password: 'short',
      });
      await triggerValidation();
      expect(queryByText(errorText)).not.toBeNull();
      expect(queryByText('Invalid email')).toBeNull();
    });
  });
});

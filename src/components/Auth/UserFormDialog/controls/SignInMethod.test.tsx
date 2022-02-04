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
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
import { Provider } from 'react-redux';

import { wrapWithForm } from '../../../../test_utils';
import { getMockAuthStore } from '../../test_utils';
import { AddAuthUserPayload, AuthFormUser } from '../../types';
import Email from './Email';
import { SignInMethod, SignInMethodProps } from './SignInMethod';

describe('SignInMethod', () => {
  const validEmail = 'pir@j.k';
  const validPassword = 'pelmeni';

  async function setup(defaultValues: Partial<AddAuthUserPayload>) {
    const store = getMockAuthStore();
    const methods = wrapWithForm(
      (props: SignInMethodProps & FormContextValues<AuthFormUser>) => (
        <Provider store={store}>
          <Email {...props} />
          <SignInMethod {...props} />
        </Provider>
      ),
      { defaultValues },
      { isEditing: false }
    );

    const password = methods.getByLabelText('Password');

    fireEvent.change(password, {
      target: { value: 'just need to make this dirty' },
    });

    await methods.triggerValidation();

    fireEvent.change(password, {
      target: { value: defaultValues.password },
    });

    fireEvent.blur(password);

    await methods.triggerValidation();
    return methods;
  }

  describe('requiring at least one value', () => {
    const errorText = /One method is required. Please enter either an email\/password or phone number./;

    it('is valid when phoneNumber present', async () => {
      const { queryByText } = await setup({
        email: '',
        password: '',
        phoneNumber: '+1 689 689 6899',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('is valid when email and valid password are present', async () => {
      const { queryByText } = await setup({
        email: validEmail,
        password: validPassword,
        phoneNumber: '',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('is valid when everything is present', async () => {
      const { queryByText } = await setup({
        email: validEmail,
        password: validPassword,
        phoneNumber: '+1 689 689 6899',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('does not show error, if any other error is present', async () => {
      const { queryByText } = await setup({
        email: validEmail,
        password: '',
        phoneNumber: '+1 689 689 6899',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('shows error, if nothing is present', async () => {
      const { getByText } = await setup({
        password: '',
        phoneNumber: '',
      });

      expect(getByText(errorText)).not.toBeNull();
    });
  });
});

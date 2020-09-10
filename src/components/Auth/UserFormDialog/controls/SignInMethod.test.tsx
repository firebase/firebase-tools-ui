import { fireEvent } from '@testing-library/react';
import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { AddAuthUserPayload } from '../../types';
import { SignInMethod } from './SignInMethod';

describe('SignInMethod', () => {
  const validEmail = 'pir@j.k';
  const validPassword = 'pelmeni';

  async function setup(defaultValues: Partial<AddAuthUserPayload>) {
    const methods = wrapWithForm(
      SignInMethod,
      { defaultValues },
      { isEditing: false }
    );

    const email = methods.getByLabelText('Email/Password');

    fireEvent.change(email, {
      target: { value: 'just need to make this dirty' },
    });

    await methods.triggerValidation();

    fireEvent.change(email, {
      target: { value: defaultValues.email },
    });

    fireEvent.blur(email);

    await methods.triggerValidation();
    return methods;
  }

  describe('requiring at least one value', () => {
    const errorText = /One method is required./;

    it('is valid when phone present', async () => {
      const { queryByText } = await setup({
        email: '',
        password: '',
        phone: '1 689 689 6899',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('is valid when email/validPassword present', async () => {
      const { queryByText } = await setup({
        email: validEmail,
        password: validPassword,
        phone: '',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('is valid when everything is present', async () => {
      const { queryByText } = await setup({
        email: validEmail,
        password: validPassword,
        phone: '1 689 689 6899',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('does not show error, if any other error is present', async () => {
      const { queryByText } = await setup({
        email: validEmail,
        password: '',
        phone: '1 689 689 6899',
      });
      expect(queryByText(errorText)).toBeNull();
    });

    it('shows error, if nothing is present', async () => {
      const { getByText } = await setup({ email: '', password: '', phone: '' });

      expect(getByText(errorText)).not.toBeNull();
    });
  });
});

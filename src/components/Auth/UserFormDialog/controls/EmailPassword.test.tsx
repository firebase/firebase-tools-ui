import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { AddAuthUserPayload } from '../../types';
import { EmailPassword } from './EmailPassword';

describe('EmailPassword', () => {
  function setup(defaultValues: Partial<AddAuthUserPayload>) {
    return wrapWithForm(EmailPassword, { defaultValues });
  }

  describe('requiring both values or none', () => {
    const errorText = 'Both email and password should be present';

    it('is valid when both empty', () => {
      const { queryByText } = setup({ email: '', password: '' });
      expect(queryByText(errorText)).toBeNull();
    });

    it('is valid when both present', () => {
      const { queryByText } = setup({ email: 'pir@j.k', password: 'lol' });
      expect(queryByText(errorText)).toBeNull();
    });

    it('is invalid if just password is present', () => {
      const { getByText } = setup({ email: '', password: 'lol' });
      getByText(errorText);
    });

    it('is invalid if just email is present', () => {
      const { getByText } = setup({ email: 'pir@j.k', password: '' });
      getByText(errorText);
    });
  });

  describe('email validation', () => {
    const errorText = 'Invalid email';

    it('valid for valid email', () => {
      const { queryByText } = setup({ email: 'pir@j.k', password: 'lol' });
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
  });
});

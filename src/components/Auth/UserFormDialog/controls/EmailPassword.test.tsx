import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { AddAuthUserPayload } from '../../types';
import { EmailPassword } from './EmailPassword';

describe('EmailPassword', () => {
  const validEmail = 'pir@j.k';

  function setup(
    defaultValues: Partial<AddAuthUserPayload>,
    props = { isEditing: true }
  ) {
    return wrapWithForm(EmailPassword, { defaultValues }, props);
  }

  describe('requiring both values or none', () => {
    const errorText = 'Both email and password should be present';

    it('is valid when both empty', () => {
      const { queryByText } = setup(
        { email: '', password: '' },
        { isEditing: true }
      );
      expect(queryByText(errorText)).toBeNull();
    });

    it('is valid when both present', () => {
      const { queryByText } = setup(
        { email: validEmail, password: 'pelmeni' },
        { isEditing: true }
      );
      expect(queryByText(errorText)).toBeNull();
    });

    it('ignores empty password for the edit mode', () => {
      const { queryByText } = setup(
        { email: validEmail, password: '' },
        { isEditing: true }
      );
      expect(queryByText(errorText)).toBeNull();
    });

    it('is invalid if just password is present', () => {
      const { getByText } = setup(
        { email: '', password: 'pelmeni' },
        { isEditing: false }
      );
      getByText(errorText);
    });

    it('is invalid if just email is present', () => {
      const { getByText } = setup(
        { email: validEmail, password: '' },
        { isEditing: false }
      );
      getByText(errorText);
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
  });

  describe('passoword validation', () => {
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

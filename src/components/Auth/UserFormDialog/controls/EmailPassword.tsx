import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';

// Consistent with the Auth JS SDK and the Auth Emulator.
const EMAIL_REGEX = /^[^@]+@[^@]+$/;

function getErrorText(errors: any) {
  if (errors) {
    if (errors.email) {
      return 'Invalid email';
    }
    if (errors.emailpassword) {
      return 'Both email and password should be present';
    }
  }
}

export const EmailPassword: React.FC<FormContextValues<AddAuthUserPayload>> = ({
  register,
  watch,
  setError,
  clearError,
  errors,
}) => {
  const email = watch('email');
  const password = watch('password');

  useEffect(() => {
    if (
      (email === '' && password === '') ||
      (email !== '' && password !== '')
    ) {
      clearError('emailpassword');
    } else {
      setError('emailpassword', 'both');
    }
  }, [email, password, clearError, setError]);

  return (
    <>
      <div className={styles.emailWrapper}>
        <Field
          name="email"
          label="Email/Password (optional)"
          aria-label="Email"
          type="text"
          inputRef={register({ pattern: EMAIL_REGEX })}
        />
        <Field
          name="password"
          type="text"
          aria-label="Password"
          inputRef={register}
        />
      </div>
      <Typography className={styles.error} use="body2" theme="error">
        {getErrorText(errors)}
      </Typography>
    </>
  );
};

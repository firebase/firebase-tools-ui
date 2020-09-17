import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';

// Consistent with the Auth JS SDK and the Auth Emulator.
const EMAIL_REGEX = /^[^@]+@[^@]+$/;
const PASSWORD_MIN_LENGTH = 6;

function getErrorText(errors: any) {
  if (errors) {
    if (errors.email) {
      return 'Invalid email';
    }
    if (errors.emailpassword) {
      return 'Both email and password should be present';
    }
    if (errors.password) {
      return `Password should be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
  }
}

export type EmailPasswordProps = FormContextValues<AddAuthUserPayload> & {
  isEditing: boolean;
};
export const EmailPassword: React.FC<EmailPasswordProps> = ({
  isEditing,
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
      (email !== '' && password !== '') ||
      isEditing
    ) {
      // TODO(kirjs):
      clearError('emailpassword' as any);
    } else {
      setError('emailpassword' as any, 'both');
    }
  }, [email, password, clearError, setError, isEditing]);

  return (
    <>
      <div className={styles.emailWrapper}>
        <Field
          name="email"
          placeholder="Enter email"
          label="Email/Password"
          aria-label="Email"
          type="text"
          inputRef={register({ pattern: EMAIL_REGEX })}
        />
        <Field
          name="password"
          type="text"
          placeholder="Enter password"
          aria-label="Password"
          inputRef={register({ minLength: PASSWORD_MIN_LENGTH })}
        />
      </div>
      <Typography
        className={styles.error}
        use="body2"
        role="alert"
        theme="error"
      >
        {getErrorText(errors)}
      </Typography>
    </>
  );
};

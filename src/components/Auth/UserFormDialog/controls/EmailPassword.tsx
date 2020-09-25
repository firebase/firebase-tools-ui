import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllEmails } from '../../../../store/auth/selectors';
import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';

// Consistent with the Auth JS SDK and the Auth Emulator.
const EMAIL_REGEX = /^[^@]+@[^@]+$/;
const PASSWORD_MIN_LENGTH = 6;

function getErrorText(errors: any) {
  if (errors.email) {
    if (errors.email.type === 'pattern') {
      return 'Invalid email';
    }
    if (errors.email.type === 'validate') {
      return 'User with this email already exists';
    }
  }

  if (errors.emailpassword) {
    return 'Both email and password should be present';
  }
  if (errors.password) {
    return `Password should be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
}

export type EmailPasswordProps = FormContextValues<AddAuthUserPayload> &
  PropsFromState;
export const EmailPassword: React.FC<EmailPasswordProps> = ({
  register,
  watch,
  setError,
  clearError,
  errors,
  allEmails,
}) => {
  const email = watch('email');
  const password = watch('password');

  useEffect(() => {
    if (
      (email === '' && password === '') ||
      (email !== '' && password !== '')
    ) {
      clearError('emailpassword' as any);
    } else {
      setError('emailpassword' as any, 'both');
    }
  }, [email, password, clearError, setError]);

  function validate(value: string) {
    return !allEmails.has(value);
  }

  return (
    <>
      <Typography use="body1" tag="div" className={styles.authKindLabel}>
        Email authentication
      </Typography>
      <div className={styles.emailWrapper}>
        <Field
          name="email"
          placeholder="Enter email"
          label="Email"
          type="text"
          inputRef={register({ validate, pattern: EMAIL_REGEX })}
        />
        <Field
          name="password"
          type="text"
          label="Password"
          placeholder="Enter password"
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

export const mapStateToProps = createStructuredSelector({
  allEmails: getAllEmails,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(EmailPassword);

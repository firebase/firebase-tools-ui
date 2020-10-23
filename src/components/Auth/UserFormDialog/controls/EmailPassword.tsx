import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllEmails, isEditingUser } from '../../../../store/auth/selectors';
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

export type EmailPasswordProps = PropsFromState & { editedUserEmail?: string };
export const EmailPassword: React.FC<EmailPasswordProps &
  FormContextValues<AddAuthUserPayload>> = ({
  register,
  watch,
  setError,
  clearError,
  errors,
  allEmails,
  editedUserEmail,
  isEditing,
}) => {
  const email = watch('email');
  const password = watch('password');

  useEffect(() => {
    if (
      (email === '' && password === '') ||
      (email !== '' && (password !== '' || isEditing))
    ) {
      clearError('emailpassword' as any);
    } else {
      setError('emailpassword' as any, 'both');
    }
  }, [email, password, clearError, setError, isEditing]);

  function validate(value: string) {
    return value === editedUserEmail || !allEmails.has(value);
  }

  return (
    <>
      <Typography
        use="body1"
        tag="div"
        className={styles.authKindLabel}
        theme="textPrimaryOnBackground"
      >
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
  isEditing: isEditingUser,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(EmailPassword);

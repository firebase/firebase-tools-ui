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

import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
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
export const EmailPassword: React.FC<
  React.PropsWithChildren<
    EmailPasswordProps & UseFormReturn<AddAuthUserPayload>
  >
> = ({
  register,
  watch,
  setError,
  clearErrors,
  formState: { errors },
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
      clearErrors('emailpassword' as any);
    } else {
      setError('emailpassword' as any, { message: 'both' });
    }
  }, [email, password, clearErrors, setError, isEditing]);

  function validate(value?: string) {
    return value === editedUserEmail || !allEmails.has(value);
  }

  const { ref: passwordRef, ...passwordState } = register('password', {
    minLength: PASSWORD_MIN_LENGTH,
  });

  const { ref: emailRef, ...emailState } = register('email', {
    validate,
    pattern: EMAIL_REGEX,
  });

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
          placeholder="Enter email"
          label="Email"
          type="text"
          inputRef={emailRef}
          {...emailState}
        />
        <Field
          type="text"
          label="Password"
          placeholder="Enter password"
          inputRef={passwordRef}
          {...passwordState}
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

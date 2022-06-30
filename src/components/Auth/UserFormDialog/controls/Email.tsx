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

import classNames from 'classnames';
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllEmails, isEditingUser } from '../../../../store/auth/selectors';
import { Field, SwitchField } from '../../../common/Field';
import { AuthFormUser } from '../../types';
import styles from './controls.module.scss';

// Consistent with the Auth JS SDK and the Auth Emulator.
const EMAIL_REGEX = /^[^@]+@[^@]+$/;

function getErrorText(errors: any) {
  if (errors.email) {
    if (errors.email.type === 'pattern') {
      return 'Invalid email';
    }
    if (errors.email.type === 'unique') {
      return 'User with this email already exists';
    }
  }
  if (errors.emailVerified?.type === 'emailPresent') {
    return 'Email required for verification';
  }
}

export const Email: React.FC<
  React.PropsWithChildren<PropsFromState & UseFormReturn<AuthFormUser>>
> = ({
  register,
  getValues,
  formState: { errors },
  allEmails,
  watch,
  setError,
  clearErrors,
}) => {
  const { ref: emailRef, ...emailState } = register('email', {
    validate: {
      unique: (value) => {
        const { email } = getValues();
        return value === email || !allEmails.has(value);
      },
    },
    pattern: EMAIL_REGEX,
  });

  const { ref: emailVerifiedRef, ...emailVerifiedState } = register(
    'emailVerified'
  );

  const email = watch('email');
  // TODO: emailVerified is a boolean instead of [] | ['on'] as defined
  // on type of AuthFormUser.
  const emailVerified = watch('emailVerified');

  useEffect(() => {
    if (emailVerified && !email) {
      setError('emailVerified', { type: 'emailPresent' });
    } else {
      clearErrors('emailVerified');
    }
  }, [emailVerified, email, setError, clearErrors]);

  return (
    <>
      <div
        className={classNames(
          styles.emailWrapper,
          getErrorText(errors) && styles.showError
        )}
      >
        <Field
          placeholder="Enter email (optional)"
          label="Email (optional)"
          type="text"
          inputRef={emailRef}
          error={getErrorText(errors)}
          {...emailState}
        />
        <SwitchField
          label="Verified email?"
          switchLabel={emailVerified ? 'Verified' : 'Not Verified'}
          defaultChecked={false}
          inputRef={emailVerifiedRef}
          className={styles.switchField}
          fieldClassName={styles.switch}
          {...emailVerifiedState}
        />
      </div>
    </>
  );
};

export const mapStateToProps = createStructuredSelector({
  allEmails: getAllEmails,
  isEditing: isEditingUser,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(Email);

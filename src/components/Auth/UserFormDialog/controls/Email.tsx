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
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
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
    if (errors.email.type === 'validate') {
      return 'User with this email already exists';
    }
  }

  if (errors.cannotVerifyWithoutEmail) {
    return 'Email required for verification';
  }
}

const Email: React.FC<PropsFromState & FormContextValues<AuthFormUser>> = ({
  register,
  watch,
  setError,
  clearError,
  errors,
  allEmails,
}) => {
  const email = watch('email');

  const emailVerifiedArr = watch('emailVerified');
  const emailVerified = emailVerifiedArr && emailVerifiedArr.length > 0;

  function validate(value: string) {
    return value === email || !allEmails.has(value);
  }

  useEffect(() => {
    if (emailVerified && !email) {
      setError('cannotVerifyWithoutEmail', 'verifyingNonexistentEmail');
    } else {
      clearError('cannotVerifyWithoutEmail');
    }
  }, [emailVerified, email, setError, clearError]);

  return (
    <>
      <div
        className={classNames(
          styles.emailWrapper,
          getErrorText(errors) && styles.showError
        )}
      >
        <Field
          name="email"
          placeholder="Enter email (optional)"
          label="Email (optional)"
          type="text"
          inputRef={register({ validate, pattern: EMAIL_REGEX })}
          error={getErrorText(errors)}
        />
        <SwitchField
          name="emailVerified"
          label="Verified email?"
          switchLabel={emailVerified ? 'Verified' : 'Not Verified'}
          defaultChecked={false}
          inputRef={register()}
          className={styles.switchField}
          fieldClassName={styles.switch}
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

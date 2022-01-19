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
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllEmails, isEditingUser } from '../../../../store/auth/selectors';
import { Field } from '../../../common/Field';
import { AuthFormUser } from '../../types';
import styles from './controls.module.scss';

// Consistent with the Auth JS SDK and the Auth Emulator.
const PASSWORD_MIN_LENGTH = 6;

function getErrorText(errors: any) {
  if (errors.emailpassword) {
    return 'Email is required for password authentication';
  }
  if (errors.password) {
    return `Password should be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
}

export type PasswordProps = PropsFromState & { editedUserEmail?: string };
export const Password: React.FC<
  PasswordProps & FormContextValues<AuthFormUser>
> = ({
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
    if (password !== '' && email === '') {
      setError('emailpassword' as any, 'both');
    } else {
      clearError('emailpassword' as any);
    }
  }, [email, password, clearError, setError, isEditing]);

  return (
    <>
      <Typography
        use="body1"
        tag="div"
        className={styles.sectionSubHeader}
        theme="textPrimaryOnBackground"
      >
        Password authentication
      </Typography>
      <Field
        name="password"
        type="text"
        label="Password"
        placeholder="Enter password"
        inputRef={register({ minLength: PASSWORD_MIN_LENGTH })}
        error={getErrorText(errors)}
      />
    </>
  );
};

export const mapStateToProps = createStructuredSelector({
  allEmails: getAllEmails,
  isEditing: isEditingUser,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(Password);

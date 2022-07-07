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

import React from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
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
    if (errors.email.type === 'emailPresent') {
      return 'Email required for verification';
    }
  }
}

function getVerifiedStatus(emailVerifiedError: [] | [FieldError?] | undefined) {
  if (!emailVerifiedError) {
    return 'Verified';
  }

  return emailVerifiedError[0]?.type === 'verified'
    ? 'Not verified'
    : 'Verified';
}

export type EmailProps = PropsFromState & { editedUserEmail?: string };
export const Email: React.FC<
  React.PropsWithChildren<EmailProps & UseFormReturn<AuthFormUser>>
> = ({
  register,
  getValues,
  formState: { errors },
  allEmails,
  editedUserEmail,
  isEditing,
}) => {
  const { ref: emailRef, ...emailState } = register('email', {
    validate: {
      unique: (value) => value === editedUserEmail || !allEmails.has(value),
      emailPresent: (value) => {
        const { emailVerified: emailVerifiedArr } = getValues();
        const emailVerified = emailVerifiedArr && emailVerifiedArr.length > 0;

        return !!value || !emailVerified;
      },
    },
    pattern: EMAIL_REGEX,
  });

  const { ref: emailVerifiedRef, ...emailVerifiedState } = register(
    'emailVerified',
    {
      validate: {
        verified: (value) => !!value,
      },
    }
  );

  return (
    <>
      <div className={styles.emailWrapper}>
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
          switchLabel={getVerifiedStatus(errors.emailVerified)}
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

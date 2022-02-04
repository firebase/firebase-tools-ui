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

import { ListDivider } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { AddAuthUserPayload, AuthFormUser } from '../../types';
import styles from './controls.module.scss';
import Password from './Password';
import PhoneControl from './PhoneControl';

const ERROR_AT_LEAST_ONE_METHOD_REQUIRED = 'atLeastOneMethodRequired';

export type SignInMethodProps = {
  user?: AddAuthUserPayload;
};
export const SignInMethod: React.FC<
  SignInMethodProps & FormContextValues<AuthFormUser>
> = (form) => {
  const { watch, setError, clearError, formState, errors, user } = form;
  const password = watch('password');
  const phoneNumber = watch('phoneNumber');

  const isTouched: boolean = !!(
    formState.touched['password'] || formState.touched['phoneNumber']
  );

  useEffect(() => {
    const hasPassword = password !== '';
    const hasPhone = !!phoneNumber;

    if (hasPassword || hasPhone) {
      // According to docs ClearError should accept arbitrary key
      // to allow cross-field validation, but it's not the case here for some
      // reason.
      clearError(ERROR_AT_LEAST_ONE_METHOD_REQUIRED as any);
    } else {
      setError(ERROR_AT_LEAST_ONE_METHOD_REQUIRED as any);
    }
  }, [password, clearError, setError, phoneNumber, errors]);

  const isOnlyError =
    ERROR_AT_LEAST_ONE_METHOD_REQUIRED in errors &&
    Object.values(errors).length === 1;

  return (
    <div className={styles.signInWrapper}>
      <ListDivider tag="div" />
      <div className={styles.sectionHeader}>
        <Typography use="body1" theme="textPrimaryOnBackground">
          Authentication method
        </Typography>
        {isTouched && isOnlyError ? (
          <Typography use="body2" theme="error" tag="div" role="alert">
            One method is required. Please enter either an email/password or
            phone number.
          </Typography>
        ) : (
          <Typography use="body2" tag="div">
            Enter details for at least one of the following methods:
          </Typography>
        )}
      </div>
      <Password {...form} />
      <PhoneControl {...form} editedUserPhoneNumber={user?.phoneNumber} />
    </div>
  );
};

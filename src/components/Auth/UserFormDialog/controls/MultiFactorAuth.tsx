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

import { Button } from '@rmwc/button';
import { ListDivider } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { CheckboxField, Field } from '../../../common/Field';
import { AddAuthUserPayload, AuthFormUser } from '../../types';
import styles from './controls.module.scss';
import PhoneControl from './PhoneControl';

// Consistent with the back-end validation. We want to be as loose as possible in
// the emulator to avoid false negatives.
const PHONE_REGEX = /^\+/;

export type MultiFactorProps = {
  user?: AddAuthUserPayload;
};

export const MultiFactor: React.FC<
  MultiFactorProps & FormContextValues<AuthFormUser>
> = (form) => {
  const {
    control,
    watch,
    setError,
    clearError,
    formState,
    errors,
    user,
    register,
    setValue,
  } = form;

  // https://react-hook-form.com/v5/api#useFieldArray
  const { fields, append } = useFieldArray({
    control,
    name: 'mfaPhoneInfo',
  });

  const emailVerified = watch('emailVerified');
  const mfaEnabled = watch('mfaEnabled');

  function getErrorText() {
    if (errors.phoneNumber) {
      if (errors.phoneNumber.type === 'pattern') {
        return 'Phone number must be in international format and start with a "+"';
      }
    }
  }

  function addNewMfaNumber() {
    append({ phoneInfo: '' });
  }

  return (
    <div className={styles.signInWrapper}>
      <ListDivider tag="div" />
      <div className={styles.signInHeader}>
        <Typography use="body1" theme="textPrimaryOnBackground">
          Multi-factor Authentication
        </Typography>
      </div>
      <CheckboxField
        name="mfaEnabled"
        label="Enabled"
        defaultChecked={false}
        disabled={!emailVerified || emailVerified.length === 0}
        inputRef={register()}
      />

      <Typography use="body2" tag="div">
        SMS settings
      </Typography>
      {mfaEnabled &&
        mfaEnabled.length > 0 &&
        fields.map((item, index) => {
          return (
            <Field
              key={item.id}
              name={`mfaPhoneInfo.${index}.phoneInfo`}
              label="Phone"
              placeholder="Enter phone number"
              type="tel"
              error={getErrorText()}
              inputRef={register({ pattern: PHONE_REGEX })}
            />
          );
        })}
      <Button
        type="button"
        outlined={true}
        disabled={!mfaEnabled || mfaEnabled.length === 0}
        onClick={addNewMfaNumber}
      >
        Add new
      </Button>
    </div>
  );
};

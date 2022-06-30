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
import { IconButton } from '@rmwc/icon-button';
import { ListDivider } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';

import { Field, SwitchField } from '../../../common/Field';
import { AddAuthUserPayload, AuthFormUser } from '../../types';
import styles from './controls.module.scss';

// Consistent with the back-end validation. We want to be as loose as possible in
// the emulator to avoid false negatives.
const PHONE_REGEX = /^\+/;

export type MultiFactorProps = {
  user?: AddAuthUserPayload;
};

function addNewMfaNumber(add: (newMfaInfo: { phoneInfo: string }) => void) {
  return add({ phoneInfo: '' });
}

export const MultiFactor: React.FC<
  MultiFactorProps & UseFormReturn<AuthFormUser>
> = (form) => {
  const {
    control,
    formState: { errors },
    user,
    register,
    getValues,
    watch,
    setError,
    clearErrors,
  } = form;

  // https://react-hook-form.com/v5/api#useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mfaPhoneInfo',
  });

  const [isZeroState, setIsZeroState] = useState(
    !(user?.mfaInfo && user?.mfaInfo.length > 0)
  );

  // TODO: mfaEnabled is a boolean instead of [] | ['on'] as defined
  // on type of AuthFormUser
  const { ref: mfaEnabledRef, ...mfaEnabledArrState } = register('mfaEnabled', {
    onChange: (event) => {
      const mfaEnabled = getValues('mfaEnabled');
      if (mfaEnabled && fields.length === 0) {
        addNewMfaNumber(append);
      }
      setIsZeroState(false);
    },
  });

  const mfaEnabled = watch('mfaEnabled');
  const emailVerified = watch('emailVerified');

  useEffect(() => {
    if (mfaEnabled) {
      if (!emailVerified) {
        setError('mfaEnabled', { type: 'verified' });
      } else {
        clearErrors('mfaEnabled');
      }
    }
  }, [mfaEnabled, emailVerified, setError, clearErrors]);

  return (
    <div className={styles.signInWrapper}>
      <ListDivider tag="div" />
      <div className={styles.sectionHeader}>
        <Typography use="body1" theme="textPrimaryOnBackground">
          Multi-factor Authentication
        </Typography>
      </div>

      <SwitchField
        label=""
        switchLabel={mfaEnabled ? 'Enabled' : 'Disabled'}
        defaultChecked={false}
        inputRef={mfaEnabledRef}
        {...mfaEnabledArrState}
      />

      {(errors as any).mfaEnabled?.type === 'verified' ? (
        <Typography use="body2" theme="error" tag="div" role="alert">
          Email needs to be verified to enroll in multi-factor authentication
        </Typography>
      ) : null}

      {(mfaEnabled || !isZeroState) && (
        <>
          <Typography
            use="body1"
            tag="div"
            className={styles.sectionSubHeader}
            theme="textPrimaryOnBackground"
          >
            SMS Settings
          </Typography>
          <div>
            {fields.map((item, index) => {
              const fieldName = `mfaPhoneInfo.${index}.phoneInfo` as const;

              const getPhoneErrorText = () => {
                const error = errors.mfaPhoneInfo?.[index];
                if (error && (error as any).phoneInfo) {
                  if ((error as any).phoneInfo.type === 'pattern') {
                    return 'Phone number must be in international format and start with a "+"';
                  } else if ((error as any).phoneInfo.type === 'required') {
                    return 'Phone number is required';
                  } else {
                    return (error as any).phoneInfo.message;
                  }
                }
              };

              const { ref: phoneRef, ...phoneState } = register(fieldName, {
                pattern: PHONE_REGEX,
                // TODO: Required error is not getting triggered when MFA
                // and emailVerified are true, and email is present
                required: !!mfaEnabled,
              });

              return (
                <div
                  key={item.id}
                  className={classNames(
                    styles.smsWrapper,
                    getPhoneErrorText() && styles.showError
                  )}
                >
                  <Field
                    label="Phone number"
                    placeholder="Enter phone number"
                    type="tel"
                    error={getPhoneErrorText()}
                    disabled={!mfaEnabled}
                    inputRef={phoneRef}
                    defaultValue={item.phoneInfo}
                    {...phoneState}
                  />
                  <div className={styles.deleteButtonContainer}>
                    <IconButton
                      type="button"
                      icon="delete_outline"
                      onClick={() => remove(index)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            outlined={true}
            disabled={!mfaEnabled}
            onClick={() => addNewMfaNumber(append)}
          >
            Add another phone number
          </Button>
        </>
      )}
    </div>
  );
};

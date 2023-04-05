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
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Field } from '../../../common/Field';
import { AuthFormUser } from '../../types';
import styles from './controls.module.scss';
import { validateSerializedCustomClaims } from './customClaimsValidation';

function validate(attributes?: string) {
  if (attributes === '') {
    return true;
  }

  try {
    // We're reusing server validation.
    validateSerializedCustomClaims(attributes);
    return true;
  } catch (e: any) {
    if (e.message === 'INVALID_CLAIMS') {
      return 'Custom claims must be a valid JSON object';
    }
    if (e.message === 'CLAIMS_TOO_LARGE') {
      return 'Custom claims length must not exceed 1000 characters';
    }
    const forbiddenClaim = e.message.match(/FORBIDDEN_CLAIM : (\w+)$/);
    if (forbiddenClaim && forbiddenClaim[1]) {
      return 'Custom claims must not have forbidden key: ' + forbiddenClaim[1];
    }
  }
}

const CUSTOM_ATTRIBUTES_CONTROL_NAME = 'customAttributes';

export const CustomAttributes: React.FC<
  React.PropsWithChildren<UseFormReturn<AuthFormUser>>
> = ({ formState: { errors }, register }) => {
  const label = (
    <label>
      <Typography use="subtitle2" tag="div" theme="textPrimaryOnBackground">
        Custom claims (optional)
      </Typography>
    </label>
  );

  const { ref: customAttributesRef, ...customAttributesField } = register(
    'customAttributes',
    { validate }
  );

  return (
    <div className={styles.customAttributesWrapper}>
      <Field
        inputRef={customAttributesRef}
        error={errors[CUSTOM_ATTRIBUTES_CONTROL_NAME]?.message}
        label={label}
        textarea
        placeholder={`Enter valid json, e.g. {"role":"admin"}`}
        {...customAttributesField}
      />
      <Typography use="body2">
        These custom key:value attributes can be used with Rules to implement
        various access control strategies (e.g. based on roles).{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://firebase.google.com/docs/auth/admin/custom-claims"
          aria-label="Learn more about custom key value attributes."
        >
          Learn more
        </a>
      </Typography>
    </div>
  );
};

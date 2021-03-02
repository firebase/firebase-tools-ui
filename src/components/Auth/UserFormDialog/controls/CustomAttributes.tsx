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
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';
import { validateSerializedCustomClaims } from './customClaimsValidation';

function validate(attributes: string) {
  if (attributes === '') {
    return true;
  }

  try {
    // We're reusing server validation.
    validateSerializedCustomClaims(attributes);
    return true;
  } catch (e) {
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
  FormContextValues<AddAuthUserPayload>
> = ({ errors, register }) => {
  const label = (
    <label>
      <Typography use="subtitle2" tag="div" theme="textPrimaryOnBackground">
        Custom Claims (optional)
      </Typography>
    </label>
  );
  return (
    <div className={styles.customAttributesWrapper}>
      <Field
        inputRef={register({ validate })}
        error={errors[CUSTOM_ATTRIBUTES_CONTROL_NAME]?.message}
        name={CUSTOM_ATTRIBUTES_CONTROL_NAME}
        label={label}
        textarea
        placeholder={`Enter valid json, e.g. {"role":"admin"}`}
      />
      <Typography use="body2">
        These custom key:value attributes can be used with Rules to implement
        various access control strategies (e.g. based on roles){' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://firebase.google.com/docs/auth/admin/custom-claims"
        >
          Learn more
        </a>
      </Typography>
    </div>
  );
};

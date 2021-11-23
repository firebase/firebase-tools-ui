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

import { Checkbox } from '@rmwc/checkbox';
import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllEmails, isEditingUser } from '../../../../store/auth/selectors';
import { CheckboxField, Field } from '../../../common/Field';
import { AuthFormUser } from '../../types';
import styles from './controls.module.scss';

export const EmailVerified: React.FC<FormContextValues<AuthFormUser>> = ({
  register,
  watch,
  setError,
  clearError,
  errors,
  formState,
}) => {
  const email = watch('email');
  return (
    <>
      <CheckboxField
        name="emailVerified"
        label="Email verified"
        defaultChecked={false}
        disabled={!email}
        inputRef={register()}
      />
    </>
  );
};

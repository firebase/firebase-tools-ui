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
import EmailVerified from './EmailVerified';
import PhoneControl from './PhoneControl';

const ERROR_AT_LEAST_ONE_METHOD_REQUIRED = 'atLeastOneMethodRequired';

export type MultiFactorProps = {
  user?: AddAuthUserPayload;
};
export const MultiFactor: React.FC<
  MultiFactorProps & FormContextValues<AuthFormUser>
> = (form) => {
  const { watch, setError, clearError, formState, errors, user } = form;

  return (
    <div className={styles.signInWrapper}>
      <ListDivider tag="div" />
      <div className={styles.signInHeader}>
        <Typography use="body1" theme="textPrimaryOnBackground">
          Multi-factor Authentication
        </Typography>

        <Typography use="body2" tag="div">
          Make sign-in more secure
        </Typography>
      </div>
      <EmailVerified {...form} />
    </div>
  );
};

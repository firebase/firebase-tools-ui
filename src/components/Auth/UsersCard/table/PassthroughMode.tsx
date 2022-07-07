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

import styles from './UsersTable.module.scss';

export const PassthroughMode: React.FC = () => {
  return (
    <Typography
      use="body2"
      className={styles.noResultsWrapper}
      theme="textSecondaryOnBackground"
    >
      <span>
        The emulator does not save user data when passthrough mode is enabled.{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://firebase.google.com/docs/auth/passthrough"
        >
          Learn more
        </a>
      </span>
    </Typography>
  );
};

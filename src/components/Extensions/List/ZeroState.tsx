/**
 * Copyright 2022 Google LLC
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

import styles from './ZeroState.module.scss';

export const ZeroState: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <div className={styles.wrapper}>
      <Typography
        use="body2"
        className={styles.noResultsWrapper}
        theme="textSecondaryOnBackground"
      >
        No extensions for this project yet
      </Typography>
    </div>
  );
};

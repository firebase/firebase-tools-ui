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

import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import React from 'react';

import { CustomThemeProvider } from '../../themes';
import styles from './StatusLabel.module.scss';

const ACTIVE_ICON = {
  icon: 'check_circle',
  size: 'xsmall',
};

const INACTIVE_ICON = {
  icon: 'block',
  size: 'xsmall',
};

/** A basic On/Off label with icon */
export const StatusLabel: React.FC<{
  isActive: boolean;
}> = ({ isActive }) => {
  return (
    <CustomThemeProvider use={isActive ? 'success' : 'note'} wrap>
      <Typography
        use="headline6"
        tag="div"
        theme={isActive ? 'primary' : 'secondary'}
        className={styles.container}
      >
        {isActive ? 'On' : 'Off'}
        <Icon
          icon={isActive ? ACTIVE_ICON : INACTIVE_ICON}
          className={styles.icon}
        />
      </Typography>
    </CustomThemeProvider>
  );
};
